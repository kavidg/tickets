/**
 * TicketS - Profile Interface (Backend)
 *
 * Representa el perfil de usuario almacenado en la colección `users` de Firestore.
 * Cada documento usa el UID de Firebase Auth como ID del documento.
 *
 * Un perfil puede ser:
 *   - super_admin: Acceso completo al sistema.
 *   - organizer:    Propietario de una organización, puede gestionar eventos.
 *
 * @see ProfileService para la lógica de gestión del perfil.
 */

import type { Timestamp } from 'firebase-admin/firestore';

/**
 * Roles de usuario en la plataforma.
 *
 * super_admin: Acceso completo a todas las funcionalidades del sistema.
 * organizer:   Usuario organizador propietario de una organización.
 */
export type ProfileRole = 'super_admin' | 'organizer';

/**
 * Perfil de usuario almacenado en Firestore.
 */
export interface Profile {
  /** ID del documento Firestore (coincide con uid de Firebase Auth) */
  id: string;
  /** UID de Firebase Auth (coincide con id) */
  uid: string;
  /** Email del usuario */
  email: string;
  /** Nombre visible del usuario */
  displayName?: string;
  /** Rol del usuario en la plataforma */
  role: ProfileRole;
  /** ID de la organización asociada (solo para organizers) */
  organizationId?: string;
  /** Fecha de creación del perfil */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
}
