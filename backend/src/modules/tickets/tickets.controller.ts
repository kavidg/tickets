/**
 * TicketS - TicketsController
 *
 * Controlador de tickets digitales.
 * Los endpoints públicos (GET /public) NO requieren FirebaseAuthGuard.
 * Los endpoints protegidos (my, :id) requieren autenticación.
 */

import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TicketsService } from './tickets.service';
import type { CurrentUser as CurrentUserInterface } from '../auth/interfaces/current-user.interface';
import type { Ticket, TicketEnriched } from './interfaces/ticket.interface';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * GET /api/v1/tickets/public?email=
   *
   * Busca tickets públicos asociados a un correo electrónico.
   * Endpoint público — NO requiere autenticación.
   *
   * @param email - Correo electrónico del comprador.
   * @returns Lista de tickets enriquecidos con datos del evento y ticket type.
   */
  @Get('public')
  async findTicketsByEmail(
    @Query('email') email: string,
  ): Promise<TicketEnriched[]> {
    if (!email || !email.trim()) {
      throw new BadRequestException(
        'El correo electrónico es obligatorio.',
      );
    }
    return this.ticketsService.findTicketsByEmail(email.trim().toLowerCase());
  }

  /**
   * GET /api/v1/tickets/my
   *
   * Obtiene los tickets del usuario autenticado.
   * Requiere FirebaseAuthGuard.
   *
   * @param user - Usuario autenticado.
   * @returns Lista de tickets del usuario.
   */
  @Get('my')
  @UseGuards(FirebaseAuthGuard)
  async getMyTickets(
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Ticket[]> {
    return this.ticketsService.getMyTickets(user);
  }

  /**
   * GET /api/v1/tickets/:id
   *
   * Obtiene un ticket por su ID.
   * Solo el propietario u organizador pueden acceder.
   * Requiere FirebaseAuthGuard.
   *
   * @param id - ID del Ticket.
   * @param user - Usuario autenticado.
   * @returns El Ticket encontrado.
   */
  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  async getTicketById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Ticket> {
    return this.ticketsService.getTicketById(id, user);
  }
}
