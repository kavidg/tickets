/**
 * TicketS - CheckInService
 *
 * Servicio de validación de ingreso (check-in) para eventos.
 * Extiende FirestoreRepository para reutilizar operaciones CRUD genéricas
 * sobre la colección `checkIns`.
 *
 * Responsabilidades:
 *   - Validar tickets por código (escaneo QR o ingreso manual).
 *   - Verificar permisos del organizador/staff.
 *   - Ejecutar la validación como operación atómica (Firestore Transaction).
 *   - Registrar cada intento de validación en CheckInLog.
 *   - Prevenir doble ingreso del mismo ticket.
 *
 * Índices compuestos requeridos en Firestore:
 *   - tickets: code ASC (usado para buscar ticket por código)
 *   - checkIns: eventId ASC, createdAt DESC (usado por getEventCheckIns)
 *
 * @see CheckInLog para el modelo de datos.
 * @see Ticket para el modelo de ticket validado.
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
import type { CheckInLog, CheckInResult } from './interfaces/check-in.interface';
import type { Ticket } from '../tickets/interfaces/ticket.interface';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';
import type { ValidateTicketDto } from './dto/validate-ticket.dto';

export interface CheckInSuccessResponse {
  success: true;
  data: {
    ticketId: string;
    eventId: string;
    status: 'used';
    attendeeUserId: string;
  };
}

export interface CheckInFailureResponse {
  success: false;
  reason: 'already_used' | 'cancelled' | 'invalid';
}

export type CheckInResponse = CheckInSuccessResponse | CheckInFailureResponse;
export type EventCheckInLog = Pick<CheckInLog, 'ticketId' | 'attendeeUserId' | 'validatedBy' | 'createdAt'>;

@Injectable()
export class CheckInService extends FirestoreRepository<CheckInLog> {
  protected collectionName = COLLECTIONS.CHECKINS;

  constructor(firebase: FirebaseAdminService) {
    super(firebase);
  }

  /**
   * Valida un ticket por su código y realiza el check-in si es válido.
   *
   * Operación ATÓMICA mediante Firestore Transaction:
   *   1. Lee el ticket (transacción).
   *   2. Verifica que esté activo.
   *   3. Actualiza ticket a 'used'.
   *   4. Crea registro CheckInLog.
   *
   * Si dos personas intentan validar el mismo ticket simultáneamente,
   * solo una obtendrá éxito.
   *
   * @param dto - DTO con el código del ticket.
   * @param user - Usuario autenticado (organizador/staff que valida).
   * @returns Resultado de la validación.
   *
   * @throws NotFoundException si el ticket no existe.
   * @throws ForbiddenException si el usuario no tiene permisos de organizador.
   */
  async validateTicket(
    dto: ValidateTicketDto,
    user: CurrentUser,
  ): Promise<CheckInResponse> {
    // 1. Buscar ticket por código
    const ticketDocs = await this.findRawInCollection(
      COLLECTIONS.TICKETS,
      (col) => col.where('code', '==', dto.code).limit(1),
    );

    if (ticketDocs.length === 0) {
      // Ticket no encontrado — registrar intento inválido
      await this.logCheckIn({
        ticketId: null,
        eventId: null,
        organizationId: null,
        validatedBy: user.uid,
        attendeeUserId: null,
        result: 'invalid',
      });
      return { success: false, reason: 'invalid' };
    }

    const ticketData = ticketDocs[0];
    const ticket = ticketData as unknown as Ticket;

    // 2. Validar permisos del organizador
    await this.validateOrganizerAccess(ticket, user);

    // 3. Ejecutar validación con transacción atómica
    return this.executeAtomicValidation(ticket, user);
  }

  /**
   * Obtiene el historial de validaciones de un evento.
   * Solo accesible para owner/staff/admin del evento.
   *
   * @param eventId - ID del evento.
   * @param user - Usuario autenticado.
   * @returns Lista de accesos registrados.
   */
  async getEventCheckIns(
    eventId: string,
    user: CurrentUser,
  ): Promise<EventCheckInLog[]> {
    // Validar acceso al evento
    await this.validateEventAccess(eventId, user);

    try {
      const logs = await this.findMany((col) =>
        col
          .where('eventId', '==', eventId)
          .orderBy('createdAt', 'desc'),
      );

      return logs.map((log) => ({
        ticketId: log.ticketId,
        attendeeUserId: log.attendeeUserId,
        validatedBy: log.validatedBy,
        createdAt: log.createdAt,
      }));
    } catch (error) {
      this.logger.error(
        `Error fetching check-ins for event ${eventId}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al obtener el historial de accesos. Intenta nuevamente.',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Validación atómica
  // ---------------------------------------------------------------------------

  /**
   * Ejecuta la validación del ticket dentro de una transacción atómica.
   * Garantiza que un mismo ticket no pueda ser validado dos veces simultáneamente.
   */
  private async executeAtomicValidation(
    ticket: Ticket,
    user: CurrentUser,
  ): Promise<CheckInResponse> {
    const ticketRef = this.firebase.db
      .collection(COLLECTIONS.TICKETS)
      .doc(ticket.id);

    const checkInRef = this.firebase.db
      .collection(COLLECTIONS.CHECKINS)
      .doc();

    try {
      await this.firebase.db.runTransaction(async (transaction) => {
        // Leer el ticket actual dentro de la transacción
        const currentTicketSnap = await transaction.get(ticketRef);

        if (!currentTicketSnap.exists) {
          throw new NotFoundException('El ticket ya no existe.');
        }

        const currentTicket = currentTicketSnap.data() as Ticket;
        const currentStatus = currentTicket.status;

        // Verificar estado actual
        if (currentStatus === 'used') {
          throw new CheckInError('already_used');
        }

        if (currentStatus === 'cancelled') {
          throw new CheckInError('cancelled');
        }

        if (currentStatus !== 'active') {
          throw new CheckInError('invalid');
        }

        // Actualizar ticket a 'used'
        transaction.update(ticketRef, {
          status: 'used',
          usedAt: Timestamps.serverTimestamp(),
        });

        // Crear registro de check-in
        transaction.set(checkInRef, {
          ticketId: ticket.id,
          eventId: ticket.eventId,
          organizationId: ticket.organizationId,
          validatedBy: user.uid,
          attendeeUserId: ticket.userId,
          result: 'success',
          createdAt: Timestamps.serverTimestamp(),
        });
      });

      this.logger.log(
        `Check-in SUCCESS: ticket ${ticket.code} (event: ${ticket.eventId}) validated by ${user.uid}`,
      );

      return {
        success: true,
        data: {
          ticketId: ticket.id,
          eventId: ticket.eventId,
          status: 'used',
          attendeeUserId: ticket.userId,
        },
      };
    } catch (error) {
      if (error instanceof CheckInError) {
        const reason = error.message as CheckInFailureResponse['reason'];

        // Registrar intento fallido
        await this.logCheckIn({
          ticketId: ticket.id,
          eventId: ticket.eventId,
          organizationId: ticket.organizationId,
          validatedBy: user.uid,
          attendeeUserId: ticket.userId,
          result: reason,
        });

        this.logger.log(
          `Check-in FAILED: ticket ${ticket.code} — ${reason} (validated by ${user.uid})`,
        );

        return { success: false, reason };
      }

      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Validación de acceso del organizador
  // ---------------------------------------------------------------------------

  /**
   * Valida que el usuario tenga permisos de organizador para el evento
   * del ticket que intenta validar.
   *
   * Acceso permitido para:
   *   - Owner de la organización del evento.
   *   - Usuarios con rol admin o staff (preparado para futuros roles).
   *
   * @param ticket - Ticket que se intenta validar.
   * @param user - Usuario autenticado.
   *
   * @throws ForbiddenException si el usuario no tiene permisos.
   */
  private async validateOrganizerAccess(
    ticket: Ticket,
    user: CurrentUser,
  ): Promise<void> {
    // Owner de la organización siempre puede validar
    const orgData = await this.getRawDoc(
      COLLECTIONS.ORGANIZATIONS,
      ticket.organizationId,
    );

    if (orgData && orgData.ownerId === user.uid) {
      return;
    }

    // TODO: Validar por rol (admin / staff)
    // Futura implementación:
    // if (user.role === 'admin' || user.role === 'staff') {
    //   // Verificar que el usuario pertenece a la organización
    //   const memberDoc = await this.getRawDoc(
    //     COLLECTIONS.ORGANIZATION_MEMBERS,
    //     `${ticket.organizationId}_${user.uid}`,
    //   );
    //   if (memberDoc) return;
    // }

    throw new ForbiddenException(
      'No tienes permiso para validar tickets de este evento.',
    );
  }

  /**
   * Valida que el usuario tenga acceso al evento (para ver historial).
   */
  private async validateEventAccess(
    eventId: string,
    user: CurrentUser,
  ): Promise<void> {
    const eventData = await this.getRawDoc(COLLECTIONS.EVENTS, eventId);

    if (!eventData) {
      throw new NotFoundException('El evento no existe.');
    }

    const organizationId = eventData.organizationId as string;

    const orgData = await this.getRawDoc(
      COLLECTIONS.ORGANIZATIONS,
      organizationId,
    );

    if (orgData && orgData.ownerId === user.uid) {
      return;
    }

    // TODO: Validar por rol (admin / staff)

    throw new ForbiddenException(
      'No tienes permiso para ver el historial de accesos de este evento.',
    );
  }

  // ---------------------------------------------------------------------------
  // Logging
  // ---------------------------------------------------------------------------

  /**
   * Registra un intento de validación en CheckInLog (fuera de transacción).
   * Utilizado para intentos inválidos o fallidos que no modifican el ticket.
   */
  private async logCheckIn(data: {
    ticketId: string | null;
    eventId: string | null;
    organizationId: string | null;
    validatedBy: string;
    attendeeUserId: string | null;
    result: CheckInResult;
  }): Promise<void> {
    try {
      await this.createDoc({
        ticketId: data.ticketId,
        eventId: data.eventId,
        organizationId: data.organizationId,
        validatedBy: data.validatedBy,
        attendeeUserId: data.attendeeUserId,
        result: data.result,
        createdAt: Timestamps.serverTimestamp(),
      });
    } catch (error) {
      this.logger.error(
        `Error logging check-in: ${(error as Error).message}`,
      );
    }
  }
}

/**
 * Error interno para manejar resultados de validación dentro de la transacción.
 */
class CheckInError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckInError';
  }
}
