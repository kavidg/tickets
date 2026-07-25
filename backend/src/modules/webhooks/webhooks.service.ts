/**
 * TicketS - WebhookService
 *
 * Servicio de webhook responsable de procesar eventos de pago
 * provenientes de proveedores como Bold, Stripe, MercadoPago, etc.
 *
 * Flujo de procesamiento:
 *   1. Buscar Purchase por paymentReference.
 *   2. Validar que la Purchase existe y sigue en estado 'pending'.
 *   3. Según el status del evento:
 *      - approved   → confirmReservation + (futuro) generar tickets
 *      - declined   → releaseReservation
 *      - expired    → releaseReservation
 *      - cancelled  → releaseReservation
 *   4. Actualizar Purchase con nuevo status + paymentCompletedAt.
 *
 * Idempotencia:
 *   Si la Purchase ya está en el estado final correspondiente al evento
 *   (ej: ya está 'paid' y llega otro webhook 'approved'), retorna OK
 *   sin re-ejecutar la lógica.
 *
 * @see PaymentWebhookEvent para el formato estandarizado de eventos.
 * @see InventoryService para la gestión de reservas.
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { COLLECTIONS } from '../../constants/collections';
import { Timestamps } from '../../common/utils/timestamps';
import { InventoryService } from '../inventory/inventory.service';
import { TicketsService } from '../tickets/tickets.service';
import { EmailService } from '../email/email.service';
import type { TicketEmailData } from '../email/email.service';
import type { PaymentWebhookEvent } from './interfaces/payment-webhook.interface';
import type { InventoryReservationItem } from '../inventory/interfaces/inventory-reservation.interface';
import type { Purchase } from '../purchases/interfaces/purchase.interface';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly firebase: FirebaseAdminService,
    private readonly inventoryService: InventoryService,
    private readonly ticketsService: TicketsService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Procesa un evento de webhook de pago.
   *
   * @param event - Evento de webhook estandarizado.
   *
   * @throws NotFoundException si la Purchase no existe.
   */
  async processPaymentEvent(event: PaymentWebhookEvent): Promise<void> {
    const { paymentReference, status, transactionId } = event;

    // 1. Buscar Purchase por checkoutReference (enviado a Bold como data-order-id)
    const purchaseSnapshot = await this.firebase.db
      .collection(COLLECTIONS.PURCHASES)
      .where('checkoutReference', '==', paymentReference)
      .limit(1)
      .get();

    if (purchaseSnapshot.empty) {
      throw new NotFoundException(
        `Compra con checkoutReference "${paymentReference}" no encontrada.`,
      );
    }

    const purchaseDoc = purchaseSnapshot.docs[0];
    const purchase = { id: purchaseDoc.id, ...purchaseDoc.data() } as Purchase;

    this.logger.log(
      `Processing webhook for purchase ${purchase.id}: ${status} (txn: ${transactionId})`,
    );

    // 2. Procesar según el estado del evento
    switch (status) {
      case 'approved':
        await this.handleApproved(purchase, transactionId);
        break;
      case 'declined':
        await this.handleFailed(purchase, transactionId, 'failed');
        break;
      case 'expired':
        await this.handleFailed(purchase, transactionId, 'expired');
        break;
      case 'cancelled':
        await this.handleFailed(purchase, transactionId, 'cancelled');
        break;
      default:
        this.logger.warn(`Unknown webhook status: ${status}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Handlers privados
  // ---------------------------------------------------------------------------

  /**
   * Maneja un pago aprobado.
   * - Idempotente: si ya está 'paid', no re-ejecuta.
   * - Confirma la reserva en InventoryService.
   * - Marca la Purchase como 'paid' con paymentCompletedAt.
   * - (Futuro) Genera tickets.
   */
  private async handleApproved(
    purchase: Purchase,
    transactionId: string,
  ): Promise<void> {
    // Idempotencia: si ya está pagada, no re-ejecutar
    if (purchase.status === 'paid') {
      this.logger.log(
        `Purchase ${purchase.id} already paid. Skipping (idempotent).`,
      );
      return;
    }

    // Confirmar reserva en inventario
    const items: InventoryReservationItem[] = purchase.items.map((item) => ({
      ticketTypeId: item.ticketTypeId,
      quantity: item.quantity,
    }));

    await this.inventoryService.confirmReservation(items);

    // Actualizar Purchase
    await this.firebase.db
      .collection(COLLECTIONS.PURCHASES)
      .doc(purchase.id)
      .update({
        status: 'paid',
        paymentCompletedAt: Timestamps.serverTimestamp(),
        transactionId,
        updatedAt: Timestamps.serverTimestamp(),
      });

    this.logger.log(
      `Purchase ${purchase.id} confirmed as PAID (txn: ${transactionId})`,
    );

    // Generar tickets digitales
    // NOTA: Re-leer la purchase después del update para obtener status 'paid'
    try {
      const freshSnap = await this.firebase.db
        .collection(COLLECTIONS.PURCHASES)
        .doc(purchase.id)
        .get();
      const updatedPurchase = {
        id: freshSnap.id,
        ...freshSnap.data(),
      } as Purchase;

      const tickets = await this.ticketsService.createTicketsFromPurchase(updatedPurchase);

      // Marcar la compra como con tickets generados
      // (se hace en una actualización separada para no mezclar con createTicketsFromPurchase)
      await this.firebase.db
        .collection(COLLECTIONS.PURCHASES)
        .doc(purchase.id)
        .update({
          ticketsGenerated: true,
        });

      this.logger.log(
        `Tickets generated for purchase ${purchase.id}: ${tickets.length} tickets`,
      );

      // Enviar correo con las entradas al comprador
      await this.sendPurchaseEmail(purchase, tickets);
    } catch (ticketError) {
      // Error generando tickets — no bloquear el flujo de pago
      // Los tickets podrán regenerarse manualmente
      this.logger.error(
        `Error generating tickets for purchase ${purchase.id}: ${(ticketError as Error).message}`,
      );
    }
  }

  /**
   * Envía un correo al comprador con las entradas generadas.
   * No interrumpe el flujo si falla — solo registra el error.
   */
  private async sendPurchaseEmail(
    purchase: Purchase,
    tickets: Array<{ id: string; code: string; ticketTypeId: string }>,
  ): Promise<void> {
    const buyerName = purchase.buyerName || purchase.buyerEmail || 'Comprador';
    const buyerEmail = purchase.buyerEmail;

    if (!buyerEmail) {
      this.logger.warn(`No buyer email for purchase ${purchase.id}. Skipping email.`);
      return;
    }

    // Obtener nombres de ticket types desde Firestore
    const ticketTypeNames = new Map<string, string>();
    for (const item of purchase.items) {
      try {
        const ttSnap = await this.firebase.db
          .collection(COLLECTIONS.TICKET_TYPES)
          .doc(item.ticketTypeId)
          .get();
        if (ttSnap.exists) {
          const ttData = ttSnap.data();
          ticketTypeNames.set(item.ticketTypeId, (ttData?.name as string) || item.ticketName);
        } else {
          ticketTypeNames.set(item.ticketTypeId, item.ticketName);
        }
      } catch {
        ticketTypeNames.set(item.ticketTypeId, item.ticketName);
      }
    }

    // Obtener datos del evento
    let eventTitle = 'Evento';
    let eventDate = '';
    let venueName = '';
    try {
      const eventSnap = await this.firebase.db
        .collection(COLLECTIONS.EVENTS)
        .doc(purchase.eventId)
        .get();
      if (eventSnap.exists) {
        const eventData = eventSnap.data()!;
        eventTitle = (eventData.title as string) || 'Evento';
        // startDate puede ser Timestamp de Firestore o string ISO
        const rawDate = eventData.startDate;
        if (rawDate && typeof (rawDate as any).toDate === 'function') {
          eventDate = (rawDate as any).toDate().toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        } else if (rawDate) {
          eventDate = String(rawDate);
        }
        venueName = (eventData.venueName as string) || (eventData.city as string) || '';
      }
    } catch {
      // Usar valores por defecto
    }

    const emailData: TicketEmailData = {
      buyerName,
      buyerEmail,
      eventTitle,
      eventDate,
      venueName,
      tickets: tickets.map((t) => ({
        code: t.code,
        ticketTypeName: ticketTypeNames.get(t.ticketTypeId) || 'Entrada',
      })),
    };

    await this.emailService.sendTicketsEmail(emailData);
  }

  /**
   * Maneja un pago fallido, expirado o cancelado.
   * - Idempotente: si ya está en el estado final, no re-ejecuta.
   * - Libera la reserva en InventoryService.
   * - Marca la Purchase con el nuevo status.
   */
  private async handleFailed(
    purchase: Purchase,
    transactionId: string,
    newStatus: 'failed' | 'expired' | 'cancelled',
  ): Promise<void> {
    // Idempotencia: si ya está en el estado final, no re-ejecutar
    const finalStatuses = ['paid', 'failed', 'expired', 'cancelled'];
    if (finalStatuses.includes(purchase.status)) {
      this.logger.log(
        `Purchase ${purchase.id} already in status "${purchase.status}". Skipping (idempotent).`,
      );
      return;
    }

    // Liberar reserva en inventario
    const items: InventoryReservationItem[] = purchase.items.map((item) => ({
      ticketTypeId: item.ticketTypeId,
      quantity: item.quantity,
    }));

    await this.inventoryService.releaseReservation(items);

    // Actualizar Purchase
    await this.firebase.db
      .collection(COLLECTIONS.PURCHASES)
      .doc(purchase.id)
      .update({
        status: newStatus,
        transactionId,
        updatedAt: Timestamps.serverTimestamp(),
      });

    this.logger.log(
      `Purchase ${purchase.id} updated to ${newStatus} (txn: ${transactionId})`,
    );
  }
}
