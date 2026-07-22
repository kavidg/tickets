/**
 * TicketS - Tipos de Tickets (Backend)
 *
 * Define los tipos relacionados con tickets para el backend.
 *
 * @see frontend/src/types/ticket.ts para los tipos del frontend.
 */

import type { Timestamp } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
// Estados del ticket
// ---------------------------------------------------------------------------

export type TicketStatus = 'active' | 'used' | 'cancelled' | 'transferred';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface Ticket {
  id: string;
  purchaseId: string;
  eventId: string;
  organizationId: string;
  userId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  attendeeName: string;
  attendeeEmail: string;
  qrToken: string;
  status: TicketStatus;
  checkedInAt: Timestamp | null;
  checkedInBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Payload para generar tickets después de un pago exitoso.
 * Se envía desde la función de webhook después de confirmar el pago.
 */
export interface GenerateTicketsPayload {
  purchaseId: string;
  eventId: string;
  organizationId: string;
  userId: string;
}
