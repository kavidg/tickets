/**
 * TicketS - UserProfile Interface (Backend)
 *
 * Representa el perfil de usuario almacenado en la colección `users` de Firestore.
 * El documento ID es el mismo UID de Firebase Auth (coincide con el campo uid).
 *
 * @see frontend/src/types/user.ts para los tipos del frontend.
 */

import type { Timestamp } from 'firebase-admin/firestore';

export type UserRole = 'super_admin' | 'organizador' | 'staff' | 'cliente';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface UserProfile {
  /** ID del documento Firestore (coincide con uid) */
  id: string;
  /** UID de Firebase Auth (coincide con id) */
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phone: string | null;
  city: string | null;
  emailVerified: boolean;
  role: UserRole;
  status: UserStatus;
  organizationId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin?: Timestamp;
}
