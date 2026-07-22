/**
 * TicketS - Tipos de Organizaciones y Solicitudes
 *
 * Define los tipos para organizaciones y solicitudes de organizador
 * almacenados en Cloud Firestore.
 *
 * Colecciones:
 *   organizations     → documentos de organizaciones
 *   organizerRequests → solicitudes para ser organizador
 */

import type { Timestamp } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Estados de la organización
// ---------------------------------------------------------------------------

/**
 * Estados posibles de una organización.
 *
 * active:   Organización activa, puede crear eventos.
 * pending:  Pendiente de revisión por el administrador.
 * suspended: Suspendida temporalmente.
 */
export type OrganizationStatus = 'active' | 'pending' | 'suspended';

/**
 * Etiquetas legibles para cada estado de organización.
 */
export const ORGANIZATION_STATUS_LABELS: Record<OrganizationStatus, string> = {
  active: 'Activa',
  pending: 'Pendiente',
  suspended: 'Suspendida',
};

/**
 * Lista de todos los estados disponibles.
 */
export const ORGANIZATION_STATUSES: OrganizationStatus[] = ['active', 'pending', 'suspended'];

// ---------------------------------------------------------------------------
// Estados de la solicitud de organizador
// ---------------------------------------------------------------------------

/**
 * Estados posibles de una solicitud de organizador.
 *
 * pending:  Pendiente de revisión.
 * approved: Aprobada, el usuario ya es organizador.
 * rejected: Rechazada.
 */
export type RequestStatus = 'pending' | 'approved' | 'rejected';

/**
 * Etiquetas legibles para cada estado de solicitud.
 */
export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

/**
 * Lista de todos los estados de solicitud disponibles.
 */
export const REQUEST_STATUSES: RequestStatus[] = ['pending', 'approved', 'rejected'];

// ---------------------------------------------------------------------------
// Organización
// ---------------------------------------------------------------------------

/**
 * Organización almacenada en Firestore.
 * Una organización puede administrar múltiples eventos.
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
  /** UID del propietario (usuario con rol organizador) */
  ownerId: string;
  /** Estado de la organización */
  status: OrganizationStatus;
  /** Fecha de creación */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
}

/**
 * Datos para crear una organización.
 */
export interface CreateOrganizationData {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  email: string;
  phone?: string;
  city: string;
  ownerId: string;
  status?: OrganizationStatus;
}

/**
 * Datos actualizables de una organización.
 */
export interface UpdateOrganizationData {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  city?: string;
  status?: OrganizationStatus;
}

// ---------------------------------------------------------------------------
// Solicitud de organizador
// ---------------------------------------------------------------------------

/**
 * Solicitud de un usuario para convertirse en organizador.
 * Un administrador revisa y aprueba/rechaza la solicitud.
 */
export interface OrganizerRequest {
  /** ID único del documento en Firestore */
  id: string;
  /** UID del usuario que solicita ser organizador */
  userId: string;
  /** Nombre de la organización que desea crear */
  organizationName: string;
  /** Descripción del motivo de la solicitud */
  description: string;
  /** Ciudad donde operará */
  city: string;
  /** Teléfono de contacto */
  phone: string;
  /** Correo de contacto */
  email: string;
  /** Estado de la solicitud */
  status: RequestStatus;
  /** UID del administrador que revisó la solicitud */
  reviewedBy?: string;
  /** Fecha de revisión */
  reviewedAt?: Timestamp;
  /** Motivo del rechazo (si fue rechazada) */
  rejectionReason?: string;
  /** Fecha de creación */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
}

/**
 * Datos para crear una solicitud de organizador.
 */
export interface CreateOrganizerRequestData {
  userId: string;
  organizationName: string;
  description: string;
  city: string;
  phone: string;
  email: string;
}

/**
 * Datos para actualizar el estado de una solicitud.
 */
export interface UpdateRequestStatusData {
  status: RequestStatus;
  reviewedBy: string;
  reviewedAt?: Timestamp;
  rejectionReason?: string;
}
