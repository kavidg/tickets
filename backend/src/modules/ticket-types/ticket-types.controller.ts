/**
 * TicketS - TicketTypesController
 *
 * Controlador de tipos de entrada para eventos.
 * Todos los endpoints requieren autenticación mediante FirebaseAuthGuard.
 *
 * El ownership se valida a nivel de organización para garantizar que
 * solo el organizador propietario pueda administrar los ticket types.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TicketTypesService } from './ticket-types.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import type { CurrentUser as CurrentUserInterface } from '../auth/interfaces/current-user.interface';
import type { TicketType } from './interfaces/ticket-type.interface';

@Controller('api/v1/ticket-types')
@UseGuards(FirebaseAuthGuard)
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  /**
   * Crea un nuevo tipo de entrada.
   *
   * @param dto - Datos de creación validados.
   * @param user - Usuario autenticado.
   * @returns El TicketType creado.
   */
  @Post()
  async create(
    @Body() dto: CreateTicketTypeDto,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<TicketType> {
    return this.ticketTypesService.create(dto, user);
  }

  /**
   * Obtiene los tipos de entrada del usuario autenticado.
   *
   * @param user - Usuario autenticado.
   * @returns Lista de TicketTypes de los eventos del usuario.
   */
  @Get('my')
  async getMyTicketTypes(
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<TicketType[]> {
    return this.ticketTypesService.getMyTicketTypes(user);
  }

  /**
   * Obtiene los tipos de entrada de un evento específico.
   *
   * @param eventId - ID del evento.
   * @param user - Usuario autenticado.
   * @returns Lista de TicketTypes del evento.
   */
  @Get('event/:eventId')
  async getByEvent(
    @Param('eventId') eventId: string,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<TicketType[]> {
    return this.ticketTypesService.getByEvent(eventId, user);
  }

  /**
   * Obtiene un tipo de entrada por su ID.
   * Valida que el usuario tenga ownership sobre el evento del ticket type.
   *
   * @param id - ID del TicketType.
   * @param user - Usuario autenticado.
   * @returns El TicketType encontrado.
   */
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<TicketType> {
    return this.ticketTypesService.getById(id, user);
  }

  /**
   * Actualiza un tipo de entrada existente.
   *
   * @param id - ID del TicketType a actualizar.
   * @param dto - Datos a actualizar.
   * @param user - Usuario autenticado.
   * @returns El TicketType actualizado.
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketTypeDto,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<TicketType> {
    return this.ticketTypesService.update(id, dto, user);
  }

  /**
   * Elimina un tipo de entrada.
   *
   * @param id - ID del TicketType a eliminar.
   * @param user - Usuario autenticado.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<void> {
    return this.ticketTypesService.delete(id, user);
  }
}
