/**
 * TicketS - WebhooksController
 *
 * Controlador de webhooks de proveedores de pago.
 *
 * Los endpoints son PÚBLICOS (sin FirebaseAuthGuard) porque son
 * consumidos directamente por los servidores de las pasarelas de pago
 * (Bold, Stripe, MercadoPago).
 *
 * Bold utiliza CloudEvents. Mapeamos el formato de Bold al estandarizado
 * PaymentWebhookEvent para que WebhookService sea independiente del proveedor.
 *
 * @see WebhookService para el procesamiento de eventos.
 * @see https://developers.bold.co/webhook para la documentación oficial.
 */

import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { WebhookService } from './webhooks.service';
import { BoldWebhookDto } from './dto/bold-webhook.dto';
import type { PaymentWebhookEvent, WebhookPaymentStatus } from './interfaces/payment-webhook.interface';

// ---------------------------------------------------------------------------
// Mapeo de tipos CloudEvents de Bold a estados internos
// ---------------------------------------------------------------------------

/**
 * Mapa de tipos de evento CloudEvents de Bold a nuestros estados internos.
 *
 * Fuente: https://developers.bold.co/webhook
 */
const BOLD_STATUS_MAP: Record<string, WebhookPaymentStatus> = {
  'SALE_APPROVED': 'approved',
  'SALE_REJECTED': 'declined',
  'VOID_APPROVED': 'cancelled',
  'VOID_REJECTED': 'declined',
};

// ---------------------------------------------------------------------------
// Controlador
// ---------------------------------------------------------------------------

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Webhook de Bold — Botón de Pagos.
   *
   * Recibe eventos CloudEvents de cambio de estado de transacciones.
   * Retorna 200 OK siempre (Bold espera confirmación inmediata, < 2s).
   *
   * @param dto - Payload del webhook enviado por Bold.
   */
  @Post('bold')
  @HttpCode(HttpStatus.OK)
  async handleBoldWebhook(@Body() dto: BoldWebhookDto): Promise<void> {
    // Extraer campos desde las rutas correctas del payload real de Bold
    const paymentReference = dto.data?.metadata?.reference || '';
    const mappedStatus = BOLD_STATUS_MAP[dto.type] || 'declined';
    const transactionId = dto.data?.payment_id || dto.subject;
    const amount = dto.data?.amount?.total || 0;
    const currency = dto.data?.amount?.currency || 'COP';

    // Convertir time de nanosegundos POSIX a ISO string
    let eventTimestamp: string | undefined;
    if (dto.time) {
      eventTimestamp = new Date(dto.time / 1_000_000).toISOString();
    }

    this.logger.log(
      `Bold webhook received: type=${dto.type} → ${mappedStatus}, ` +
      `ref=${paymentReference}, txn=${transactionId}, amount=${amount} ${currency}`,
    );

    // Mapear al formato estandarizado interno
    const event: PaymentWebhookEvent = {
      paymentReference,
      status: mappedStatus,
      transactionId,
      amount,
      currency,
      provider: 'bold',
      eventTimestamp,
      metadata: {
        bold_event_id: dto.id,
        bold_subject: dto.subject,
        bold_source: dto.source,
        bold_type: dto.type,
        payment_method: dto.data?.payment_method,
        payer_email: dto.data?.payer_email,
        merchant_id: dto.data?.merchant_id,
      },
    };

    // TODO: Validar firma criptográfica de Bold
    // const isValid = await this.webhookService.validateBoldSignature(
    //   dto,
    //   request.headers['x-bold-signature'],
    // );
    // if (!isValid) {
    //   throw new UnauthorizedException('Invalid Bold signature');
    // }

    await this.webhookService.processPaymentEvent(event);
  }
}
