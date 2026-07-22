/**
 * TicketS - TicketsModule
 *
 * Módulo de tickets digitales.
 * Genera entradas únicas asociadas a una compra pagada.
 *
 * @see TicketsService para la lógica de generación y consulta.
 * @see WebhookService para la integración que activa la generación.
 */

import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
