/**
 * TicketS - InventoryService
 *
 * Servicio interno de gestión de inventario de entradas.
 * NO tiene controller — solo es inyectable por otros servicios.
 *
 * Responsabilidades:
 * - Reservar entradas temporalmente durante una compra en estado "pending".
 * - Liberar reservas cuando una compra expira, falla o se cancela.
 * - Confirmar reservas cuando una compra es pagada (moviendo reservedQuantity a soldQuantity).
 * - Restaurar reservas expiradas (para Cloud Functions futuras).
 *
 * Todas las operaciones de modificación de stock se ejecutan dentro de
 * transacciones de Firestore para garantizar atomicidad y evitar sobreventa.
 *
 * Fórmula de disponibilidad:
 *   disponibles = quantity - soldQuantity - reservedQuantity
 *
 * @see PurchasesService para el servicio que consume este InventoryService.
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { COLLECTIONS } from '../../constants/collections';
import { Timestamps } from '../../common/utils/timestamps';
import type { InventoryReservationItem } from './interfaces/inventory-reservation.interface';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly firebase: FirebaseAdminService) {}

  /**
   * Reserva entradas temporalmente.
   *
   * Para cada TicketType en items[]:
   *   1. Lee el documento actual dentro de una transacción.
   *   2. Calcula disponibles = quantity - soldQuantity - reservedQuantity.
   *   3. Si no alcanza, la transacción aborta y se lanza BadRequestException.
   *   4. Si alcanza, incrementa reservedQuantity en la cantidad solicitada.
   *
   * Toda la operación es atómica mediante Firestore Transaction.
   *
   * @param items - Lista de ticketTypeId y quantity a reservar.
   *
   * @throws BadRequestException si no hay stock suficiente para algún item.
   */
  async reserveTickets(
    _purchaseId: string,
    _eventId: string,
    items: InventoryReservationItem[],
  ): Promise<void> {
    await this.firebase.db.runTransaction(async (transaction) => {
      for (const item of items) {
        const ticketTypeRef = this.firebase.db
          .collection(COLLECTIONS.TICKET_TYPES)
          .doc(item.ticketTypeId);

        const ticketTypeSnap = await transaction.get(ticketTypeRef);

        if (!ticketTypeSnap.exists) {
          throw new BadRequestException(
            `El tipo de entrada con ID "${item.ticketTypeId}" no existe.`,
          );
        }

        const ticketTypeData = ticketTypeSnap.data();
        if (!ticketTypeData) {
          throw new BadRequestException(
            `El tipo de entrada con ID "${item.ticketTypeId}" no tiene datos.`,
          );
        }

        // Validar que el ticket type está activo
        if (ticketTypeData.status !== 'active') {
          const statusLabels: Record<string, string> = {
            paused: 'pausado',
            sold_out: 'agotado',
            closed: 'cerrado',
          };
          throw new BadRequestException(
            `El tipo de entrada "${ticketTypeData.name}" no está disponible (${statusLabels[ticketTypeData.status] || ticketTypeData.status}).`,
          );
        }

        // Calcular disponibilidad considerando reservas existentes
        const quantity = ticketTypeData.quantity as number;
        const soldQuantity = ticketTypeData.soldQuantity as number || 0;
        const reservedQuantity = ticketTypeData.reservedQuantity as number || 0;
        const available = quantity - soldQuantity - reservedQuantity;

        if (available < item.quantity) {
          throw new BadRequestException(
            `No hay suficientes entradas disponibles para "${ticketTypeData.name}". ` +
              `Disponibles: ${available}, solicitadas: ${item.quantity}.`,
          );
        }

        // Incrementar reservedQuantity atómicamente
        transaction.update(ticketTypeRef, {
          reservedQuantity: reservedQuantity + item.quantity,
          updatedAt: Timestamps.serverTimestamp(),
        });
      }
    });

    this.logger.log(
      `Tickets reserved: ${items.map((i) => `${i.ticketTypeId}:${i.quantity}`).join(', ')}`,
    );
  }

  /**
   * Libera una reserva temporal.
   *
   * Disminuye reservedQuantity sin modificar soldQuantity.
   * Utilizado cuando una compra expira, falla o es cancelada.
   *
   * @param items - Lista de ticketTypeId y quantity a liberar.
   */
  async releaseReservation(items: InventoryReservationItem[]): Promise<void> {
    await this.firebase.db.runTransaction(async (transaction) => {
      for (const item of items) {
        const ticketTypeRef = this.firebase.db
          .collection(COLLECTIONS.TICKET_TYPES)
          .doc(item.ticketTypeId);

        const ticketTypeSnap = await transaction.get(ticketTypeRef);

        if (!ticketTypeSnap.exists) {
          this.logger.warn(
            `Cannot release reservation: ticket type "${item.ticketTypeId}" not found.`,
          );
          continue;
        }

        const ticketTypeData = ticketTypeSnap.data();
        const reservedQuantity = ticketTypeData?.reservedQuantity as number || 0;
        const newReserved = Math.max(0, reservedQuantity - item.quantity);

        transaction.update(ticketTypeRef, {
          reservedQuantity: newReserved,
          updatedAt: Timestamps.serverTimestamp(),
        });
      }
    });

    this.logger.log(
      `Reservation released: ${items.map((i) => `${i.ticketTypeId}:${i.quantity}`).join(', ')}`,
    );
  }

  /**
   * Confirma una reserva: libera reservedQuantity e incrementa soldQuantity.
   *
   * Este método debe ser llamado cuando Bold (o cualquier pasarela)
   * confirma el pago de una compra.
   *
   * @param items - Lista de ticketTypeId y quantity a confirmar.
   */
  async confirmReservation(items: InventoryReservationItem[]): Promise<void> {
    await this.firebase.db.runTransaction(async (transaction) => {
      for (const item of items) {
        const ticketTypeRef = this.firebase.db
          .collection(COLLECTIONS.TICKET_TYPES)
          .doc(item.ticketTypeId);

        const ticketTypeSnap = await transaction.get(ticketTypeRef);

        if (!ticketTypeSnap.exists) {
          this.logger.warn(
            `Cannot confirm reservation: ticket type "${item.ticketTypeId}" not found.`,
          );
          continue;
        }

        const ticketTypeData = ticketTypeSnap.data();
        const reservedQuantity = ticketTypeData?.reservedQuantity as number || 0;
        const soldQuantity = ticketTypeData?.soldQuantity as number || 0;

        const newReserved = Math.max(0, reservedQuantity - item.quantity);
        const newSold = soldQuantity + item.quantity;

        transaction.update(ticketTypeRef, {
          reservedQuantity: newReserved,
          soldQuantity: newSold,
          updatedAt: Timestamps.serverTimestamp(),
        });
      }
    });

    this.logger.log(
      `Reservation confirmed: ${items.map((i) => `${i.ticketTypeId}:${i.quantity}`).join(', ')}`,
    );
  }

  /**
   * Restaura reservas expiradas.
   *
   * Busca compras en estado "pending" cuya fecha de expiración ya haya pasado
   * y libera las reservas asociadas.
   *
   * Diseñado para ser ejecutado por una Cloud Function programada (cron),
   * aunque también puede ser invocado manualmente si es necesario.
   *
   * NOTA: Esta consulta utiliza dos filtros (status, expiresAt) y requiere
   * un índice compuesto en la colección `purchases`:
   *   - Campos: status ASC, expiresAt ASC
   *
   * @returns Número de compras expiradas procesadas.
   */
  async restoreExpiredReservations(): Promise<number> {
    const now = new Date();
    let processedCount = 0;

    try {
      // Buscar compras pending expiradas
      const expiredSnapshot = await this.firebase.db
        .collection(COLLECTIONS.PURCHASES)
        .where('status', '==', 'pending')
        .where('expiresAt', '<', now)
        .get();

      if (expiredSnapshot.empty) {
        this.logger.log('No expired reservations found.');
        return 0;
      }

      for (const doc of expiredSnapshot.docs) {
        const purchaseData = doc.data();
        const items = purchaseData.items as Array<{
          ticketTypeId: string;
          quantity: number;
        }>;

        if (!items || items.length === 0) {
          continue;
        }

        // Liberar reservas de cada ticket type
        const releaseItems: InventoryReservationItem[] = items.map(
          (item: { ticketTypeId: string; quantity: number }) => ({
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
          }),
        );

        await this.releaseReservation(releaseItems);

        // Actualizar estado de la compra a "expired"
        await this.firebase.db.collection(COLLECTIONS.PURCHASES).doc(doc.id).update({
          status: 'expired',
          updatedAt: Timestamps.serverTimestamp(),
        });

        processedCount++;
        this.logger.log(
          `Expired purchase restored: ${doc.id} (${items.length} items)`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error restoring expired reservations: ${(error as Error).message}`,
      );
      throw error;
    }

    this.logger.log(`Restore expired completed: ${processedCount} purchases processed.`);
    return processedCount;
  }
}
