/**
 * TicketS - Servicio de Eventos
 *
 * Capa de servicios que encapsula toda la comunicación con Firestore
 * para la gestión de eventos.
 *
 * Colección: `events`
 *
 * Reglas de seguridad (ver FIRESTORE_RULES.md):
 *   - Los eventos publicados son legibles por cualquiera.
 *   - Los borradores solo por el organizador.
 *   - Solo el organizador puede crear/actualizar sus eventos.
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
  limit,
  type Timestamp,
} from 'firebase/firestore';

import db from '../firebase/firestore';
import { COLLECTIONS } from '../constants/firestore';
import type {
  Event,
  CreateEventData,
  UpdateEventData,
  EventResponse,
} from '../types/event';

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function handleEventError<T>(error: unknown): EventResponse<T> {
  const firestoreError = error as { code?: string; message?: string };
  const code = firestoreError?.code || 'events/unknown';

  return {
    success: false,
    error: firestoreError?.message || 'Error al procesar el evento.',
    code,
  } as EventResponse<T>;
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Obtiene los eventos públicos (publicados), ordenados por fecha de inicio.
 *
 * @param maxResults - Límite opcional de resultados.
 * @returns Lista de eventos publicados.
 *
 * @example
 * const { data: events } = await getPublicEvents();
 * const { data: latest } = await getPublicEvents(6);
 */
export async function getPublicEvents(maxResults?: number): Promise<EventResponse<Event[]>> {
  try {
    let q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('status', '==', 'published'),
      orderBy('startDate', 'asc'),
    );

    if (maxResults !== undefined) {
      q = query(q, limit(maxResults));
    }

    const snapshot = await getDocs(q);
    const events: Event[] = [];

    snapshot.forEach((docSnap) => {
      events.push({ id: docSnap.id, ...docSnap.data() } as Event);
    });

    return { success: true, data: events };
  } catch (error) {
    return handleEventError(error);
  }
}

/**
 * Obtiene un evento por su slug.
 *
 * @param slug - Slug único del evento.
 * @returns El evento encontrado o error si no existe.
 *
 * @example
 * const { success, data } = await getEventBySlug('neon-sessions');
 */
export async function getEventBySlug(slug: string): Promise<EventResponse<Event>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('slug', '==', slug),
      limit(1),
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: false,
        error: 'Evento no encontrado.',
        code: 'not-found',
      };
    }

    const docSnap = snapshot.docs[0];
    const event = { id: docSnap.id, ...docSnap.data() } as Event;

    return { success: true, data: event };
  } catch (error) {
    return handleEventError(error);
  }
}

/**
 * Obtiene todos los eventos de un organizador.
 *
 * @param organizerId - UID del organizador.
 * @returns Lista de eventos del organizador.
 *
 * @example
 * const { data: myEvents } = await getOrganizerEvents('abc123');
 */
export async function getOrganizerEvents(organizerId: string): Promise<EventResponse<Event[]>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('organizerId', '==', organizerId),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);
    const events: Event[] = [];

    snapshot.forEach((docSnap) => {
      events.push({ id: docSnap.id, ...docSnap.data() } as Event);
    });

    return { success: true, data: events };
  } catch (error) {
    return handleEventError(error);
  }
}

/**
 * Crea un nuevo evento.
 *
 * @param data - Datos del evento a crear.
 * @returns El evento creado.
 *
 * @example
 * const response = await createEvent({
 *   title: 'Neon Sessions',
 *   slug: 'neon-sessions-2026',
 *   description: '...',
 *   categoryId: 'cat123',
 *   organizerId: 'org456',
 *   city: 'Cali',
 *   address: 'Centro de eventos',
 *   startDate: timestamp,
 *   endDate: timestamp,
 * });
 */
export async function createEvent(data: CreateEventData): Promise<EventResponse<Event>> {
  try {
    const ref = doc(collection(db, COLLECTIONS.EVENTS));

    const event: Event = {
      id: ref.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId,
      organizerId: data.organizerId,
      imageUrl: data.imageUrl || '',
      city: data.city,
      address: data.address,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || 'draft',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(ref, event);

    return { success: true, data: event };
  } catch (error) {
    return handleEventError(error);
  }
}

/**
 * Actualiza un evento existente.
 *
 * @param id - ID del documento en Firestore.
 * @param data - Campos a actualizar.
 * @returns El evento actualizado.
 *
 * @example
 * const response = await updateEvent('abc123', { status: 'published' });
 */
export async function updateEvent(id: string, data: UpdateEventData): Promise<EventResponse<Event>> {
  try {
    const ref = doc(db, COLLECTIONS.EVENTS, id);

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(ref, updateData);

    const docSnap = await getDoc(ref);
    const event = { id: docSnap.id, ...docSnap.data() } as Event;

    return { success: true, data: event };
  } catch (error) {
    return handleEventError(error);
  }
}
