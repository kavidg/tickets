/**
 * TicketS - TicketTypesModule
 *
 * Módulo de tipos de entrada para eventos.
 * Agrupa el controlador y el servicio de TicketTypes.
 */

import { Module } from '@nestjs/common';
import { TicketTypesController } from './ticket-types.controller';
import { TicketTypesService } from './ticket-types.service';

@Module({
  controllers: [TicketTypesController],
  providers: [TicketTypesService],
  exports: [TicketTypesService],
})
export class TicketTypesModule {}
