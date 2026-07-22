/**
 * TicketS - Tipos de Usuario (Perfil en Firestore)
 *
 * Define los tipos para el perfil de usuario almacenado en Cloud Firestore.
 * Complementa AuthUser (autenticación) con datos persistentes del usuario.
 *
 * Colección en Firestore: `users`
 * Documento ID: El mismo UID de Firebase Auth
 */

import type { Timestamp } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Estados del usuario
// ---------------------------------------------------------------------------

/**
 * Estados posibles de la cuenta de un usuario.
 *
 * active:    Cuenta activa y en uso.
 * inactive:  Cuenta desactivada temporalmente.
 * suspended: Cuenta suspendida por administración.
 */
export type UserStatus = 'active' | 'inactive' | 'suspended';

/**
 * Etiquetas legibles para cada estado.
 */
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
};

/**
 * Lista de todos los estados disponibles.
 */
export const USER_STATUSES: UserStatus[] = ['active', 'inactive', 'suspended'];

// ---------------------------------------------------------------------------
// Roles del sistema
// ---------------------------------------------------------------------------

/**
 * Roles disponibles en la plataforma TicketS.
 *
 * Super Admin: Administrador global de la plataforma.
 * Organizador: Crea y administra eventos.
 * Staff:    Personal de apoyo del organizador (check-in, etc.).
 * Cliente:  Comprador de entradas (rol por defecto).
 */
export type UserRole = 'super_admin' | 'organizador' | 'staff' | 'cliente';

/**
 * Etiquetas legibles para cada rol.
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  organizador: 'Organizador',
  staff: 'Staff',
  cliente: 'Cliente',
};

/**
 * Lista de todos los roles disponibles.
 */
export const USER_ROLES: UserRole[] = ['super_admin', 'organizador', 'staff', 'cliente'];

// ---------------------------------------------------------------------------
// Perfil de usuario
// ---------------------------------------------------------------------------

/**
 * Perfil de usuario almacenado en Firestore.
 * Cada documento usa el UID de Firebase Auth como ID del documento.
 */
export interface UserProfile {
  /** Mismo UID que Firebase Auth (ID del documento en Firestore) */
  uid: string;
  /** Correo electrónico del usuario */
  email: string;
  /** Nombre completo visible */
  displayName: string;
  /** URL de la foto de perfil */
  photoURL: string | null;
  /** Número de teléfono */
  phone: string | null;
  /** Ciudad de residencia */
  city: string | null;
  /** Indica si el correo electrónico ha sido verificado */
  emailVerified: boolean;
  /** Rol del usuario en la plataforma */
  role: UserRole;
  /** Estado de la cuenta del usuario */
  status: UserStatus;
  /** Fecha de creación del perfil */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
  /** Fecha del último inicio de sesión */
  lastLogin?: Timestamp;
}

// ---------------------------------------------------------------------------
// Tipos para operaciones CRUD
// ---------------------------------------------------------------------------

/**
 * Datos necesarios para crear el perfil inicial de un usuario.
 */
export interface CreateUserProfileData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string | null;
  phone?: string | null;
  city?: string | null;
  emailVerified?: boolean;
  role?: UserRole;
  status?: UserStatus;
}

/**
 * Datos actualizables del perfil de usuario.
 * Solo los campos que el usuario puede modificar.
 */
export interface UpdateUserProfileData {
  displayName?: string;
  photoURL?: string | null;
  phone?: string | null;
  city?: string | null;
}

/**
 * Respuesta estándar para operaciones del servicio de usuarios.
 */
export interface UserResponse {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Perfil de usuario (presente si success === true) */
  profile?: UserProfile;
  /** Mensaje de error legible (presente si success === false) */
  error?: string;
  /** Código interno del error */
  code?: string;
}
