/**
 * TicketS - Proveedor Bold (Pasarela de Pago)
 *
 * Implementación de la interfaz PaymentGateway para Bold.
 *
 * Bold es la pasarela de pago principal para el mercado colombiano.
 * Soporta: Tarjetas de crédito/débito, PSE, Nequi, Efecty, etc.
 *
 * Documentación Bold: https://docs.bold.co/
 *
 * NOTA: Esta implementación es un esqueleto. La lógica real debe
 * completarse cuando se integre la API de Bold.
 *
 * @see https://docs.bold.co/ para la documentación oficial.
 */

import type { PaymentGateway } from '../interfaces/payment-gateway';
import type {
  PaymentRequest,
  PaymentResult,
  WebhookPayload,
  ProviderConfig,
} from '../../types/payment';

// ---------------------------------------------------------------------------
// Proveedor Bold
// ---------------------------------------------------------------------------

export class BoldGateway implements PaymentGateway {
  readonly provider = 'bold';

  private readonly config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  /**
   * Crea una transacción de pago en Bold.
   *
   * Flujo:
   *   1. Autenticarse con la API de Bold.
   *   2. Crear una orden de pago con los datos de PaymentRequest.
   *   3. Retornar la URL de redirección para que el usuario pague.
   */
  async createPayment(_request: PaymentRequest): Promise<PaymentResult> {
    // TODO: Implementar integración con API de Bold
    // const client = new BoldClient(this.config);
    // const response = await client.createOrder({ ... });
    // return this.normalizeResponse(response);

    // Marcar config como utilizado (se usará en la implementación real)
    void this.config;

    return {
      success: true,
      transactionId: `bold_${Date.now()}`,
      status: 'pending',
      provider: 'bold',
      redirectUrl: 'https://checkout.bold.co/pay/example',
      message: 'Redirigiendo a Bold...',
    };
  }

  /**
   * Confirma un pago previamente iniciado en Bold.
   */
  async confirmPayment(transactionId: string): Promise<PaymentResult> {
    // TODO: Confirmar pago con API de Bold
    return {
      success: true,
      transactionId,
      status: 'approved',
      provider: 'bold',
      message: 'Pago confirmado exitosamente.',
    };
  }

  /**
   * Procesa un reembolso en Bold.
   */
  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    // TODO: Implementar reembolso con API de Bold
    return {
      success: true,
      transactionId,
      status: 'refunded',
      provider: 'bold',
      message: amount
        ? `Reembolso parcial de ${amount} procesado.`
        : 'Reembolso total procesado.',
    };
  }

  /**
   * Consulta el estado de un pago en Bold.
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentResult> {
    // TODO: Consultar estado con API de Bold
    return {
      success: true,
      transactionId,
      status: 'approved',
      provider: 'bold',
      message: 'Pago aprobado.',
    };
  }

  /**
   * Verifica la firma de un webhook de Bold.
   */
  async verifyWebhookSignature(_payload: WebhookPayload): Promise<boolean> {
    // TODO: Verificar firma HMAC del webhook de Bold
    // const expectedSignature = crypto
    //   .createHmac('sha256', this.config.webhookSecret)
    //   .update(JSON.stringify(payload.raw))
    //   .digest('hex');
    // return payload.signature === expectedSignature;

    return true;
  }

  /**
   * Procesa un webhook entrante de Bold y lo normaliza.
   */
  async processWebhook(
    rawBody: Record<string, unknown>,
    headers: Record<string, string>,
  ): Promise<WebhookPayload> {
    // TODO: Transformar webhook de Bold a formato normalizado
    return {
      provider: 'bold',
      transactionId: (rawBody.transaction_id as string) || '',
      status: 'processing',
      referenceId: (rawBody.reference_id as string) || '',
      signature: headers['x-bold-signature'] || '',
      raw: rawBody,
    };
  }
}
