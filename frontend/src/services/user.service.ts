/**
 * TicketS - Servicio de Usuarios
 *
 * Capa de servicios que encapsula toda la comunicación con Firestore
 * para la gestión de perfiles de usuario.
 *
 * Los componentes visuales y hooks NUNCA deben importar firebase/firestore
 * directamente. Siempre deben usar este servicio.
 *
 * Arquitectura:
 *   Componente → Hook → Service → Firestore
 *
 * Colección: `users`
 * Documento ID: UID de Firebase Auth
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';

import db from '../firebase/firestore';
import { COLLECTIONS } from '../constants/firestore';
import type {
  UserProfile,
  UserResponse,
  CreateUserProfileData,
  UpdateUserProfileData,
} from '../types/user';

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

/**
 * Procesa errores de Firestore y devuelve una respuesta estructurada.
 */
function handleUserError(error: unknown): UserResponse {
  const firestoreError = error as { code?: string; message?: string };
  const code = firestoreError?.code || 'users/unknown';

  const messages: Record<string, string> = {
    'users/unknown': 'Ocurrió un error inesperado al procesar el perfil.',
    'not-found': 'El perfil de usuario no fue encontrado.',
    'permission-denied': 'No tienes permiso para acceder a este perfil.',
    'unavailable': 'El servicio no está disponible. Intenta más tarde.',
  };

  return {
    success: false,
    error: messages[code] || firestoreError?.message || 'Error desconocido.',
    code,
  };
}

// ---------------------------------------------------------------------------
// API pública del servicio
// ---------------------------------------------------------------------------

/**
 * Crea el perfil inicial de un usuario en Firestore.
 *
 * Debe ejecutarse inmediatamente después del registro exitoso en Firebase Auth.
 * Usa el UID de Firebase Auth como ID del documento.
 *
 * @param data - Datos iniciales del perfil (uid, email, displayName opcional, rol opcional).
 * @returns UserResponse con el perfil creado o detalles del error.
 *
 * @example
 * const response = await createUserProfile({
 *   uid: 'abc123',
 *   email: 'user@example.com',
 *   displayName: 'María García',
 *   role: 'organizador',
 * });
 */
export async function createUserProfile(data: CreateUserProfileData): Promise<UserResponse> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, data.uid);

    const profile: UserProfile = {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName || data.email.split('@')[0],
      photoURL: data.photoURL ?? null,
      phone: data.phone ?? null,
      city: data.city ?? null,
      emailVerified: data.emailVerified ?? false,
      role: data.role || 'cliente',
      status: data.status || 'active',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(userRef, profile);

    return {
      success: true,
      profile,
    };
  } catch (error) {
    return handleUserError(error);
  }
}

/**
 * Obtiene el perfil de un usuario por su UID.
 *
 * @param uid - UID del usuario en Firebase Auth.
 * @returns UserResponse con el perfil o error si no existe.
 *
 * @example
 * const { success, profile } = await getUserProfile('abc123');
 * if (success && profile) {
 *   console.log(profile.displayName);
 * }
 */
export async function getUserProfile(uid: string): Promise<UserResponse> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'El perfil de usuario no fue encontrado.',
        code: 'not-found',
      };
    }

    const profile = docSnap.data() as UserProfile;

    return {
      success: true,
      profile,
    };
  } catch (error) {
    return handleUserError(error);
  }
}

/**
 * Actualiza los datos del perfil de un usuario.
 *
 * Solo actualiza los campos proporcionados. Los campos no incluidos
 * permanecen sin cambios. `updatedAt` se actualiza automáticamente.
 *
 * @param uid - UID del usuario.
 * @param data - Campos a actualizar (displayName, photoURL, phone).
 * @returns UserResponse con el perfil actualizado o error.
 *
 * @example
 * const response = await updateUserProfile('abc123', {
 *   displayName: 'María García López',
 *   phone: '+573001234567',
 * });
 */
export async function updateUserProfile(uid: string, data: UpdateUserProfileData): Promise<UserResponse> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updateData);

    // Obtener el perfil actualizado para devolverlo
    const docSnap = await getDoc(userRef);
    const profile = docSnap.data() as UserProfile;

    return {
      success: true,
      profile,
    };
  } catch (error) {
    return handleUserError(error);
  }
}

/**
 * Verifica si existe un perfil de usuario en Firestore.
 *
 * Útil para determinar si es la primera vez que el usuario inicia sesión
 * y necesita crear su perfil.
 *
 * @param uid - UID del usuario.
 * @returns true si el perfil existe, false en caso contrario.
 *
 * @example
 * const exists = await checkUserProfile('abc123');
 * if (!exists) {
 *   await createUserProfile({ uid, email });
 * }
 */
export async function checkUserProfile(uid: string): Promise<boolean> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const docSnap = await getDoc(userRef);
    return docSnap.exists();
  } catch {
    return false;
  }
}

/**
 * Actualiza la fecha del último inicio de sesión del usuario.
 *
 * Debe ejecutarse después de un login exitoso para registrar
 * la actividad del usuario.
 *
 * @param uid - UID del usuario.
 * @returns UserResponse indicando éxito o error.
 *
 * @example
 * await updateUserLastLogin('abc123');
 */
export async function updateUserLastLogin(uid: string): Promise<UserResponse> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);

    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    return handleUserError(error);
  }
}
