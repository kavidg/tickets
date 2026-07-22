/**
 * TicketS - Tipos de Autenticación
 *
 * Define los tipos compartidos para el módulo de autenticación.
 * Desacoplados de Firebase para mantener la capa de servicios como
 * única interfaz con el SDK.
 */

/**
 * Representación serializable del usuario autenticado.
 * Mapeado desde firebase.User pero sin dependencia directa.
 */
export interface AuthUser {
  /** Identificador único del usuario en Firebase Auth */
  uid: string;
  /** Correo electrónico registrado */
  email: string | null;
  /** Nombre visible del usuario */
  displayName: string | null;
  /** Indica si el correo ha sido verificado */
  emailVerified: boolean;
  /** URL de la foto de perfil */
  photoURL: string | null;
}

/**
 * Respuesta estándar para todas las operaciones de autenticación.
 */
export interface AuthResponse {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Usuario autenticado (presente solo si success === true) */
  user?: AuthUser;
  /** Mensaje de error legible (presente solo si success === false) */
  error?: string;
  /** Código interno del error (ej: 'auth/email-already-in-use') */
  code?: string;
}

/**
 * Credenciales básicas para inicio de sesión y registro.
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Callback para el listener de cambios en el estado de autenticación.
 * Recibe el usuario o null si la sesión ha terminado.
 */
export type AuthStateListener = (user: AuthUser | null) => void;

/**
 * Mapa de códigos de error de Firebase Auth a mensajes en español.
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Este correo electrónico ya está registrado.',
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/user-not-found': 'No existe una cuenta con este correo electrónico.',
  'auth/wrong-password': 'La contraseña ingresada es incorrecta.',
  'auth/invalid-credential': 'Las credenciales ingresadas no son válidas.',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta de nuevo más tarde.',
  'auth/network-request-failed': 'Error de conexión. Verifica tu conexión a internet.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
  'auth/operation-not-allowed': 'Esta operación no está habilitada.',
  'auth/requires-recent-login': 'Debes iniciar sesión nuevamente para continuar.',
  'auth/expired-action-code': 'El código de verificación ha expirado.',
  'auth/invalid-action-code': 'El código de verificación no es válido.',
};
