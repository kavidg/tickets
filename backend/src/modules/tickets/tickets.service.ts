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
import type { Ticket } from './interfaces/ticket.interface';
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
