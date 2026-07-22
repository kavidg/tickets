/**
 * TicketS - Tipos de Entradas (TicketTypes)
 *
 * Define los tipos para los tipos de entrada de un evento,
 * almacenados en Cloud Firestore.
 *
 * Colección: `ticketTypes`
 *
 * Relación:
 *   Un evento tiene muchos tipos de entrada (General, VIP, etc.).
 *   Cada tipo de entrada tiene su propio precio, cantidad y fechas de venta.
 */

import type { Timestamp } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Estados del tipo de entrada
// ---------------------------------------------------------------------------

/**
 * Estados posibles de un tipo de entrada.
 *
 * active:    A la venta.
 * paused:    Venta pausada temporalmente.
 * sold_out:  Agotado (quantity === soldQuantity).
 * closed:    Cerrado, ya no se venderá más.
 */
export type TicketTypeStatus = 'active' | 'paused' | 'sold_out' | 'closed';

/**
 * Etiquetas legibles para cada estado.
 */
export const TICKET_TYPE_STATUS_LABELS: Record<TicketTypeStatus, string> = {
  active: 'A la venta',
  paused: 'Pausada',
  sold_out: 'Agotada',
  closed: 'Cerrada',
};

/**
 * Lista de todos los estados disponibles.
 */
export const TICKET_TYPE_STATUSES: TicketTypeStatus[] = [
  'active',
  'paused',
  'sold_out',
  'closed',
];

// ---------------------------------------------------------------------------
// TicketType
// ---------------------------------------------------------------------------

/**
 * Tipo de entrada de un evento almacenado en Firestore.
 *
 * Cada evento puede tener múltiples tipos de entrada
 * (ej: General, VIP, Early Bird, etc.).
 */
export interface TicketType {
  /** ID único del documento en Firestore */
  id: string;
  /** ID del evento al que pertenece */
  eventId: string;
  /** Nombre del tipo de entrada (ej: 'General', 'VIP') */
  name: string;
  /** Descripción del tipo de entrada y sus beneficios */
  description: string;
  /** Precio por unidad */
  price: number;
  /** Cantidad total disponible para la venta */
  quantity: number;
  /** Cantidad de entradas vendidas */
  soldQuantity: number;
  /** Moneda (por defecto: 'COP') */
  currency: string;
  /** Estado del tipo de entrada */
  status: TicketTypeStatus;
  /** Fecha de inicio de la venta */
  salesStartDate: Timestamp;
  /** Fecha de fin de la venta */
  salesEndDate: Timestamp;
  /** Fecha de creación */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
}

/**
 * Datos para crear un tipo de entrada.
 */
export interface CreateTicketTypeData {
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  currency?: string;
  status?: TicketTypeStatus;
  salesStartDate: Timestamp;
  salesEndDate: Timestamp;
}

/**
 * Datos actualizables de un tipo de entrada.
 */
export interface UpdateTicketTypeData {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  currency?: string;
  status?: TicketTypeStatus;
  salesStartDate?: Timestamp;
  salesEndDate?: Timestamp;
}
