/**
 * TicketS - Servicio de Tipos de Entradas (TicketTypes)
 *
 * Capa de servicios que encapsula toda la comunicación con Firestore
 * para la gestión de tipos de entrada de cada evento.
 *
 * Colección: `ticketTypes`
 *
 * Validaciones:
 *   - name es requerido.
 *   - eventId es requerido.
 *   - price debe ser >= 0.
 *   - quantity debe ser > 0.
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
  type Timestamp,
} from 'firebase/firestore';

import db from '../firebase/firestore';
import { COLLECTIONS } from '../constants/firestore';
import type {
  TicketType,
  CreateTicketTypeData,
  UpdateTicketTypeData,
} from '../types/ticketType';
import type { EventResponse } from '../types/event';

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function handleTicketTypeError<T>(error: unknown): EventResponse<T> {
  const firestoreError = error as { code?: string; message?: string };
  const code = firestoreError?.code || 'ticket-types/unknown';

  return {
    success: false,
    error: firestoreError?.message || 'Error al procesar el tipo de entrada.',
    code,
  } as EventResponse<T>;
}

/**
 * Valida los campos requeridos para crear un tipo de entrada.
 */
function validateTicketTypeData(data: CreateTicketTypeData): string | null {
  if (!data.name?.trim()) return 'El nombre del tipo de entrada es requerido.';
  if (!data.eventId?.trim()) return 'El evento es requerido.';
  if (data.price < 0) return 'El precio debe ser mayor o igual a 0.';
  if (data.quantity <= 0) return 'La cantidad debe ser mayor a 0.';
  return null;
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Obtiene todos los tipos de entrada de un evento, ordenados por precio.
 *
 * @param eventId - ID del evento.
 * @returns Lista de tipos de entrada del evento.
 *
 * @example
 * const { data: types } = await getTicketTypesByEvent('event123');
 */
export async function getTicketTypesByEvent(
  eventId: string,
): Promise<EventResponse<TicketType[]>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.TICKET_TYPES),
      where('eventId', '==', eventId),
      orderBy('price', 'asc'),
    );

    const snapshot = await getDocs(q);
    const types: TicketType[] = [];

    snapshot.forEach((docSnap) => {
      types.push({ id: docSnap.id, ...docSnap.data() } as TicketType);
    });

    return { success: true, data: types };
  } catch (error) {
    return handleTicketTypeError(error);
  }
}

/**
 * Obtiene un tipo de entrada por su ID.
 *
 * @param id - ID del documento en Firestore.
 * @returns El tipo de entrada encontrado o error si no existe.
 *
 * @example
 * const { data: type } = await getTicketTypeById('abc123');
 */
export async function getTicketTypeById(
  id: string,
): Promise<EventResponse<TicketType>> {
  try {
    const ref = doc(db, COLLECTIONS.TICKET_TYPES, id);
    const docSnap = await getDoc(ref);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Tipo de entrada no encontrado.',
        code: 'not-found',
      };
    }

    const ticketType = { id: docSnap.id, ...docSnap.data() } as TicketType;
    return { success: true, data: ticketType };
  } catch (error) {
    return handleTicketTypeError(error);
  }
}

/**
 * Crea un nuevo tipo de entrada para un evento.
 *
 * @param data - Datos del tipo de entrada.
 * @returns El tipo de entrada creado o error de validación.
 *
 * @example
 * const response = await createTicketType({
 *   eventId: 'event123',
 *   name: 'VIP',
 *   price: 150000,
 *   quantity: 100,
 *   salesStartDate: startTimestamp,
 *   salesEndDate: endTimestamp,
 * });
 */
export async function createTicketType(
  data: CreateTicketTypeData,
): Promise<EventResponse<TicketType>> {
  // Validar campos requeridos
  const validationError = validateTicketTypeData(data);
  if (validationError) {
    return {
      success: false,
      error: validationError,
      code: 'validation-error',
    };
  }

  try {
    const ref = doc(collection(db, COLLECTIONS.TICKET_TYPES));

    const ticketType: TicketType = {
      id: ref.id,
      eventId: data.eventId.trim(),
      name: data.name.trim(),
      description: data.description || '',
      price: data.price,
      quantity: data.quantity,
      soldQuantity: 0,
      currency: data.currency || 'COP',
      status: data.status || 'active',
      salesStartDate: data.salesStartDate,
      salesEndDate: data.salesEndDate,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(ref, ticketType);

    return { success: true, data: ticketType };
  } catch (error) {
    return handleTicketTypeError(error);
  }
}

/**
 * Actualiza un tipo de entrada existente.
 *
 * @param id - ID del documento en Firestore.
 * @param data - Campos a actualizar.
 * @returns El tipo de entrada actualizado.
 *
 * @example
 * const response = await updateTicketType('abc123', { price: 180000 });
 */
export async function updateTicketType(
  id: string,
  data: UpdateTicketTypeData,
): Promise<EventResponse<TicketType>> {
  try {
    const ref = doc(db, COLLECTIONS.TICKET_TYPES, id);

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(ref, updateData);

    const docSnap = await getDoc(ref);
    const ticketType = { id: docSnap.id, ...docSnap.data() } as TicketType;

    return { success: true, data: ticketType };
  } catch (error) {
    return handleTicketTypeError(error);
  }
}
