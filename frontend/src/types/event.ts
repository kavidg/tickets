/**
 * TicketS - Tipos de Eventos y Categorías
 *
 * Define los tipos para eventos y categorías almacenados en Cloud Firestore.
 *
 * Colecciones:
 *   categories → documentos de categorías
 *   events     → documentos de eventos
 */

import type { Timestamp } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Estados del evento
// ---------------------------------------------------------------------------

/**
 * Estados posibles de un evento.
 *
 * draft:     Borrador, solo visible por el organizador.
 * published: Publicado, visible para todos.
 * finished:  Evento finalizado.
 * cancelled: Evento cancelado.
 */
export type EventStatus = 'draft' | 'published' | 'finished' | 'cancelled';

/**
 * Etiquetas legibles para cada estado de evento.
 */
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
};

/**
 * Lista de todos los estados de evento disponibles.
 */
export const EVENT_STATUSES: EventStatus[] = ['draft', 'published', 'finished', 'cancelled'];

// ---------------------------------------------------------------------------
// Categoría
// ---------------------------------------------------------------------------

/**
 * Categoría de evento almacenada en Firestore.
 */
export interface Category {
  /** ID único del documento en Firestore */
  id: string;
  /** Nombre visible de la categoría (ej: 'Música', 'Tecnología') */
  name: string;
  /** Slug URL-friendly (ej: 'musica', 'tecnologia') */
  slug: string;
  /** Descripción breve de la categoría */
  description: string;
  /** URL de la imagen representativa */
  imageUrl: string;
  /** Indica si la categoría está activa */
  active: boolean;
  /** Fecha de creación */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
}

/**
 * Datos para crear o actualizar una categoría.
 */
export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
}

/**
 * Datos actualizables de una categoría.
 */
export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
}

// ---------------------------------------------------------------------------
// Evento
// ---------------------------------------------------------------------------

/**
 * Evento almacenado en Firestore.
 * Cada evento pertenece a una categoría y a un organizador.
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
  /** UID del organizador (usuario con rol organizador) */
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

/**
 * Datos para crear un evento.
 */
export interface CreateEventData {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  organizerId: string;
  imageUrl?: string;
  city: string;
  address: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status?: EventStatus;
}

/**
 * Datos actualizables de un evento.
 */
export interface UpdateEventData {
  title?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  imageUrl?: string;
  city?: string;
  address?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  status?: EventStatus;
}

// ---------------------------------------------------------------------------
// Respuestas del servicio
// ---------------------------------------------------------------------------

/**
 * Respuesta estándar para operaciones del servicio de eventos/categorías.
 */
export interface EventResponse<T = unknown> {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Datos del resultado (presente si success === true) */
  data?: T;
  /** Mensaje de error legible (presente si success === false) */
  error?: string;
  /** Código interno del error */
  code?: string;
}
