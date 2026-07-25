/**
 * TicketS - Servicio de Eventos
 *
 * Capa de servicios que encapsula toda la comunicación para la gestión de eventos.
 *
 * Los eventos públicos se consultan a través del backend NestJS API
 * para evitar depender de reglas Firestore del lado del cliente.
 * Los eventos de organizador y operaciones CRUD se realizan mediante
 * la API REST del backend.
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
// Constantes
// ---------------------------------------------------------------------------

const API_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function handleEventError<T>(error: unknown): EventResponse<T> {
  const err = error as { code?: string; message?: string };
  const code = err?.code || 'events/unknown';

  return {
    success: false,
    error: err?.message || 'Error al procesar el evento.',
    code,
  } as EventResponse<T>;
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Obtiene los eventos públicos (publicados), ordenados por fecha de inicio.
 *
 * Consulta el backend API en lugar de Firestore directamente para evitar
 * errores de permisos cuando el usuario no está autenticado.
 *
 * El backend usa Firebase Admin SDK, que no está sujeto a reglas Firestore.
 *
 * @param maxResults - Límite opcional de resultados.
 * @returns Lista de eventos publicados.
 *
 * @example
 * const { data: events } = await getPublicEvents();
 * const { data: latest } = await getPublicEvents(6);
 */
export async function getPublicEvents(maxResults?: number): Promise<EventResponse<Event[]>> {
  console.log('[event-public] request');

  try {
    let url = `${API_URL}/events/public`;
    if (maxResults !== undefined) {
      url += `?maxResults=${maxResults}`;
    }

    const res = await fetch(url);
    const body = await res.json();

    console.log('[event-public] response:', res.status);

    if (!res.ok) {
      return {
        success: false,
        error: body?.message || body?.error || 'Error al cargar eventos.',
        code: `api/${res.status}`,
      };
    }

    // El ResponseInterceptor del backend envuelve en { success, data, ... }
    const events: Event[] = body?.data || [];
    return { success: true, data: events };
  } catch (error) {
    console.log('[event-public] error:', error);
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
