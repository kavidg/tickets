/**
 * TicketS - Tipos de Tickets (Entradas individuales)
 *
 * Define los tipos para los tickets (entradas individuales), almacenados en Cloud Firestore.
 *
 * Colección: `tickets`
 *
 * Relación:
 *   Una compra (Purchase) genera uno o más tickets (según quantity de cada item).
 *   Cada ticket representa una entrada individual con su propio código único.
 *   El código del ticket se codifica en un QR para validar el ingreso (check-in).
 *
 * Flujo:
 *   Purchase (paid)
 *       ↓
 *   Backend: createTicketsFromPurchase() → Genera N tickets (1 por item × quantity)
 *       ↓
 *   Cada ticket con code único (TCK-XXXXXXXX-XXXXXXXXXX), status "active"
 *       ↓
 *   Check-in: updateTicketStatus() → "used" + usedAt
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
 * Cada ticket contiene un code único que se utiliza para generar
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
  /** Código único del ticket (formato: TCK-XXXXXX-XXXXXXXXXX) */
  code: string;
  /** Estado del ticket */
  status: TicketStatus;
  /** Fecha de creación */
  createdAt: Timestamp;
  /** Timestamp de Firestore cuando se realizó el check-in */
  usedAt?: Timestamp;
}

/**
 * Datos actualizables de un ticket.
 */
export interface UpdateTicketData {
  status?: TicketStatus;
  usedAt?: Timestamp;
}
