/**
 * TicketS - Interfaz de Pasarela de Pago
 *
 * Define el contrato que TODAS las pasarelas de pago deben implementar.
 * Esto permite agregar nuevos proveedores (Bold, MercadoPago, Stripe, etc.)
 * sin modificar la lógica de negocio.
 *
 * Cada proveedor debe:
 *   1. Implementar esta interfaz.
 *   2. Registrar su provider en el PaymentFactory.
 *   3. Transformar su API nativa a los tipos PaymentResult / PaymentRequest.
 */

import type {
  PaymentRequest,
  PaymentResult,
  WebhookPayload,
} from '../../types/payment';

/**
 * Interfaz abstracta para todas las pasarelas de pago.
 *
 * @example
 * class BoldGateway implements PaymentGateway { ... }
 * class MercadoPagoGateway implements PaymentGateway { ... }
 */
export interface PaymentGateway {
  /**
   * Identificador único del proveedor.
   * Debe coincidir con PaymentProvider.
   */
  readonly provider: string;

  /**
   * Inicia una transacción de pago.
   *
   * @param request - Datos de la transacción.
   * @returns Resultado del pago normalizado.
   */
  createPayment(request: PaymentRequest): Promise<PaymentResult>;

  /**
   * Confirma un pago previamente iniciado (pago en dos pasos).
   *
   * @param transactionId - ID de la transacción en la pasarela.
   * @returns Resultado del pago actualizado.
   */
  confirmPayment(transactionId: string): Promise<PaymentResult>;

  /**
   * Cancela o reembolsa un pago existente.
   *
   * @param transactionId - ID de la transacción en la pasarela.
   * @param amount - Monto a reembolsar (opcional, por defecto total).
   * @returns Resultado de la cancelación.
   */
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResult>;

  /**
   * Obtiene el estado actual de un pago desde la pasarela.
   *
   * @param transactionId - ID de la transacción en la pasarela.
   * @returns Estado actualizado del pago.
   */
  getPaymentStatus(transactionId: string): Promise<PaymentResult>;

  /**
   * Verifica la firma de un webhook entrante.
   *
   * @param payload - Payload del webhook entrante.
   * @returns true si la firma es válida.
   */
  verifyWebhookSignature(payload: WebhookPayload): Promise<boolean>;

  /**
   * Procesa un webhook entrante y lo transforma al formato normalizado.
   *
   * @param rawBody - Cuerpo crudo del webhook.
   * @param headers - Headers HTTP del webhook.
   * @returns Payload normalizado del webhook.
   */
  processWebhook(
    rawBody: Record<string, unknown>,
    headers: Record<string, string>,
  ): Promise<WebhookPayload>;
}
