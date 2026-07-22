/**
 * TicketS - Tipos de Compras (Backend)
 *
 * Define los tipos relacionados con compras para el backend.
 * Incluye estados extendidos que solo maneja el servidor.
 *
 * @see frontend/src/types/purchase.ts para los tipos del frontend.
 */

import type { Timestamp } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
 // Estados de la compra (Backend)
 // ---------------------------------------------------------------------------

 /**
  * Estados extendidos de una compra manejados por el backend.
  *
  * pending:     Pendiente de pago.
  * processing:  Pago en proceso (webhook recibido, validando).
  * paid:        Pagada exitosamente.
  * failed:      Pago rechazado por la pasarela.
  * cancelled:   Cancelada por el usuario o por el sistema.
  * expired:     Expirada por tiempo límite de pago no cumplido.
  * refunded:    Reembolsada total o parcialmente.
  */
export type PurchaseStatus =
   | 'pending'
   | 'processing'
   | 'paid'
   | 'failed'
   | 'cancelled'
   | 'expired'
   | 'refunded';

 // ---------------------------------------------------------------------------
 // Interfaces
 // ---------------------------------------------------------------------------

 /**
  * Item individual dentro de una compra.
  */
export interface PurchaseItem {
  ticketTypeId: string;
  ticketName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

 /**
  * Compra completa desde Firestore.
  */
export interface Purchase {
  id: string;
  userId: string;
  organizationId: string;
  eventId: string;
  items: PurchaseItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentReference: string;
  status: PurchaseStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

 /**
  * Datos para iniciar el proceso de checkout desde el frontend.
  * El frontend envía estos datos después de que el usuario confirma la compra.
  */
export interface CheckoutRequest {
  purchaseId: string;
  userId: string;
  paymentMethod: 'bold' | 'mercadopago' | 'stripe';
  returnUrl: string;
}
