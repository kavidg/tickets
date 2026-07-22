/**
 * TicketS - WebhooksModule
 *
 * Módulo de webhooks de proveedores de pago.
 * Procesa eventos de cambio de estado de transacciones provenientes
 * de pasarelas como Bold, Stripe y MercadoPago.
 *
 * Depende de InventoryModule para gestionar reservas cuando
 * un pago es confirmado o rechazado.
 *
 * @see WebhookService para el procesamiento de eventos.
 * @see InventoryService para la gestión de reservas.
 */

import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { TicketsModule } from '../tickets/tickets.module';
import { WebhooksController } from './webhooks.controller';
import { WebhookService } from './webhooks.service';

@Module({
  imports: [InventoryModule, TicketsModule],
  controllers: [WebhooksController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhooksModule {}
