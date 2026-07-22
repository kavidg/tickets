/**
 * TicketS - CheckInModule
 *
 * Módulo de validación de ingreso (check-in) para eventos.
 * Permite a organizadores validar tickets por código y registrar
 * el ingreso de asistentes.
 *
 * @see CheckInService para la lógica de validación atómica.
 * @see CheckInLog para el modelo de datos.
 */

import { Module } from '@nestjs/common';
import { CheckInController } from './check-in.controller';
import { CheckInService } from './check-in.service';

@Module({
  controllers: [CheckInController],
  providers: [CheckInService],
  exports: [CheckInService],
})
export class CheckInModule {}
