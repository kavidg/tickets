/**
 * TicketS - Servicio de Tickets (Entradas individuales)
 *
 * Capa de servicios que encapsula toda la comunicación con Firestore
 * para la gestión de tickets (entradas individuales).
 *
 * Colección: `tickets`
 *
 * Flujo de generación:
 *   1. createTicketsFromPurchase() → Se llama cuando una compra pasa a "paid"
 *   2. Genera N tickets por cada PurchaseItem (según quantity)
 *   3. Cada ticket recibe un qrToken único (UUID v4)
 *   4. Todos los tickets se guardan en una transacción batch
 *
 * Validaciones:
 *   - purchaseId es requerido.
 *   - eventId es requerido.
 *   - La compra debe existir y estar en estado "paid".
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';

import db from '../firebase/firestore';
import { COLLECTIONS } from '../constants/firestore';
import type {
  Ticket,
  CreateTicketsFromPurchaseData,
  UpdateTicketData,
  TicketStatus,
} from '../types/ticket';
import type { Purchase, PurchaseItem } from '../types/purchase';
import type { EventResponse } from '../types/event';

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function handleTicketError<T>(error: unknown): EventResponse<T> {
  const firestoreError = error as { code?: string; message?: string };
  const code = firestoreError?.code || 'tickets/unknown';

  return {
    success: false,
    error: firestoreError?.message || 'Error al procesar el ticket.',
    code,
  } as EventResponse<T>;
}

/**
 * Genera un UUID v4 utilizando la API nativa del navegador.
 *
 * @returns UUID v4 único.
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Crea un objeto Ticket para un item específico dentro de una compra.
 *
 * @param params - Parámetros para crear el ticket.
 * @returns Objeto Ticket listo para guardar en Firestore.
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
    qrToken: generateUUID(),
    status: 'active' as TicketStatus,
    checkedInAt: null,
    checkedInBy: '',
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Genera tickets a partir de una compra ya pagada.
 *
 * Por cada item en la compra, genera `quantity` tickets con un qrToken único.
 * Todos los tickets se crean en una sola transacción batch de Firestore.
 *
 * @param data - Datos de la compra para generar tickets.
 * @returns Lista de tickets generados.
 *
 * @example
 * const { data: tickets } = await createTicketsFromPurchase({
 *   purchaseId: 'abc123',
 *   eventId: 'event789',
 *   organizationId: 'org456',
 *   userId: 'user123',
 * });
 */
export async function createTicketsFromPurchase(
  data: CreateTicketsFromPurchaseData,
): Promise<EventResponse<Ticket[]>> {
  // Validar campos requeridos
  if (!data.purchaseId?.trim()) {
    return { success: false, error: 'La compra es requerida.', code: 'validation-error' };
  }
  if (!data.eventId?.trim()) {
    return { success: false, error: 'El evento es requerido.', code: 'validation-error' };
  }
  if (!data.organizationId?.trim()) {
    return { success: false, error: 'La organización es requerida.', code: 'validation-error' };
  }
  if (!data.userId?.trim()) {
    return { success: false, error: 'El usuario es requerido.', code: 'validation-error' };
  }

  try {
    // Obtener la compra para extraer los items
    const purchaseRef = doc(db, COLLECTIONS.PURCHASES, data.purchaseId);
    const purchaseSnap = await getDoc(purchaseRef);

    if (!purchaseSnap.exists()) {
      return {
        success: false,
        error: 'Compra no encontrada.',
        code: 'not-found',
      };
    }

    const purchase = { id: purchaseSnap.id, ...purchaseSnap.data() } as Purchase;

    // Validar que la compra esté pagada
    if (purchase.status !== 'paid') {
      return {
        success: false,
        error: 'La compra debe estar pagada para generar tickets.',
        code: 'purchase-not-paid',
      };
    }

    // Generar tickets por cada item × quantity
    const tickets: Ticket[] = [];
    const batch = writeBatch(db);

    for (const item of purchase.items) {
      for (let i = 0; i < item.quantity; i++) {
        const ticket = createTicketFromItem({
          purchaseId: data.purchaseId,
          eventId: data.eventId,
          organizationId: data.organizationId,
          userId: data.userId,
          item,
          ticketIndex: i,
        });

        tickets.push(ticket);
        const ticketRef = doc(db, COLLECTIONS.TICKETS, ticket.id);
        batch.set(ticketRef, ticket);
      }
    }

    // Ejecutar batch write
    await batch.commit();

    return { success: true, data: tickets };
  } catch (error) {
    return handleTicketError(error);
  }
}

