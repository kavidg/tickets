/**
 * TicketS - Event Interface (Backend)
 *
 * Representa un evento almacenado en la colección `events` de Firestore.
 * Cada evento pertenece a una organización y a una categoría.
 *
 * @see frontend/src/types/event.ts para los tipos del frontend.
 */

import type { Timestamp } from 'firebase-admin/firestore';

/**
 * Estados posibles de un evento.
 *
 * draft:     Borrador, solo visible por el organizador.
 * published: Publicado, visible para todos los usuarios.
 * finished:  Evento finalizado.
 * cancelled: Evento cancelado por el organizador.
 */
export type EventStatus = 'draft' | 'published' | 'finished' | 'cancelled';

/**
 * Evento almacenado en Firestore.
 */
export interface Event {
  /** ID único del documento en Firestore */
  id: string;
  /** Título del evento */
  title: string;
  /** Slug URL-friendly para la URL del evento */
  slug: string;
  /** Descripción detallada del evento */
  description: string;
  /** ID de la categoría a la que pertenece */
  categoryId: string;
  /** ID de la organización organizadora */
  organizationId: string;
  /** ID del lugar/venue (opcional) */
  venueId?: string;
  /** UID del organizador (usuario creador) */
  organizerId: string;
  /** URL del banner o imagen principal */
  imageUrl: string;
  /** Ciudad donde se realiza el evento */
  city: string;
  /** Dirección específica del lugar */
  address: string;
  /** Fecha y hora de inicio */
  startDate: Timestamp;
  /** Fecha y hora de fin */
  endDate: Timestamp;
  /** Estado del evento */
  status: EventStatus;
  /** Fecha de creación */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
}
