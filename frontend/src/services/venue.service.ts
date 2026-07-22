/**
 * TicketS - Servicio de Lugares (Venues)
 *
 * Capa de servicios que encapsula toda la comunicación con Firestore
 * para la gestión de lugares físicos donde se realizan eventos.
 *
 * Colección: `venues`
 *
 * Validaciones:
 *   - name es requerido.
 *   - city es requerida.
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
  orderBy,
  type Timestamp,
} from 'firebase/firestore';

import db from '../firebase/firestore';
import { COLLECTIONS } from '../constants/firestore';
import type {
  Venue,
  CreateVenueData,
  UpdateVenueData,
} from '../types/venue';
import type { EventResponse } from '../types/event';

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function handleVenueError<T>(error: unknown): EventResponse<T> {
  const firestoreError = error as { code?: string; message?: string };
  const code = firestoreError?.code || 'venues/unknown';

  return {
    success: false,
    error: firestoreError?.message || 'Error al procesar el lugar.',
    code,
  } as EventResponse<T>;
}

/**
 * Valida los campos requeridos para crear un venue.
 */
function validateVenueData(data: CreateVenueData): string | null {
  if (!data.name?.trim()) return 'El nombre del lugar es requerido.';
  if (!data.city?.trim()) return 'La ciudad es requerida.';
  return null;
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Obtiene todos los venues activos, ordenados por nombre.
 *
 * @returns Lista de venues.
 *
 * @example
 * const { data: venues } = await getVenues();
 */
export async function getVenues(): Promise<EventResponse<Venue[]>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.VENUES),
      orderBy('name', 'asc'),
    );

    const snapshot = await getDocs(q);
    const venues: Venue[] = [];

    snapshot.forEach((docSnap) => {
      venues.push({ id: docSnap.id, ...docSnap.data() } as Venue);
    });

    return { success: true, data: venues };
  } catch (error) {
    return handleVenueError(error);
  }
}

/**
 * Obtiene un venue por su ID.
 *
 * @param id - ID del documento en Firestore.
 * @returns El venue encontrado o error si no existe.
 *
 * @example
 * const { success, data } = await getVenueById('abc123');
 */
export async function getVenueById(id: string): Promise<EventResponse<Venue>> {
  try {
    const ref = doc(db, COLLECTIONS.VENUES, id);
    const docSnap = await getDoc(ref);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Lugar no encontrado.',
        code: 'not-found',
      };
    }

    const venue = { id: docSnap.id, ...docSnap.data() } as Venue;
    return { success: true, data: venue };
  } catch (error) {
    return handleVenueError(error);
  }
}

/**
 * Crea un nuevo venue.
 *
 * @param data - Datos del venue (name y city son requeridos).
 * @returns El venue creado o error de validación.
 *
 * @example
 * const response = await createVenue({
 *   name: 'Centro de Eventos, Acopi',
 *   city: 'Cali',
 *   capacity: 5000,
 * });
 */
export async function createVenue(data: CreateVenueData): Promise<EventResponse<Venue>> {
  // Validar campos requeridos
  const validationError = validateVenueData(data);
  if (validationError) {
    return {
      success: false,
      error: validationError,
      code: 'validation-error',
    };
  }

  try {
    const ref = doc(collection(db, COLLECTIONS.VENUES));

    const venue: Venue = {
      id: ref.id,
      name: data.name.trim(),
      description: data.description || '',
      address: data.address || '',
      city: data.city.trim(),
      country: data.country || 'Colombia',
      capacity: data.capacity ?? 0,
      imageUrl: data.imageUrl || '',
      active: data.active ?? true,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(ref, venue);

    return { success: true, data: venue };
  } catch (error) {
    return handleVenueError(error);
  }
}

/**
 * Actualiza un venue existente.
 *
 * @param id - ID del documento en Firestore.
 * @param data - Campos a actualizar.
 * @returns El venue actualizado.
 *
 * @example
 * const response = await updateVenue('abc123', { capacity: 6000 });
 */
export async function updateVenue(id: string, data: UpdateVenueData): Promise<EventResponse<Venue>> {
  try {
    const ref = doc(db, COLLECTIONS.VENUES, id);

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(ref, updateData);

    const docSnap = await getDoc(ref);
    const venue = { id: docSnap.id, ...docSnap.data() } as Venue;

    return { success: true, data: venue };
  } catch (error) {
    return handleVenueError(error);
  }
}
