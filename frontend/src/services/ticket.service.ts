/**
 * TicketS - Servicio de Tickets (Entradas individuales)
 *
 * Capa de servicios que encapsula la comunicación con Firestore
 * para la gestión de tickets (entradas individuales).
 *
 * Colección: `tickets`
 *
 * Flujo:
 *   Backend genera tickets con code único (TCK-XXXXXX-XXXXXXXXXX)
 *   Frontend lee tickets del usuario autenticado
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  type Timestamp,
} from 'firebase/firestore';

import db from '../firebase/firestore';
import { COLLECTIONS } from '../constants/firestore';
import type {
  Ticket,
  UpdateTicketData,
} from '../types/ticket';
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

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Obtiene un ticket por su ID.
 *
 * @param id - ID del documento en Firestore.
 * @returns El ticket encontrado o error si no existe.
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
      const data = docSnap.data();
      tickets.push({ id: docSnap.id, ...data } as Ticket);
    });

    return { success: true, data: tickets };
  } catch (error) {
    return handleTicketError(error);
  }
}

/**
 * Actualiza el estado de un ticket.
 *
 * @param id - ID del ticket en Firestore.
 * @param data - Campos a actualizar (status).
 * @returns El ticket actualizado.
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
