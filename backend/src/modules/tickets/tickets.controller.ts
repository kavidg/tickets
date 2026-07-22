/**
 * TicketS - TicketsController
 *
 * Controlador de tickets digitales.
 * Todos los endpoints requieren autenticación mediante FirebaseAuthGuard.
 *
 * Endpoints:
 *   GET /api/v1/tickets/my   — Tickets del usuario autenticado.
 *   GET /api/v1/tickets/:id  — Ticket por ID (propietario u organizador).
 */

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TicketsService } from './tickets.service';
import type { CurrentUser as CurrentUserInterface } from '../auth/interfaces/current-user.interface';
import type { Ticket } from './interfaces/ticket.interface';

@Controller('api/v1/tickets')
@UseGuards(FirebaseAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * Obtiene los tickets del usuario autenticado.
   *
   * @param user - Usuario autenticado.
   * @returns Lista de tickets del usuario.
   */
  @Get('my')
  async getMyTickets(
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Ticket[]> {
    return this.ticketsService.getMyTickets(user);
  }

  /**
   * Obtiene un ticket por su ID.
   * Solo el propietario u organizador pueden acceder.
   *
   * @param id - ID del Ticket.
   * @param user - Usuario autenticado.
   * @returns El Ticket encontrado.
   */
  @Get(':id')
  async getTicketById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Ticket> {
    return this.ticketsService.getTicketById(id, user);
  }
}
