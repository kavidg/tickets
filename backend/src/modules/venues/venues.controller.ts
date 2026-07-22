/**
 * TicketS - VenuesController
 *
 * Controlador del módulo de venues (lugares de evento).
 * Todos los endpoints requieren autenticación mediante FirebaseAuthGuard.
 *
 * Endpoints:
 *   POST   /venues     → Crear un nuevo venue
 *   GET    /venues/my  → Listar venues del usuario autenticado
 *   GET    /venues/:id → Obtener un venue por ID
 *   PATCH  /venues/:id → Actualizar un venue
 *   DELETE /venues/:id → Eliminar un venue
 *
 * @see FirebaseAuthGuard para la validación del token.
 * @see CurrentUser decorator para acceder al usuario autenticado.
 * @see VenuesService para la lógica de negocio.
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
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import type { CurrentUser as CurrentUserType } from '../auth/interfaces/current-user.interface';

@Controller('venues')
@UseGuards(FirebaseAuthGuard)
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  /**
   * POST /api/v1/venues
   *
   * Crea un nuevo venue/lugar de evento.
   * Solo se permiten venues de organizaciones donde el usuario sea owner.
   *
   * Validaciones:
   *   - name: requerido, mínimo 3 caracteres
   *   - city: requerido
   *   - capacity: número positivo
   *   - organizationId: debe existir y el usuario debe ser owner
   *
   * @param dto - Datos del venue validados.
   * @param user - Usuario autenticado.
   * @returns El venue creado.
   */
  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateVenueDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.venuesService.create(dto, user);
  }

  /**
   * GET /api/v1/venues/my
   *
   * Retorna los venues del usuario autenticado.
   * Busca venues que pertenezcan a organizaciones donde el usuario es owner.
   *
   * @param user - Usuario autenticado.
   * @returns Lista de venues del usuario.
   */
  @Get('my')
  async getMyVenues(@CurrentUser() user: CurrentUserType) {
    return this.venuesService.getMyVenues(user);
  }

  /**
   * GET /api/v1/venues/:id
   *
   * Retorna un venue por su ID de Firestore.
   *
   * @param id - ID del documento en Firestore.
   * @returns El venue encontrado.
   */
  @Get(':id')
  async getVenueById(@Param('id') id: string) {
    return this.venuesService.getVenueById(id);
  }

  /**
   * PATCH /api/v1/venues/:id
   *
   * Actualiza un venue existente.
   * Solo el owner de la organización del venue puede actualizarlo.
   *
   * @param id - ID del venue a actualizar.
   * @param dto - Datos a actualizar validados.
   * @param user - Usuario autenticado.
   * @returns El venue actualizado.
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: UpdateVenueDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.venuesService.update(id, dto, user);
  }

  /**
   * DELETE /api/v1/venues/:id
   *
   * Elimina un venue.
   * Solo el owner de la organización del venue puede eliminarlo.
   *
   * @param id - ID del venue a eliminar.
   * @param user - Usuario autenticado.
   */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.venuesService.delete(id, user);
  }
}
