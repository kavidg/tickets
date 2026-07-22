/**
 * TicketS - DashboardModule
 *
 * Módulo de analytics y métricas para organizadores.
 * Proporciona endpoints para consultar resúmenes generales,
 * analytics por evento y métricas de ventas.
 *
 * @see DashboardService para los métodos de cálculo.
 */

import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
