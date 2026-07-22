/**
 * TicketS - Servicio de Organizaciones
 *
 * Capa de servicios que encapsula toda la comunicación con Firestore
 * para la gestión de organizaciones.
 *
 * Colección: `organizations`
 *
 * Reglas de seguridad (ver FIRESTORE_RULES.md):
 *   - Solo el propietario y administradores pueden modificar.
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
  Organization,
  CreateOrganizationData,
  UpdateOrganizationData,
} from '../types/organization';
import type { EventResponse } from '../types/event';

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function handleOrgError<T>(error: unknown): EventResponse<T> {
  const firestoreError = error as { code?: string; message?: string };
  const code = firestoreError?.code || 'organizations/unknown';

  return {
    success: false,
    error: firestoreError?.message || 'Error al procesar la organización.',
    code,
  } as EventResponse<T>;
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Obtiene una organización por su ID.
 *
 * @param id - ID del documento en Firestore.
 * @returns La organización encontrada o error.
 *
 * @example
 * const { success, data } = await getOrganizationById('abc123');
 */
export async function getOrganizationById(id: string): Promise<EventResponse<Organization>> {
  try {
    const ref = doc(db, COLLECTIONS.ORGANIZATIONS, id);
    const docSnap = await getDoc(ref);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Organización no encontrada.',
        code: 'not-found',
      };
    }

    const org = { id: docSnap.id, ...docSnap.data() } as Organization;
    return { success: true, data: org };
  } catch (error) {
    return handleOrgError(error);
  }
}

/**
 * Obtiene las organizaciones de un usuario por su ownerId.
 *
 * @param ownerId - UID del propietario.
 * @returns Lista de organizaciones del usuario.
 */
export async function getUserOrganizations(ownerId: string): Promise<EventResponse<Organization[]>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.ORGANIZATIONS),
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);
    const orgs: Organization[] = [];

    snapshot.forEach((docSnap) => {
      orgs.push({ id: docSnap.id, ...docSnap.data() } as Organization);
    });

    return { success: true, data: orgs };
  } catch (error) {
    return handleOrgError(error);
  }
}

/**
 * Verifica si un slug de organización ya está en uso.
 *
 * @param slug - Slug a verificar.
 * @returns true si el slug ya existe.
 */
export async function checkSlugExists(slug: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, COLLECTIONS.ORGANIZATIONS),
      where('slug', '==', slug),
      limit(1),
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch {
    return false;
  }
}

/**
 * Crea una nueva organización.
 *
 * @param data - Datos de la organización.
 * @returns La organización creada.
 *
 * @example
 * const response = await createOrganization({
 *   name: 'Festivales SAS',
 *   slug: 'festivales-sas',
 *   email: 'contacto@festivales.com',
 *   city: 'Cali',
 *   ownerId: 'abc123',
 * });
 */
export async function createOrganization(data: CreateOrganizationData): Promise<EventResponse<Organization>> {
  try {
    const ref = doc(collection(db, COLLECTIONS.ORGANIZATIONS));

    const org: Organization = {
      id: ref.id,
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      logoUrl: data.logoUrl || '',
      email: data.email,
      phone: data.phone || '',
      city: data.city,
      ownerId: data.ownerId,
      status: data.status || 'active',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(ref, org);

    return { success: true, data: org };
  } catch (error) {
    return handleOrgError(error);
  }
}

/**
 * Actualiza una organización existente.
 *
 * @param id - ID del documento en Firestore.
 * @param data - Campos a actualizar.
 * @returns La organización actualizada.
 *
 * @example
 * const response = await updateOrganization('abc123', { status: 'suspended' });
 */
export async function updateOrganization(id: string, data: UpdateOrganizationData): Promise<EventResponse<Organization>> {
  try {
    const ref = doc(db, COLLECTIONS.ORGANIZATIONS, id);

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(ref, updateData);

    const docSnap = await getDoc(ref);
    const org = { id: docSnap.id, ...docSnap.data() } as Organization;

    return { success: true, data: org };
  } catch (error) {
    return handleOrgError(error);
  }
}
