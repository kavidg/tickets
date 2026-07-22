/**
 * TicketS - Tipos de Compras (Purchases)
 *
 * Define los tipos para las compras de entradas, almacenadas en Cloud Firestore.
 *
 * Colección: `purchases`
 *
 * Relación:
 *   Un usuario puede tener muchas compras.
 *   Una compra pertenece a un evento y a una organización.
 *   Cada compra contiene items con los tipos de entrada adquiridos.
 *
 * Flujo futuro:
 *   Purchase → Pago (pasarela) → Ticket (generación por item)
 *   1. Crear Purchase con status "pending"
 *   2. Procesar pago
 *   3. Actualizar status a "paid"
 *   4. Generar tickets por cada item/quantity
 */

import type { Timestamp } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Estados de la compra
// ---------------------------------------------------------------------------

/**
 * Estados posibles de una compra.
 *
 * pending:   Pendiente de pago.
 * paid:      Pagada exitosamente.
 * cancelled: Cancelada por el usuario o por el sistema.
 * expired:   Expirada por tiempo límite de pago no cumplido.
 */
export type PurchaseStatus = 'pending' | 'paid' | 'cancelled' | 'expired';

/**
 * Etiquetas legibles para cada estado de compra.
 */
export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagada',
  cancelled: 'Cancelada',
  expired: 'Expirada',
};

/**
 * Lista de todos los estados disponibles.
 */
export const PURCHASE_STATUSES: PurchaseStatus[] = [
  'pending',
  'paid',
  'cancelled',
  'expired',
];

// ---------------------------------------------------------------------------
// Item de compra
// ---------------------------------------------------------------------------

/**
 * Item individual dentro de una compra.
 *
 * Representa un tipo de entrada adquirido con su cantidad y precio.
 * Cada item puede generar uno o más tickets (según quantity).
 */
export interface PurchaseItem {
  /** ID del tipo de entrada en Firestore */
  ticketTypeId: string;
  /** Nombre del tipo de entrada al momento de la compra (ej: 'VIP') */
  ticketName: string;
  /** Cantidad de entradas adquiridas de este tipo */
  quantity: number;
  /** Precio unitario al momento de la compra */
  unitPrice: number;
  /** Subtotal del item (unitPrice × quantity) */
  subtotal: number;
}

// ---------------------------------------------------------------------------
// Purchase (Compra)
// ---------------------------------------------------------------------------

/**
 * Compra de entradas almacenada en Firestore.
 *
 * Colección: `purchases`
 *
 * Una compra agrupa la selección de tipos de entrada de un mismo evento
 * y representa una transacción antes de ser procesada por la pasarela de pagos.
 */
export interface Purchase {
  /** ID único del documento en Firestore */
  id: string;
  /** UID del usuario que realiza la compra */
  userId: string;
  /** ID de la organización organizadora del evento */
  organizationId: string;
  /** ID del evento al que pertenecen las entradas */
  eventId: string;
  /** Items adquiridos (tipos de entrada + cantidades) */
  items: PurchaseItem[];
  /** Subtotal antes de cargos (suma de items[].subtotal) */
  subtotal: number;
  /** Cargo por servicio */
  serviceFee: number;
  /** Total a pagar (subtotal + serviceFee) */
  total: number;
  /** Moneda de la transacción (por defecto: 'COP') */
  currency: string;
  /** Método de pago seleccionado (opcional hasta que se procese) */
  paymentMethod: string;
  /** Referencia del pago en la pasarela (opcional, se asigna al pagar) */
  paymentReference: string;
  /** Estado de la compra */
  status: PurchaseStatus;
  /** Fecha de creación */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
}

/**
 * Datos para crear un item de compra.
 *
 * A diferencia de PurchaseItem, `subtotal` es opcional aquí.
 * Si no se provee, el servicio lo calcula automáticamente (unitPrice × quantity).
 */
export interface CreatePurchaseItem {
  ticketTypeId: string;
  ticketName: string;
  quantity: number;
  unitPrice: number;
  /** Subtotal opcional — si no se envía, el servicio lo calcula */
  subtotal?: number;
}

/**
 * Datos para crear una compra.
 */
export interface CreatePurchaseData {
  userId: string;
  organizationId: string;
  eventId: string;
  items: CreatePurchaseItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  currency?: string;
}

/**
 * Datos actualizables de una compra.
 * Solo ciertos campos pueden modificarse después de creada.
 */
export interface UpdatePurchaseData {
  paymentMethod?: string;
  paymentReference?: string;
  status?: PurchaseStatus;
}
