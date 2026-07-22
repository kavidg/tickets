/**
 * TicketS - CheckInController
 *
 * Controlador de validación de ingreso (check-in) para eventos.
 * Todos los endpoints requieren autenticación mediante FirebaseAuthGuard.
 *
 * Endpoints:
 *   POST /api/v1/check-in/validate       — Validar ticket por código.
 *   GET  /api/v1/check-in/event/:eventId  — Historial de validaciones del evento.
 */

import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CheckInService } from './check-in.service';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import type { CurrentUser as CurrentUserInterface } from '../auth/interfaces/current-user.interface';
import type { CheckInResponse, EventCheckInLog } from './check-in.service';

@Controller('api/v1/check-in')
@UseGuards(FirebaseAuthGuard)
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  /**
   * Valida un ticket por su código y realiza el check-in.
   *
   * @param dto - Código del ticket a validar.
   * @param user - Usuario autenticado (organizador/staff).
   * @returns Resultado de la validación.
   */
  @Post('validate')
  async validate(
    @Body() dto: ValidateTicketDto,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<CheckInResponse> {
    return this.checkInService.validateTicket(dto, user);
  }

  /**
   * Obtiene el historial de validaciones de un evento.
   * Solo accesible para el organizador del evento.
   *
   * @param eventId - ID del evento.
   * @param user - Usuario autenticado.
   * @returns Lista de accesos registrados.
   */
  @Get('event/:eventId')
  async getEventCheckIns(
    @Param('eventId') eventId: string,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<EventCheckInLog[]> {
    return this.checkInService.getEventCheckIns(eventId, user);
  }
}
