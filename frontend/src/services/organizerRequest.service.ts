/**
 * TicketS - Servicio de Solicitudes de Organizador
 *
 * Capa de servicios que encapsula toda la comunicación con Firestore
 * para la gestión de solicitudes de usuarios que desean ser organizadores.
 *
 * Colección: `organizerRequests`
 *
 * Flujo:
 *   1. Un usuario (rol: cliente) envía una solicitud.
 *   2. Un administrador revisa la solicitud y la aprueba o rechaza.
 *   3. Si es aprobada, se actualiza el rol del usuario y se crea la organización.
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
  OrganizerRequest,
  CreateOrganizerRequestData,
  UpdateRequestStatusData,
} from '../types/organization';
import type { EventResponse } from '../types/event';

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function handleRequestError<T>(error: unknown): EventResponse<T> {
  const firestoreError = error as { code?: string; message?: string };
  const code = firestoreError?.code || 'requests/unknown';

  return {
    success: false,
    error: firestoreError?.message || 'Error al procesar la solicitud.',
    code,
  } as EventResponse<T>;
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Crea una nueva solicitud para ser organizador.
 *
 * @param data - Datos de la solicitud.
 * @returns La solicitud creada.
 *
 * @example
 * const response = await createOrganizerRequest({
 *   userId: 'abc123',
 *   organizationName: 'Festivales SAS',
 *   description: 'Quiero crear eventos musicales.',
 *   city: 'Cali',
 *   phone: '+573001234567',
 *   email: 'user@example.com',
 * });
 */
export async function createOrganizerRequest(
  data: CreateOrganizerRequestData,
): Promise<EventResponse<OrganizerRequest>> {
  try {
    const ref = doc(collection(db, COLLECTIONS.ORGANIZER_REQUESTS));

    const request: OrganizerRequest = {
      id: ref.id,
      userId: data.userId,
      organizationName: data.organizationName,
      description: data.description,
      city: data.city,
      phone: data.phone,
      email: data.email,
      status: 'pending',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(ref, request);

    return { success: true, data: request };
  } catch (error) {
    return handleRequestError(error);
  }
}

/**
 * Obtiene todas las solicitudes pendientes, ordenadas por fecha de creación.
 *
 * @returns Lista de solicitudes pendientes.
 *
 * @example
 * const { data: pending } = await getPendingRequests();
 */
export async function getPendingRequests(): Promise<EventResponse<OrganizerRequest[]>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.ORGANIZER_REQUESTS),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc'),
    );

    const snapshot = await getDocs(q);
    const requests: OrganizerRequest[] = [];

    snapshot.forEach((docSnap) => {
      requests.push({ id: docSnap.id, ...docSnap.data() } as OrganizerRequest);
    });

    return { success: true, data: requests };
  } catch (error) {
    return handleRequestError(error);
  }
}

/**
 * Obtiene todas las solicitudes de un usuario específico.
 *
 * @param userId - UID del usuario.
 * @returns Lista de solicitudes del usuario.
 */
export async function getUserRequests(userId: string): Promise<EventResponse<OrganizerRequest[]>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.ORGANIZER_REQUESTS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);
    const requests: OrganizerRequest[] = [];

    snapshot.forEach((docSnap) => {
      requests.push({ id: docSnap.id, ...docSnap.data() } as OrganizerRequest);
    });

    return { success: true, data: requests };
  } catch (error) {
    return handleRequestError(error);
  }
}

/**
 * Actualiza el estado de una solicitud (aprobar o rechazar).
 *
 * @param id - ID del documento en Firestore.
 * @param data - Datos con el nuevo estado y quién lo revisó.
 * @returns La solicitud actualizada.
 *
 * @example
 * // Aprobar
 * await updateRequestStatus('req123', {
 *   status: 'approved',
 *   reviewedBy: 'admin456',
 * });
 *
 * // Rechazar
 * await updateRequestStatus('req123', {
 *   status: 'rejected',
 *   reviewedBy: 'admin456',
 *   rejectionReason: 'Documentación incompleta.',
 * });
 */
export async function updateRequestStatus(
  id: string,
  data: UpdateRequestStatusData,
): Promise<EventResponse<OrganizerRequest>> {
  try {
    const ref = doc(db, COLLECTIONS.ORGANIZER_REQUESTS, id);

    const updateData = {
      status: data.status,
      reviewedBy: data.reviewedBy,
      reviewedAt: serverTimestamp(),
      rejectionReason: data.rejectionReason || null,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(ref, updateData);

    const docSnap = await getDoc(ref);
    const request = { id: docSnap.id, ...docSnap.data() } as OrganizerRequest;

    return { success: true, data: request };
  } catch (error) {
    return handleRequestError(error);
  }
}
