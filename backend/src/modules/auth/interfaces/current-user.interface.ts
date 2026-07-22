/**
 * TicketS - CurrentUser Interface
 *
 * Representa los datos del usuario autenticado disponibles en request.user
 * después de pasar por FirebaseAuthGuard.
 *
 * Combina datos del token de Firebase Auth con el perfil de Firestore:
 *   - Token: uid, email, emailVerified, phoneNumber, customClaims
 *   - Firestore: role, status, organizationId, displayName, photoURL, phone, city
 *
 * @see FirebaseAuthGuard para la validación del token + consulta Firestore.
 * @see CurrentUser decorator para acceder desde los controladores.
 */

/**
 * Roles disponibles en la plataforma.
 */
export type UserRole = 'super_admin' | 'organizador' | 'staff' | 'cliente';

/**
 * Estados posibles de la cuenta.
 */
export type UserStatus = 'active' | 'inactive' | 'suspended';

/**
 * Usuario autenticado disponible en request.user después de
 * pasar por FirebaseAuthGuard.
 *
 * Los campos marcados como "Firestore" provienen de la colección `users`.
 * Los campos marcados como "Token" provienen del token de Firebase Auth.
 */
export interface CurrentUser {
  // -------------------------------------------------------------------------
  // Campos del Token de Firebase Auth
  // -------------------------------------------------------------------------

  /** UID de Firebase Auth */
  uid: string;
  /** Email del usuario (Token) */
  email: string;
  /** Indica si el email está verificado (Token) */
  emailVerified: boolean;
  /** Claims personalizados del usuario (Token) */
  customClaims: Record<string, unknown>;
  /** Teléfono del usuario (Token) */
  phoneNumber: string;
  /** Indica si la cuenta está deshabilitada (Token) */
  disabled: boolean;
  /** Proveedor utilizado para autenticarse (Token) */
  provider: string;
  /** Timestamp de creación de la cuenta (Token) */
  createdAt: string;
  /** Timestamp del último inicio de sesión (Token) */
  lastSignInAt: string;

  // -------------------------------------------------------------------------
  // Campos del perfil en Firestore (colección `users`)
  // -------------------------------------------------------------------------

  /** Nombre visible del usuario (Firestore) */
  displayName: string;
  /** URL de la foto de perfil (Firestore) */
  photoURL: string;
  /** Rol del usuario en la plataforma (Firestore, opcional si no existe perfil) */
  role?: UserRole;
  /** Estado de la cuenta del usuario (Firestore, opcional si no existe perfil) */
  status?: UserStatus;
  /** ID de la organización a la que pertenece (Firestore, opcional) */
  organizationId?: string;
  /** Ciudad de residencia (Firestore, opcional) */
  city?: string;
}
