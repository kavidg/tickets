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
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // =========================================================================
  // Endpoints públicos (sin autenticación)
  // =========================================================================

  /**
   * GET /api/v1/events/public
   *
   * Lista todos los eventos públicos (published).
   * NO requiere autenticación.
   * Usa Firebase Admin SDK — no afectado por reglas Firestore.
   *
   * @returns Lista de eventos publicados ordenados por fecha.
   */
  @Get('public')
  async getPublicEvents() {
    console.log('[PublicEvents] query');
    const result = await this.eventsService.getPublicEvents();
    console.log('[PublicEvents] count:', result.length);
    return result;
  }

  /**
   * GET /api/v1/events/public/:slug
   *
   * Obtiene un evento público por slug.
   * Solo retorna eventos con status 'published'.
   * Incluye los tipos de entrada asociados.
   *
   * Este endpoint NO requiere autenticación.
   *
   * @param slug - Slug único del evento.
   * @returns Evento público con ticket types.
   */
  @Get('public/:slug')
  async getPublicEventBySlug(@Param('slug') slug: string) {
    return this.eventsService.getPublicEventBySlug(slug);
  }

  // =========================================================================
  // Endpoints protegidos (requieren autenticación)
  // =========================================================================

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
  @UseGuards(FirebaseAuthGuard)
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
  @UseGuards(FirebaseAuthGuard)
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
  @UseGuards(FirebaseAuthGuard)
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
  @UseGuards(FirebaseAuthGuard)
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
  @UseGuards(FirebaseAuthGuard)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.eventsService.delete(id, user);
  }
}
