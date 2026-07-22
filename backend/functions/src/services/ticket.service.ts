/**
 * TicketS - Servicio de Tickets (Backend)
 *
 * Capa de servicios del backend para la generación automática de tickets
 * después de un pago exitoso.
 *
 * Flujo:
 *   1. Webhook de pago exitoso → createTicketsFromPurchase()
 *   2. Por cada purchase item × quantity → se genera un ticket
 *   3. Cada ticket recibe un qrToken único (UUID v4)
 *   4. Todos los tickets se guardan en un batch transaction
 */

import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import type { Purchase, PurchaseItem } from '../types/purchase';
import type { Ticket, TicketStatus, GenerateTicketsPayload } from '../types/ticket';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Genera un UUID v4 para el token QR del ticket.
 */
function generateQrToken(): string {
  return uuidv4();
}

/**
 * Crea un objeto Ticket a partir de un item de compra.
 */
function createTicketFromItem(params: {
  purchaseId: string;
  eventId: string;
  organizationId: string;
  userId: string;
  item: PurchaseItem;
  ticketIndex: number;
}): Ticket {
  const { purchaseId, eventId, organizationId, userId, item, ticketIndex } = params;

  return {
    id: `${purchaseId}_${item.ticketTypeId}_${ticketIndex}`,
    purchaseId,
    eventId,
    organizationId,
    userId,
    ticketTypeId: item.ticketTypeId,
    ticketTypeName: item.ticketName,
    attendeeName: '',
    attendeeEmail: '',
    qrToken: generateQrToken(),
    status: 'active' as TicketStatus,
    checkedInAt: null,
    checkedInBy: '',
    createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
    updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
  };
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Genera tickets a partir de una compra pagada.
 *
 * @param payload - Datos de la compra (purchaseId, eventId, organizationId, userId).
 * @returns Lista de tickets generados.
 *
 * @example
 * const tickets = await createTicketsFromPurchase({
 *   purchaseId: 'abc123',
 *   eventId: 'event789',
 *   organizationId: 'org456',
 *   userId: 'user123',
 * });
 */
export async function createTicketsFromPurchase(
  payload: GenerateTicketsPayload,
): Promise<Ticket[]> {
  // Obtener la compra
  const purchaseSnap = await db
    .collection(COLLECTIONS.PURCHASES)
    .doc(payload.purchaseId)
    .get();

  if (!purchaseSnap.exists) {
    throw new Error(`Compra ${payload.purchaseId} no encontrada.`);
  }

  const purchase = { id: purchaseSnap.id, ...purchaseSnap.data() } as Purchase;

  // Validar que la compra esté pagada
  if (purchase.status !== 'paid') {
    throw new Error(
      `La compra ${payload.purchaseId} debe estar pagada para generar tickets. ` +
      `Estado actual: ${purchase.status}`,
    );
  }

  // Generar tickets
  const tickets: Ticket[] = [];
  const batch = db.batch();

  for (const item of purchase.items) {
    for (let i = 0; i < item.quantity; i++) {
      const ticket = createTicketFromItem({
        purchaseId: payload.purchaseId,
        eventId: payload.eventId,
        organizationId: payload.organizationId,
        userId: payload.userId,
        item,
        ticketIndex: i,
      });

      tickets.push(ticket);
      const ticketRef = db.collection(COLLECTIONS.TICKETS).doc(ticket.id);
      batch.set(ticketRef, ticket);
    }
  }

  await batch.commit();

  return tickets;
}

/**
 * Obtiene un ticket por su ID.
 */
export async function getTicketById(ticketId: string): Promise<Ticket | null> {
  const docSnap = await db.collection(COLLECTIONS.TICKETS).doc(ticketId).get();
  return docSnap.exists ? ({ id: docSnap.id, ...docSnap.data() } as Ticket) : null;
}

/**
 * Marca un ticket como usado (check-in).
 */
export async function checkInTicket(
  ticketId: string,
  checkedInBy: string,
): Promise<void> {
  await db.collection(COLLECTIONS.TICKETS).doc(ticketId).update({
    status: 'used',
    checkedInAt: admin.firestore.FieldValue.serverTimestamp(),
    checkedInBy,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Verifica si un qrToken es válido y retorna el ticket asociado.
 * Útil para la validación de QR en el check-in.
 */
export async function validateQrToken(qrToken: string): Promise<Ticket | null> {
  const snapshot = await db
    .collection(COLLECTIONS.TICKETS)
    .where('qrToken', '==', qrToken)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Ticket;
}
