/**
 * TicketS - Tipos de Lugares (Venues)
 *
 * Define los tipos para lugares físicos donde se realizan eventos,
 * almacenados en Cloud Firestore.
 *
 * Colección: `venues`
 *
 * Relación:
 *   Un venue puede albergar múltiples eventos.
 *   Un evento se realiza en un venue (vinculado por venueId).
 */

import type { Timestamp } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Venue / Lugar
// ---------------------------------------------------------------------------

/**
 * Lugar físico donde se realiza un evento.
 */
export interface Venue {
  /** ID único del documento en Firestore */
  id: string;
  /** Nombre del lugar (ej: 'Centro de Eventos, Acopi') */
  name: string;
  /** Descripción del lugar, servicios disponibles, etc. */
  description: string;
  /** Dirección específica (ej: 'Calle 5 # 20-30') */
  address: string;
  /** Ciudad donde se encuentra */
  city: string;
  /** País (por defecto: 'Colombia') */
  country: string;
  /** Capacidad máxima de asistentes */
  capacity: number;
  /** URL de imagen o galería del lugar */
  imageUrl: string;
  /** Indica si el lugar está activo para reservas */
  active: boolean;
  /** Fecha de creación */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
}

/**
 * Datos para crear un nuevo venue.
 */
export interface CreateVenueData {
  name: string;
  description?: string;
  address?: string;
  city: string;
  country?: string;
  capacity?: number;
  imageUrl?: string;
  active?: boolean;
}

/**
 * Datos actualizables de un venue.
 */
export interface UpdateVenueData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  capacity?: number;
  imageUrl?: string;
  active?: boolean;
}
