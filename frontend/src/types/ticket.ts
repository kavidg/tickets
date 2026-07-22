/**
 * TicketS - Tipos de Tickets (Entradas individuales)
 *
 * Define los tipos para los tickets (entradas individuales), almacenados en Cloud Firestore.
 *
 * Colección: `tickets`
 *
 * Relación:
 *   Una compra (Purchase) genera uno o más tickets (según quantity de cada item).
 *   Cada ticket representa una entrada individual con su propio código QR.
 *   El ticket es validado en el ingreso al evento (check-in).
 *
 * Flujo:
 *   Purchase (paid)
 *       ↓
 *   createTicketsFromPurchase() → Genera N tickets (1 por item × quantity)
 *       ↓
 *   Cada ticket con qrToken único, status "active"
 *       ↓
 *   Check-in: updateTicketStatus() → "used" + checkedInAt + checkedInBy
 */

import type { Timestamp } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Estados del ticket
// ---------------------------------------------------------------------------

/**
 * Estados posibles de un ticket (entrada individual).
 *
 * active:   Válido, no ha sido usado.
 * used:     Ya fue utilizado para ingresar al evento (check-in).
 * cancelled: Cancelado (reembolso, compra cancelada, etc.).
 */
export type TicketStatus = 'active' | 'used' | 'cancelled';

/**
 * Etiquetas legibles para cada estado de ticket.
 */
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  active: 'Activo',
  used: 'Usado',
  cancelled: 'Cancelado',
};

/**
 * Lista de todos los estados disponibles.
 */
export const TICKET_STATUSES: TicketStatus[] = [
  'active',
  'used',
  'cancelled',
];

// ---------------------------------------------------------------------------
// Ticket (Entrada individual)
// ---------------------------------------------------------------------------

/**
 * Ticket o entrada individual almacenada en Firestore.
 *
 * Colección: `tickets`
 *
 * Cada ticket representa una entrada única para un evento.
 * Se genera automáticamente cuando una compra es marcada como "paid".
 * Cada ticket contiene un qrToken único que se utilizará para generar
 * el código QR y validar el ingreso.
 */
export interface Ticket {
  /** ID único del documento en Firestore */
  id: string;
  /** ID de la compra que originó este ticket */
  purchaseId: string;
  /** ID del evento al que da acceso */
  eventId: string;
  /** ID de la organización organizadora */
  organizationId: string;
  /** UID del usuario propietario del ticket */
  userId: string;
  /** ID del tipo de entrada (TicketType) adquirido */
  ticketTypeId: string;
  /** Nombre del tipo de entrada al momento de la compra (ej: 'VIP') */
  ticketTypeName: string;
  /** Nombre del asistente (puede ser distinto al comprador) */
  attendeeName: string;
  /** Email del asistente */
  attendeeEmail: string;
  /** Token único para generar el código QR (UUID v4) */
  qrToken: string;
  /** Estado del ticket */
  status: TicketStatus;
  /** Fecha y hora del check-in (cuando se usó el ticket) */
  checkedInAt: Timestamp | null;
  /** UID del usuario que realizó el check-in (organizador/validador) */
  checkedInBy: string;
  /** Fecha de creación */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
}

/**
 * Datos para crear tickets a partir de una compra.
 *
 * Este tipo representa los datos mínimos necesarios para generar los tickets
 * después de que una compra es marcada como "paid".
 */
export interface CreateTicketsFromPurchaseData {
  purchaseId: string;
  eventId: string;
  organizationId: string;
  userId: string;
}

/**
 * Datos actualizables de un ticket.
 * Solo ciertos campos pueden modificarse después de creado.
 */
export interface UpdateTicketData {
  status?: TicketStatus;
  attendeeName?: string;
  attendeeEmail?: string;
  checkedInAt?: Timestamp;
  checkedInBy?: string;
}
