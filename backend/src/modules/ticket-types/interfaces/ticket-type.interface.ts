/**
 * TicketS - TicketType Interface (Backend)
 *
 * Representa un tipo de entrada para un evento almacenado en la colección
 * `ticketTypes` de Firestore.
 *
 * Cada evento puede tener múltiples tipos de entrada (General, VIP, Palco, etc.).
 * El stock se controla mediante quantity (total) y soldQuantity (vendidos).
 *
 * @see frontend/src/types/ticketType.ts para los tipos del frontend.
 */

import type { Timestamp } from 'firebase-admin/firestore';

/**
 * Estados posibles de un tipo de entrada.
 *
 * active:    A la venta, visible y disponible para compra.
 * paused:    Pausado temporalmente por el organizador.
 * sold_out:  Agotado (quantity === soldQuantity).
 * closed:    Cerrado definitivamente (ya no se venderá).
 */
export type TicketTypeStatus = 'active' | 'paused' | 'sold_out' | 'closed';

/**
 * Tipo de entrada almacenado en Firestore.
 */
export interface TicketType {
  /** ID único del documento en Firestore */
  id: string;
  /** ID del evento al que pertenece */
  eventId: string;
  /** ID de la organización propietaria del evento */
  organizationId: string;
  /** Nombre visible del tipo de entrada (ej: 'General', 'VIP') */
  name: string;
  /** Descripción del tipo de entrada */
  description: string;
  /** Precio unitario en la moneda especificada */
  price: number;
  /** Cantidad total de entradas disponibles de este tipo */
  quantity: number;
  /** Cantidad de entradas vendidas (inicia en 0, solo modificable por Purchases) */
  soldQuantity: number;
  /** Cantidad de entradas reservadas temporalmente (compras en estado pending) */
  reservedQuantity: number;
  /** Código de moneda (por defecto 'COP') */
  currency: string;
  /** Estado actual del tipo de entrada */
  status: TicketTypeStatus;
  /** Fecha de inicio de venta (opcional) */
  salesStartDate?: Timestamp;
  /** Fecha de fin de venta (opcional) */
  salesEndDate?: Timestamp;
  /** Fecha de creación */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
}
