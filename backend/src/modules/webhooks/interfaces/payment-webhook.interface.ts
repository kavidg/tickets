/**
 * TicketS - PaymentWebhook Interface
 *
 * Interfaz genérica para eventos de webhook de proveedores de pago.
 * Diseñada para que WebhookService pueda procesar eventos de cualquier
 * proveedor (Bold, Stripe, MercadoPago) sin modificar su lógica interna.
 *
 * Cada proveedor debe implementar un DTO y mapear sus eventos a esta
 * interfaz estandarizada.
 *
 * @see BoldWebhookDto para el DTO específico de Bold.
 */

/**
 * Estados estandarizados de webhook, independientes del proveedor.
 *
 * approved:   Pago aprobado → confirmar reserva y generar tickets.
 * declined:   Pago rechazado → liberar reserva.
 * expired:    Sesión de pago expirada → liberar reserva.
 * cancelled:  Pago cancelado por el usuario → liberar reserva.
 */
export type WebhookPaymentStatus =
  | 'approved'
  | 'declined'
  | 'expired'
  | 'cancelled';

/**
 * Evento de webhook estandarizado.
 *
 * Todos los providers deben mapear su payload a esta interfaz
 * para que WebhookService los procese de forma unificada.
 */
export interface PaymentWebhookEvent {
  /** Referencia única del pago en la pasarela */
  paymentReference: string;
  /** Estado estandarizado del pago */
  status: WebhookPaymentStatus;
  /** ID de la transacción en la pasarela */
  transactionId: string;
  /** Monto total de la transacción */
  amount: number;
  /** Código de moneda */
  currency: string;
  /** Nombre del proveedor que envió el webhook */
  provider: string;
  /** Timestamp del evento en la pasarela (ISO string) */
  eventTimestamp?: string;
  /** Metadatos adicionales específicos del proveedor */
  metadata?: Record<string, unknown>;
}
