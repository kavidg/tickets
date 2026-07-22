/**
 * TicketS - HealthModule
 *
 * Módulo de verificación de salud del servidor.
 * Proporciona un endpoint para monitorear el estado de la aplicación
 * y la conectividad con Firebase.
 *
 * @see HealthController para la implementación del endpoint.
 */

import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
