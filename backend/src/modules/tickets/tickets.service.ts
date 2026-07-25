/**
 * TicketS - TicketsService
 *
 * Servicio de tickets digitales que opera sobre la colección `tickets` de Firestore.
 * Extiende FirestoreRepository para reutilizar operaciones CRUD genéricas.
 *
 * Responsabilidades:
 *   - Generar tickets individuales a partir de una Purchase pagada.
 *   - Garantizar que cada ticket tenga un código único (TCK-XXXXXX-XXXXXXXXXX).
 *   - Ser idempotente: si ya existen tickets para una Purchase, retornarlos sin duplicar.
 *   - Controlar acceso a tickets: propietario u organizador del evento.
 *
 * @see WebhookService para la integración que activa la generación de tickets.
 * @see TicketCode para el formato de generación de códigos.
 *
 * Índices compuestos requeridos en Firestore para la colección `tickets`:
 *   - userId ASC, createdAt DESC (usado por getMyTickets)
 *   - purchaseId ASC (usado por createTicketsFromPurchase para idempotencia)
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { COLLECTIONS } from '../../constants/collections';
import { FirestoreRepository } from '../../common/firestore/firestore.repository';
import { Timestamps } from '../../common/utils/timestamps';
import { TicketCode } from '../../common/utils/ticket-code';
import type { Ticket, TicketEnriched } from './interfaces/ticket.interface';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';
import type { Purchase } from '../purchases/interfaces/purchase.interface';

@Injectable()
export class TicketsService extends FirestoreRepository<Ticket> {
  protected collectionName = COLLECTIONS.TICKETS;

  constructor(firebase: FirebaseAdminService) {
    super(firebase);
  }

  /**
   * Genera tickets digitales a partir de una compra pagada.
   *
   * Por cada item en purchase.items, genera `quantity` tickets individuales
   * con códigos únicos.
   *
   * Es IDEMPOTENTE: si la compra ya tiene tickets generados, retorna
   * los existentes sin crear nuevos.
   *
   * @param purchase - Compra pagada con status 'paid' y items a generar.
   * @returns Lista de tickets generados o existentes.
   *
   * @throws BadRequestException si la compra no está pagada.
   */
  async createTicketsFromPurchase(purchase: Purchase): Promise<Ticket[]> {
    // Validar que la compra está pagada
    if (purchase.status !== 'paid') {
      throw new BadRequestException(
        `No se pueden generar tickets para una compra en estado "${purchase.status}". ` +
          'La compra debe estar pagada.',
      );
    }

    // Idempotencia: verificar si ya existen tickets para esta compra
    const existingTickets = await this.findMany((col) =>
      col.where('purchaseId', '==', purchase.id),
    );

    if (existingTickets.length > 0) {
      this.logger.log(
        `Tickets already exist for purchase ${purchase.id} (${existingTickets.length} tickets). Returning existing.`,
      );
      return existingTickets;
    }

    // Generar tickets
    const tickets: Ticket[] = [];

    for (const item of purchase.items) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketData: Record<string, unknown> = {
          purchaseId: purchase.id,
          eventId: purchase.eventId,
          ticketTypeId: item.ticketTypeId,
          userId: purchase.userId,
          organizationId: purchase.organizationId,
          attendeeName: null,
          attendeeEmail: null,
          code: TicketCode.generate(),
          status: 'active',
          ...Timestamps.forCreate(),
        };

        const ticket = await this.createDoc(ticketData);
        tickets.push(ticket);
      }
    }

    this.logger.log(
      `Generated ${tickets.length} tickets for purchase ${purchase.id}`,
    );

    return tickets;
  }

  /**
   * Busca tickets públicos asociados a un correo electrónico.
   *
   * Para cada ticket, enriquece los datos con información del evento
   * y del tipo de entrada.
   *
   * Endpoint público — no requiere autenticación.
   *
   * @param email - Correo electrónico del comprador.
   * @returns Lista de tickets enriquecidos con datos del evento y ticket type.
   */
  async findTicketsByEmail(email: string): Promise<TicketEnriched[]> {
    // 1. Buscar purchases por buyerEmail
    const purchasesSnapshot = await this.firebase.db
      .collection(COLLECTIONS.PURCHASES)
      .where('buyerEmail', '==', email)
      .get();

    if (purchasesSnapshot.empty) {
      return [];
    }

    // 2. Obtener todas las purchaseIds
    const purchaseIds = purchasesSnapshot.docs.map((doc) => doc.id);

    // 3. Buscar tickets por purchaseId
    const allTickets: Ticket[] = [];
    for (const purchaseId of purchaseIds) {
      const ticketsSnap = await this.firebase.db
        .collection(COLLECTIONS.TICKETS)
        .where('purchaseId', '==', purchaseId)
        .get();

      ticketsSnap.forEach((doc) => {
        allTickets.push({ id: doc.id, ...doc.data() } as Ticket);
      });
    }

    if (allTickets.length === 0) {
      return [];
    }

    // 4. Enriquecer con datos de eventos y ticket types
    const enrichedTickets: TicketEnriched[] = [];

    for (const ticket of allTickets) {
      // Obtener evento
      let eventTitle = 'Evento';
      let eventDate = '';
      let venueName = '';
      try {
        const eventSnap = await this.firebase.db
          .collection(COLLECTIONS.EVENTS)
          .doc(ticket.eventId)
          .get();
        if (eventSnap.exists) {
          const evData = eventSnap.data()!;
          eventTitle = (evData.title as string) || 'Evento';
          const rawDate = evData.startDate;
          if (rawDate && typeof (rawDate as any).toDate === 'function') {
            eventDate = (rawDate as any).toDate().toISOString();
          } else if (rawDate) {
            eventDate = String(rawDate);
          }
          venueName = (evData.venueName as string) || (evData.city as string) || '';
        }
      } catch {
        // Usar valores por defecto
      }

      // Obtener nombre del ticket type
      let ticketTypeName = 'Entrada';
      try {
        const ttSnap = await this.firebase.db
          .collection(COLLECTIONS.TICKET_TYPES)
          .doc(ticket.ticketTypeId)
          .get();
        if (ttSnap.exists) {
          ticketTypeName = (ttSnap.data()!.name as string) || 'Entrada';
        }
      } catch {
        // Usar valor por defecto
      }

      enrichedTickets.push({
        id: ticket.id,
        code: ticket.code,
        status: ticket.status,
        ticketTypeName,
        eventId: ticket.eventId,
        eventTitle,
        eventDate,
        venueName,
        purchaseId: ticket.purchaseId,
      });
    }

    return enrichedTickets;
  }

  /**
   * Obtiene los tickets del usuario autenticado.
   *
   * @param user - Usuario autenticado.
   * @returns Lista de tickets del usuario, ordenados por fecha de creación descendente.
   */
  async getMyTickets(user: CurrentUser): Promise<Ticket[]> {
    try {
      return this.findMany((col) =>
        col
          .where('userId', '==', user.uid)
          .orderBy('createdAt', 'desc'),
      );
    } catch (error) {
      this.logger.error(
        `Error fetching tickets for user ${user.uid}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al obtener tus tickets. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene un ticket por su ID con validación de acceso.
   *
   * @param id - ID del Ticket.
   * @param user - Usuario autenticado.
   * @returns El Ticket encontrado.
   *
   * @throws NotFoundException si el ticket no existe.
   * @throws ForbiddenException si el usuario no tiene acceso.
   */
  async getTicketById(id: string, user: CurrentUser): Promise<Ticket> {
    const ticket = await this.findByIdOrFail(id);

    await this.validateTicketAccess(ticket, user);

    return ticket;
  }

  /**
   * Valida que un usuario tenga acceso a un ticket.
   *
   * Acceso permitido para:
   *   - El propietario del ticket (ticket.userId === user.uid).
   *   - El owner de la organización del evento.
   *
   * @param ticket - Ticket a validar.
   * @param user - Usuario autenticado.
   *
   * @throws ForbiddenException si el usuario no tiene acceso.
   */
  async validateTicketAccess(ticket: Ticket, user: CurrentUser): Promise<void> {
    // El propietario del ticket siempre puede acceder
    if (ticket.userId === user.uid) {
      return;
    }

    // Verificar si el usuario es owner de la organización
    const orgData = await this.getRawDoc(
      COLLECTIONS.ORGANIZATIONS,
      ticket.organizationId,
    );

    if (orgData && orgData.ownerId === user.uid) {
      return;
    }

    throw new ForbiddenException(
      'No tienes permiso para acceder a este ticket.',
    );
  }
}
