/**
 * TicketS - Purchase Interface (Backend)
 *
 * Representa una orden de compra almacenada en la colección `purchases` de Firestore.
 *
 * Una Purchase nace con status = 'pending' y es actualizada por la pasarela de pagos
 * (Bold) cuando el pago es confirmado.
 *
 * El campo expiresAt permite liberar entradas reservadas si el pago no se completa.
 */

import type { Timestamp } from 'firebase-admin/firestore';

/**
 * Estados posibles de una compra.
 *
 * pending:   Pendiente de pago. Las entradas están reservadas temporalmente.
 * paid:      Pago confirmado por la pasarela. Las entradas se liberan definitivamente.
 * cancelled: Cancelada por el usuario antes de pagar.
 * expired:   Expirada por tiempo. Las entradas reservadas se liberan automáticamente.
 * failed:    El pago fue rechazado por la pasarela.
 */
export type PurchaseStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'expired'
  | 'failed';

/**
 * Proveedores de pago soportados.
 *
 * bold:    Pasarela de pago Bold (principal).
 * manual:  Pago manual / transferencia bancaria.
 * future:  Placeholder para futuras pasarelas.
 */
export type PaymentProvider = 'bold' | 'manual' | 'future';

/**
 * Item individual dentro de una compra.
 * Representa la compra de un tipo de entrada específico.
 */
export interface PurchaseItem {
  /** ID del TicketType comprado */
  ticketTypeId: string;
  /** Nombre del TicketType al momento de la compra */
  ticketName: string;
  /** Cantidad de entradas compradas de este tipo */
  quantity: number;
  /** Precio unitario al momento de la compra */
  unitPrice: number;
  /** Subtotal del item (unitPrice * quantity) */
  subtotal: number;
}

/**
 * Orden de compra almacenada en Firestore.
 */
export interface Purchase {
  /** ID único del documento en Firestore */
  id: string;
  /** UID del comprador (usuario autenticado que realiza la compra) */
  userId: string;
  /** ID de la organización propietaria del evento */
  organizationId: string;
  /** ID del evento comprado */
  eventId: string;
  /** Items de la compra (tipos de entrada y cantidades) */
  items: PurchaseItem[];
  /** Subtotal antes de cargos (suma de items.subtotal) */
  subtotal: number;
  /** Cargo por servicio (inicialmente 0) */
  serviceFee: number;
  /** Total a pagar (subtotal + serviceFee) */
  total: number;
  /** Código de moneda (COP por defecto) */
  currency: string;
  /** Proveedor de pago (bold por defecto) */
  paymentProvider: PaymentProvider;
  /** Referencia del pago en la pasarela (null hasta que se procese) */
  paymentReference: string | null;
  /** URL de pago de la pasarela (null hasta que se procese) */
  paymentUrl: string | null;
  /** Estado actual de la compra */
  status: PurchaseStatus;
  /** Fecha de expiración de la reserva (30 min después de creación) */
  expiresAt: Timestamp;
  /** Fecha en que se completó el pago (null hasta que se confirme) */
  paymentCompletedAt?: Timestamp;
  /** ID de la transacción en la pasarela de pagos */
  transactionId?: string | null;
  /** Indica si los tickets ya fueron generados para esta compra */
  ticketsGenerated?: boolean;
  /** Fecha de creación */
  createdAt: Timestamp;
  /** Fecha de la última actualización */
  updatedAt: Timestamp;
}
