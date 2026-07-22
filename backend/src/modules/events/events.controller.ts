/**
 * TicketS - EventsController
 *
 * Controlador del módulo de eventos.
 * Todos los endpoints requieren autenticación mediante FirebaseAuthGuard.
 *
 * Endpoints:
 *   POST   /events     → Crear un nuevo evento
 *   GET    /events/my  → Listar eventos del usuario autenticado
 *   GET    /events/:id → Obtener un evento por ID
 *   PATCH  /events/:id → Actualizar un evento
 *   DELETE /events/:id → Eliminar un evento
 *
 * @see FirebaseAuthGuard para la validación del token.
 * @see CurrentUser decorator para acceder al usuario autenticado.
 * @see EventsService para la lógica de negocio.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import type { CurrentUser as CurrentUserType } from '../auth/interfaces/current-user.interface';

@Controller('events')
@UseGuards(FirebaseAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * POST /api/v1/events
   *
   * Crea un nuevo evento.
   * El organizerId se asigna automáticamente con el uid del usuario autenticado.
   * El status por defecto es 'draft'.
   *
   * Validaciones:
   *   - title: requerido, mínimo 3 caracteres
   *   - slug: requerido, único, solo minúsculas/números/guiones
   *   - organizationId: requerido, debe existir y el usuario debe ser owner
   *   - categoryId: requerido
   *   - startDate: debe ser anterior a endDate
   *
   * @param dto - Datos del evento validados.
   * @param user - Usuario autenticado.
   * @returns El evento creado.
   */
  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateEventDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.eventsService.create(dto, user);
  }

  /**
   * GET /api/v1/events/my
   *
   * Retorna los eventos del usuario autenticado.
   * Solo eventos donde el usuario es organizerId.
   *
   * @param user - Usuario autenticado.
   * @returns Lista de eventos del usuario.
   */
  @Get('my')
  async getMyEvents(@CurrentUser() user: CurrentUserType) {
    return this.eventsService.getMyEvents(user);
  }

  /**
   * GET /api/v1/events/:id
   *
   * Retorna un evento por su ID de Firestore.
   *
   * @param id - ID del documento en Firestore.
   * @returns El evento encontrado.
   */
  @Get(':id')
  async getEventById(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  /**
   * PATCH /api/v1/events/:id
   *
   * Actualiza un evento existente.
   * Solo el organizador del evento puede actualizarlo.
   *
   * @param id - ID del evento a actualizar.
   * @param dto - Datos a actualizar validados.
   * @param user - Usuario autenticado.
   * @returns El evento actualizado.
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: UpdateEventDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.eventsService.update(id, dto, user);
  }

  /**
   * DELETE /api/v1/events/:id
   *
   * Elimina un evento.
   * Solo el organizador del evento puede eliminarlo.
   *
   * @param id - ID del evento a eliminar.
   * @param user - Usuario autenticado.
   */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.eventsService.delete(id, user);
  }
}
