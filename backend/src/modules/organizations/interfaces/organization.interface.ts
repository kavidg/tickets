/**
 * TicketS - Organization Interface (Backend)
 *
 * Representa una organización almacenada en la colección `organizations` de Firestore.
 * Una organización puede administrar múltiples eventos y tener múltiples miembros.
 *
 * @see frontend/src/types/organization.ts para los tipos del frontend.
 */

import type { Timestamp } from 'firebase-admin/firestore';

/**
 * Estados posibles de una organización.
 *
 * active:   Organización activa, puede crear eventos.
 * pending:  Pendiente de revisión por el administrador.
 * suspended: Suspendida temporalmente.
 */
export type OrganizationStatus = 'active' | 'pending' | 'suspended';

/**
 * Organización almacenada en Firestore.
 */
export interface Organization {
  /** ID único del documento en Firestore */
  id: string;
  /** Nombre de la organización */
  name: string;
  /** Slug URL-friendly para la URL de la organización */
  slug: string;
  /** Descripción de la organización */
  description: string;
  /** URL del logo */
  logoUrl: string;
  /** Correo de contacto */
  email: string;
  /** Teléfono de contacto */
  phone: string;
  /** Ciudad de la organización */
  city: string;
  /** NIT/RUC de la organización (opcional) */
  nit?: string;
  /** UID del propietario (usuario creador) */
  ownerId: string;
  /** Estado de la organización */
  status: OrganizationStatus;
  /** Fecha de creación */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
}
