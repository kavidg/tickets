/**
 * TicketS - Servicio de Autenticación
 *
 * Capa de servicios que encapsula toda la comunicación con Firebase Authentication.
 * Los componentes visuales y hooks NUNCA deben importar firebase/auth directamente.
 * Siempre deben usar este servicio.
 *
 * Arquitectura:
 *   Componente → Hook → Service → Firebase Auth
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type UserCredential,
} from 'firebase/auth';

import auth from '../firebase/auth';
import {
  AUTH_ERROR_MESSAGES,
  type AuthUser,
  type AuthResponse,
  type AuthStateListener,
} from '../types/auth';

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

/**
 * Interfaz mínima del usuario de Firebase Auth necesaria para las operaciones
 * que requieren el usuario actual (sendEmailVerification, reload).
 */
interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL: string | null;
  reload: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

/**
 * Convierte un objeto User de Firebase Auth a nuestro tipo AuthUser.
 * Esto mantiene el resto de la aplicación desacoplada del SDK de Firebase.
 */
function mapFirebaseUser(user: { 
  uid: string; 
  email: string | null; 
  displayName: string | null; 
  emailVerified: boolean; 
  photoURL: string | null;
}): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    photoURL: user.photoURL,
  };
}

/**
 * Procesa errores de Firebase Auth y devuelve una respuesta estructurada
 * con mensajes en español.
 */
function handleAuthError(error: unknown): AuthResponse {
  const firebaseError = error as { code?: string; message?: string };
  const code = firebaseError?.code || 'auth/unknown';

  return {
    success: false,
    error: AUTH_ERROR_MESSAGES[code] || firebaseError?.message || 'Ocurrió un error inesperado.',
    code,
  };
}

/**
 * Extrae el AuthUser de un UserCredential de Firebase.
 */
function extractUser(credential: UserCredential): AuthUser {
  return mapFirebaseUser(credential.user);
}

// ---------------------------------------------------------------------------
// API pública del servicio
// ---------------------------------------------------------------------------

/**
 * Registra un nuevo usuario con correo electrónico y contraseña.
 *
 * @param email - Correo electrónico del usuario.
 * @param password - Contraseña (mínimo 6 caracteres según Firebase).
 * @returns AuthResponse con el usuario creado o detalles del error.
 *
 * @example
 * const response = await registerUser('user@example.com', 'securePass123');
 * if (response.success) {
 *   console.log('Usuario creado:', response.user);
 * }
 */
export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: extractUser(credential),
    };
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * Inicia sesión con correo electrónico y contraseña.
 *
 * Firebase Auth maneja automáticamente la persistencia de la sesión
 * en indexedDB (no se guardan tokens en localStorage).
 *
 * @param email - Correo electrónico del usuario.
 * @param password - Contraseña del usuario.
 * @returns AuthResponse con el usuario autenticado o detalles del error.
 *
 * @example
 * const response = await loginUser('user@example.com', 'securePass123');
 * if (response.success) {
 *   console.log('Bienvenido:', response.user?.displayName);
 * }
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: extractUser(credential),
    };
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * Cierra la sesión del usuario actual.
 *
 * Limpia la sesión en Firebase Auth. El estado global deberá
 * actualizarse desde el AuthContext al escuchar onAuthStateChanged.
 *
 * @returns AuthResponse indicando éxito o error.
 *
 * @example
 * const response = await logoutUser();
 * if (!response.success) {
 *   console.error('Error al cerrar sesión:', response.error);
 * }
 */
export async function logoutUser(): Promise<AuthResponse> {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * Envía un correo electrónico para restablecer la contraseña.
 *
 * Firebase Auth se encarga de generar el enlace y enviar el correo
 * desde la plantilla configurada en la consola de Firebase.
 *
 * @param email - Correo electrónico de la cuenta a recuperar.
 * @returns AuthResponse indicando si el correo fue enviado.
 *
 * @example
 * const response = await resetPassword('user@example.com');
 * if (response.success) {
 *   alert('Revisa tu bandeja de entrada');
 * }
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * Obtiene el usuario actualmente autenticado (síncrono).
 *
 * Esta función consulta el estado en memoria de Firebase Auth.
 * Para obtener el usuario al cargar la aplicación, usa onAuthStateChanged.
 *
 * @returns AuthUser si hay sesión activa, null en caso contrario.
 *
 * @example
 * const user = getCurrentUser();
 * if (user) {
 *   console.log('Sesión activa:', user.email);
 * }
 */
export function getCurrentUser(): AuthUser | null {
  const user = auth.currentUser;
  return user ? mapFirebaseUser(user) : null;
}

/**
 * Envía un correo de verificación al usuario actualmente autenticado.
 *
 * Firebase Auth envía un correo con un enlace que el usuario debe
 * presionar para verificar su dirección de correo electrónico.
 *
 * @returns AuthResponse indicando éxito o error.
 *
 * @example
 * const response = await sendVerificationEmail();
 * if (response.success) {
 *   alert('Correo de verificación enviado');
 * }
 */
export async function sendVerificationEmail(): Promise<AuthResponse> {
  try {
    const user = auth.currentUser as FirebaseUser | null;
    if (!user) {
      return {
        success: false,
        error: 'No hay ninguna sesión activa.',
        code: 'auth/no-user',
      };
    }

    await user.sendEmailVerification();
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * Refresca el estado del usuario actual desde Firebase Auth.
 *
 * Útil para actualizar `emailVerified` después de que el usuario
 * verifica su correo, sin necesidad de recargar la página.
 *
 * @returns AuthResponse con el usuario actualizado o error.
 *
 * @example
 * const response = await reloadCurrentUser();
 * if (response.success && response.user?.emailVerified) {
 *   console.log('Correo verificado');
 * }
 */
export async function reloadCurrentUser(): Promise<AuthResponse> {
  try {
    const user = auth.currentUser as FirebaseUser | null;
    if (!user) {
      return {
        success: false,
        error: 'No hay ninguna sesión activa.',
        code: 'auth/no-user',
      };
    }

    await user.reload();

    const refreshedUser = auth.currentUser;
    return {
      success: true,
      user: refreshedUser ? mapFirebaseUser(refreshedUser) : undefined,
    };
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * Escucha cambios en el estado de autenticación.
 *
 * Se dispara automáticamente al:
 * - Iniciar sesión
 * - Cerrar sesión
 * - Recargar la página (si hay sesión persistente)
 * - Cambiar el token del usuario
 *
 * @param callback - Función que recibe el AuthUser o null.
 * @returns Función para cancelar la suscripción (unsubscribe).
 *
 * @example
 * useEffect(() => {
 *   const unsubscribe = onAuthStateChanged((user) => {
 *     if (user) {
 *       setUser(user);
 *     } else {
 *       setUser(null);
 *     }
 *   });
 *   return () => unsubscribe();
 * }, []);
 */
export function onAuthStateChanged(callback: AuthStateListener): () => void {
  return firebaseOnAuthStateChanged(auth, (user) => {
    callback(user ? mapFirebaseUser(user) : null);
  });
}
