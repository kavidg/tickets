/**
 * TicketS - WebhooksController
 *
 * Controlador de webhooks de proveedores de pago.
 *
 * Los endpoints son PÚBLICOS (sin FirebaseAuthGuard) porque son
 * consumidos directamente por los servidores de las pasarelas de pago
 * (Bold, Stripe, MercadoPago).
 *
 * La seguridad se implementa mediante validación de firmas criptográficas
 * (a implementar cuando se conecte la API real).
 *
 * @see WebhookService para el procesamiento de eventos.
 */

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhooks.service';
import { BoldWebhookDto } from './dto/bold-webhook.dto';
import type { PaymentWebhookEvent } from './interfaces/payment-webhook.interface';

@Controller('api/v1/webhooks')
export class WebhooksController {
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Webhook de Bold.
   *
   * Recibe eventos de cambio de estado de transacciones.
   * Retorna 200 OK siempre (Bold espera confirmación).
   *
   * @param dto - Payload del webhook enviado por Bold.
   */
  @Post('bold')
  @HttpCode(HttpStatus.OK)
  async handleBoldWebhook(@Body() dto: BoldWebhookDto): Promise<void> {
    // Mapear DTO de Bold al formato estandarizado PaymentWebhookEvent
    const event: PaymentWebhookEvent = {
      paymentReference: dto.payment.reference,
      status: dto.payment.status as PaymentWebhookEvent['status'],
      transactionId: dto.transaction.id,
      amount: dto.amount.total,
      currency: dto.amount.currency,
      provider: 'bold',
      eventTimestamp: dto.timestamp,
      metadata: dto.metadata,
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
