/**
 * TicketS - Servicio de Usuarios
 *
 * Capa de servicios para la gestión de perfiles de usuario.
 *
 * La creación del perfil se realiza a través del backend NestJS
 * (POST /api/v1/profile) para evitar escritura directa a Firestore.
 * Las operaciones de lectura aún consultan Firestore directamente
 * a través del SDK de Firebase.
 *
 * Arquitectura:
 *   Componente → Hook → Service → [NestJS API | Firestore SDK]
 *
 * Colección: `users`
 * Documento ID: UID de Firebase Auth
 */

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';

import db from '../firebase/firestore';
import auth from '../firebase/auth';
import { COLLECTIONS } from '../constants/firestore';
import type {
  UserProfile,
  UserResponse,
  CreateUserProfileData,
  UpdateUserProfileData,
} from '../types/user';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/**
 * URL base de la API NestJS.
 */
const API_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

/**
 * Procesa errores y devuelve una respuesta estructurada.
 */
function handleUserError(error: unknown): UserResponse {
  const err = error as { code?: string; message?: string };
  const code = err?.code || 'users/unknown';

  const messages: Record<string, string> = {
    'users/unknown': 'Ocurrió un error inesperado al procesar el perfil.',
    'not-found': 'El perfil de usuario no fue encontrado.',
    'permission-denied': 'No tienes permiso para acceder a este perfil.',
    'unavailable': 'El servicio no está disponible. Intenta más tarde.',
  };

  return {
    success: false,
    error: messages[code] || err?.message || 'Error desconocido.',
    code,
  };
}

/**
 * Obtiene el token JWT de Firebase Auth.
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// API pública del servicio
// ---------------------------------------------------------------------------

/**
 * Crea el perfil inicial de un usuario.
 *
 * Utiliza el endpoint POST /api/v1/profile del backend NestJS en lugar de
 * escribir directamente a Firestore. El uid y email se obtienen del token JWT.
 *
 * Importante: esta función solo debe llamarse DESPUÉS de verificar que el
 * perfil NO existe (GET /api/v1/profile respondió 404). Llamarla cuando el
 * perfil ya existe resultará en un error 400 del backend.
 *
 * @param data - Datos iniciales del perfil (displayName, phone, etc.).
 * @returns UserResponse con el perfil creado o detalles del error.
 */
export async function createUserProfile(data: CreateUserProfileData): Promise<UserResponse> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'No hay sesión activa para crear el perfil.',
        code: 'auth/no-token',
      };
    }

    const body: Record<string, unknown> = {};
    if (data.displayName !== undefined && data.displayName !== null) {
      body.displayName = data.displayName || '';
    }
    if (data.phone) body.phone = data.phone;
    if (data.city) body.city = data.city;
    if (data.photoURL) body.photoURL = data.photoURL;
    if (data.role) {
      body.role = data.role === 'organizador' ? 'organizer' :
                  data.role === 'super_admin' ? 'super_admin' :
                  'cliente';
    }

    const response = await fetch(`${API_URL}/profile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result?.message || result?.error || 'Error al crear el perfil.',
        code: `api/${response.status}`,
      };
    }

    const profileData = result?.data || result;

    const profile: UserProfile = {
      uid: profileData.uid || '',
      email: profileData.email || '',
      displayName: profileData.displayName || '',
      photoURL: profileData.photoURL ?? null,
      phone: profileData.phone ?? null,
      city: profileData.city ?? null,
      emailVerified: false,
      role: profileData.role === 'organizer' ? 'organizador' :
            profileData.role === 'super_admin' ? 'super_admin' :
            'cliente',
      status: 'active',
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as Timestamp,
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as Timestamp,
    };

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
