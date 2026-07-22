/**
 * TicketS - CheckInLog Interface (Backend)
 *
 * Representa un registro de validación de ingreso (check-in) almacenado
 * en la colección `checkIns` de Firestore.
 *
 * Cada vez que un organizador escanea/valida un ticket, se crea un
 * registro CheckInLog con el resultado de la validación.
 *
 * @see CheckInService para la lógica de validación.
 */

import type { Timestamp } from 'firebase-admin/firestore';

/**
 * Resultados posibles de una validación de ticket.
 *
 * success:       Ticket válido, ingreso permitido.
 * already_used:  Ticket ya fue utilizado anteriormente.
 * cancelled:     Ticket cancelado (reembolso, anulación).
 * invalid:       Ticket no encontrado o código inválido.
 */
export type CheckInResult =
  | 'success'
  | 'already_used'
  | 'cancelled'
  | 'invalid';

/**
 * Registro de validación de ingreso.
 */
export interface CheckInLog {
  /** ID único del documento en Firestore */
  id: string;
  /** ID del ticket validado */
  ticketId: string;
  /** ID del evento al que intenta ingresar */
  eventId: string;
  /** ID de la organización organizadora */
  organizationId: string;
  /** UID del usuario que realizó la validación (organizador/staff) */
  validatedBy: string;
  /** UID del propietario del ticket (asistente) */
  attendeeUserId: string;
  /** Resultado de la validación */
  result: CheckInResult;
  /** Fecha de creación del registro */
  createdAt: Timestamp;
}