/**
 * Obtiene un ticket por su ID.
 *
 * @param id - ID del documento en Firestore.
 * @returns El ticket encontrado o error si no existe.
 *
 * @example
 * const { data: ticket } = await getTicket('abc123_vip_0');
 */
export async function getTicket(id: string): Promise<EventResponse<Ticket>> {
  try {
    const ref = doc(db, COLLECTIONS.TICKETS, id);
    const docSnap = await getDoc(ref);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Ticket no encontrado.',
        code: 'not-found',
      };
    }

    const ticket = { id: docSnap.id, ...docSnap.data() } as Ticket;
    return { success: true, data: ticket };
  } catch (error) {
    return handleTicketError(error);
  }
}

/**
 * Obtiene todos los tickets de un usuario, ordenados por fecha de creación descendente.
 *
 * @param userId - UID del usuario.
 * @returns Lista de tickets del usuario.
 *
 * @example
 * const { data: tickets } = await getUserTickets('user123');
 */
export async function getUserTickets(userId: string): Promise<EventResponse<Ticket[]>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.TICKETS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);
    const tickets: Ticket[] = [];

    snapshot.forEach((docSnap) => {
      tickets.push({ id: docSnap.id, ...docSnap.data() } as Ticket);
    });

    return { success: true, data: tickets };
  } catch (error) {
    return handleTicketError(error);
  }
}

/**
 * Actualiza el estado de un ticket.
 *
 * Principalmente utilizado para:
 *   - Check-in: active → used (con checkedInAt y checkedInBy)
 *   - Cancelación: active → cancelled
 *
 * @param id - ID del ticket en Firestore.
 * @param data - Campos a actualizar (status, attendeeName, attendeeEmail, checkedInAt, checkedInBy).
 * @returns El ticket actualizado.
 *
 * @example
 * // Marcar como usado (check-in)
 * const { data: ticket } = await updateTicketStatus('abc123_vip_0', {
 *   status: 'used',
 *   checkedInAt: serverTimestamp(),
 *   checkedInBy: 'organizer123',
 * });
 *
 * // Cancelar ticket
 * const { data: ticket } = await updateTicketStatus('abc123_vip_0', {
 *   status: 'cancelled',
 * });
 */
export async function updateTicketStatus(
  id: string,
  data: UpdateTicketData,
): Promise<EventResponse<Ticket>> {
  try {
    const ref = doc(db, COLLECTIONS.TICKETS, id);

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(ref, updateData);

    const docSnap = await getDoc(ref);
    const ticket = { id: docSnap.id, ...docSnap.data() } as Ticket;

    return { success: true, data: ticket };
  } catch (error) {
    return handleTicketError(error);
  }
}

/**
 * Obtiene todos los tickets de un evento para un organizador.
 *
 * @param eventId - ID del evento.
 * @returns Lista de tickets del evento.
 *
 * @example
 * const { data: tickets } = await getEventTickets('event789');
 */
export async function getEventTickets(eventId: string): Promise<EventResponse<Ticket[]>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.TICKETS),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'asc'),
    );

    const snapshot = await getDocs(q);
    const tickets: Ticket[] = [];

    snapshot.forEach((docSnap) => {
      tickets.push({ id: docSnap.id, ...docSnap.data() } as Ticket);
    });

    return { success: true, data: tickets };
  } catch (error) {
    return handleTicketError(error);
  }
}
