/**
 * TicketS - Ticket Interface (Backend)
 *
 * Representa un ticket digital individual generado a partir de una compra pagada.
 *
 * Cada ticket tiene un código único (code) que sirve como identificador
 * para validación de ingreso y generación futura de QR.
 *
 * Por cada item en una Purchase se generan N tickets (uno por cantidad).
 *
 * @see frontend/src/types/ticket.ts para los tipos del frontend.
 */

import type { Timestamp } from 'firebase-admin/firestore';

/**
 * Estados posibles de un ticket.
 *
 * active:    Válido y activo, puede ser usado para ingresar al evento.
 * used:      Ya fue utilizado (check-in realizado).
 * cancelled: Cancelado (por reembolso, anulación, etc.).
 */
export type TicketStatus = 'active' | 'used' | 'cancelled';

/**
 * Ticket digital almacenado en Firestore.
 */
export interface Ticket {
  /** ID único del documento en Firestore */
  id: string;
  /** ID de la compra que originó el ticket */
  purchaseId: string;
  /** ID del evento al que pertenece */
  eventId: string;
  /** ID del tipo de entrada (General, VIP, etc.) */
  ticketTypeId: string;
  /** UID del propietario del ticket (comprador) */
  userId: string;
  /** ID de la organización organizadora del evento */
  organizationId: string;
  /** Nombre del asistente (opcional, se puede asignar posteriormente) */
  attendeeName?: string;
  /** Email del asistente (opcional) */
  attendeeEmail?: string;
  /** Código único del ticket (formato: TCK-XXXXXX-XXXXXXXXXX) */
  code: string;
  /** Estado actual del ticket */
  status: TicketStatus;
  /** Fecha de creación del ticket */
  createdAt: Timestamp;
  /** Fecha en que se realizó el check-in (null si no se ha usado) */
  usedAt?: Timestamp;
}
