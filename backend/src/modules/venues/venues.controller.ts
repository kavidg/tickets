/**
 * TicketS - VenuesController
 *
 * Controlador del módulo de venues (lugares de evento).
 *
 * Endpoints:
 *   GET  /venues/public  → Público, venues activos (sin auth)
 *   GET  /venues         → Auth, venues activos de la organización
 *   GET  /venues/all     → Auth, todos los venues de la organización
 *   GET  /venues/my      → Auth, todos los venues de la organización (alias)
 *   GET  /venues/:id     → Público, venue por ID
 *   POST /venues         → Auth, crear venue (orgId del perfil)
 *   PATCH /venues/:id    → Auth, actualizar (valida ownership)
 *   DELETE /venues/:id   → Auth, eliminar (valida ownership)
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
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  /**
   * GET /api/v1/venues/public
   *
   * Lista todos los venues activos sin filtro de organización.
   * Endpoint público — no requiere autenticación.
   */
  @Get('public')
  async findAllPublic() {
    return this.venuesService.getPublicVenues();
  }

  /**
   * GET /api/v1/venues
   *
   * Lista los venues activos de la organización del usuario autenticado.
   */
  @Get()
  @UseGuards(FirebaseAuthGuard)
  async findAll(@CurrentUser() user: CurrentUserType) {
    const orgId = user.organizationId;
    if (!orgId) {
      console.log('[VenuesController.findAll] No organizationId for user', user.uid, '— returning empty');
      return [];
    }
    return this.venuesService.getActiveVenues(orgId);
  }

  /**
   * GET /api/v1/venues/all
   *
   * Lista todos los venues (activos e inactivos) de la organización.
   */
  @Get('all')
  @UseGuards(FirebaseAuthGuard)
  async findAllAdmin(@CurrentUser() user: CurrentUserType) {
    const orgId = user.organizationId;
    if (!orgId) {
      console.log('[VenuesController.findAllAdmin] No organizationId for user', user.uid, '— returning empty');
      return [];
    }
    return this.venuesService.getAllVenues(orgId);
  }

  /**
   * GET /api/v1/venues/my
   *
   * Alias de /venues/all — retorna todos los venues de la organización.
   */
  @Get('my')
  @UseGuards(FirebaseAuthGuard)
  async getMyVenues(@CurrentUser() user: CurrentUserType) {
    return this.venuesService.getMyVenues(user);
  }

  /**
   * GET /api/v1/venues/:id
   *
   * Retorna un venue por su ID.
   * Endpoint público.
   */
  @Get(':id')
  async getVenueById(@Param('id') id: string) {
    return this.venuesService.getVenueById(id);
  }

  /**
   * POST /api/v1/venues
   *
   * Crea un nuevo venue.
   * La organización se asigna automáticamente desde el perfil del usuario.
   */
  @Post()
  @UseGuards(FirebaseAuthGuard)
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateVenueDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.venuesService.create(dto, user);
  }

  /**
   * PATCH /api/v1/venues/:id
   *
   * Actualiza un venue existente.
   * Valida ownership de la organización.
   */
  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
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
   * Valida ownership de la organización.
   */
  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.venuesService.delete(id, user);
  }
}
