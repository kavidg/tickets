/**
 * TicketS - DashboardController
 *
 * Controlador de analytics y métricas para organizadores.
 * Todos los endpoints requieren autenticación mediante FirebaseAuthGuard.
 *
 * Endpoints:
 *   GET /api/v1/dashboard/organization/:organizationId  — Resumen general
 *   GET /api/v1/dashboard/event/:eventId                 — Analytics por evento
 *   GET /api/v1/dashboard/sales/:organizationId          — Analytics de ventas
 */

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
import type { CurrentUser as CurrentUserInterface } from '../auth/interfaces/current-user.interface';
import type {
  DashboardSummary,
  EventAnalytics,
  SalesAnalytics,
} from './interfaces/dashboard.interface';

@Controller('dashboard')
@UseGuards(FirebaseAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Obtiene el resumen general del dashboard de una organización.
   *
   * @param organizationId - ID de la organización.
   * @param user - Usuario autenticado (organizador).
   * @returns DashboardSummary con métricas generales.
   */
  @Get('organization/:organizationId')
  async getOrganizationDashboard(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<DashboardSummary> {
    return this.dashboardService.getOrganizationDashboard(
      organizationId,
      user,
    );
  }

  /**
   * Obtiene analytics detallados de un evento específico.
   *
   * @param eventId - ID del evento.
   * @param user - Usuario autenticado (organizador).
   * @returns EventAnalytics con métricas del evento.
   */
  @Get('event/:eventId')
  async getEventAnalytics(
    @Param('eventId') eventId: string,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<EventAnalytics> {
    return this.dashboardService.getEventAnalytics(eventId, user);
  }

  /**
   * Obtiene analytics de ventas globales de una organización.
   *
   * @param organizationId - ID de la organización.
   * @param user - Usuario autenticado (organizador).
   * @returns SalesAnalytics con métricas de ventas.
   */
  @Get('sales/:organizationId')
  async getSalesAnalytics(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<SalesAnalytics> {
    return this.dashboardService.getSalesAnalytics(organizationId, user);
  }
}
