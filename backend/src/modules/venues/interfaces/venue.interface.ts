/**
 * TicketS - Venue Interface (Backend)
 *
 * Representa un lugar/espacio físico almacenado en la colección `venues` de Firestore.
 * Un venue pertenece a una organización y puede ser utilizado por múltiples eventos.
 *
 * @see frontend/src/types/venue.ts para los tipos del frontend (cuando exista).
 */

import type { Timestamp } from 'firebase-admin/firestore';

/**
 * Lugar/espacio físico para eventos.
 */
export interface Venue {
  /** ID único del documento en Firestore */
  id: string;
  /** ID de la organización propietaria del venue */
  organizationId: string;
  /** Nombre del lugar (ej: 'Centro de Eventos Valle del Pacífico') */
  name: string;
  /** Descripción del lugar */
  description: string;
  /** Dirección específica */
  address: string;
  /** Ciudad donde se ubica */
  city: string;
  /** Departamento / Estado / Provincia */
  state: string;
  /** País donde se ubica */
  country: string;
  /** Código postal */
  postalCode: string;
  /** Latitud (coordenada) */
  latitude: number;
  /** Longitud (coordenada) */
  longitude: number;
  /** Capacidad máxima de personas */
  capacity: number;
  /** URL de la imagen representativa del lugar */
  imageUrl: string;
  /** Indica si el lugar está activo y disponible */
  active: boolean;
  /** Fecha de creación */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
}
