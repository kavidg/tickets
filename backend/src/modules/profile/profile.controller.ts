/**
 * TicketS - ProfileController
 *
 * Controlador de perfil de usuario.
 * Todos los endpoints requieren autenticación mediante FirebaseAuthGuard.
 *
 * Endpoints:
 *   GET   /api/v1/profile              — Perfil del usuario autenticado.
 *   PATCH /api/v1/profile              — Actualizar displayName.
 *   GET   /api/v1/profile/organization — Organización asociada al perfil.
 */

import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { CurrentUser as CurrentUserInterface } from '../auth/interfaces/current-user.interface';
import type { Profile } from './interfaces/profile.interface';

@Controller('profile')
@UseGuards(FirebaseAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Obtiene el perfil del usuario autenticado.
   *
   * @param user - Usuario autenticado.
   * @returns El perfil del usuario.
   */
  @Get()
  async getProfile(
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Profile> {
    return this.profileService.getMyProfile(user);
  }

  /**
   * Crea el perfil inicial del usuario autenticado.
   *
   * Los campos uid y email se obtienen automáticamente del token JWT.
   * Si el perfil ya existe, retorna error 400.
   *
   * @param user - Usuario autenticado.
   * @param dto - Datos opcionales del perfil.
   * @returns El perfil creado.
   */
  @Post()
  async createProfile(
    @CurrentUser() user: CurrentUserInterface,
    @Body() dto: CreateProfileDto,
  ): Promise<Profile> {
    console.log('[ProfileController.createProfile] received body:', JSON.stringify(dto));
    console.log('[ProfileController.createProfile] authenticated user:', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      organizationId: user.organizationId,
    }));
    return this.profileService.createProfile(user, dto);
  }

  /**
   * Actualiza el perfil del usuario autenticado.
   * Solo permite modificar displayName.
   *
   * @param user - Usuario autenticado.
   * @param dto - Datos a actualizar.
   * @returns El perfil actualizado.
   */
  @Patch()
  async updateProfile(
    @CurrentUser() user: CurrentUserInterface,
    @Body() dto: UpdateProfileDto,
  ): Promise<Profile> {
    return this.profileService.updateProfile(user, dto);
  }

  /**
   * Obtiene la organización asociada al perfil del usuario autenticado.
   *
   * @param user - Usuario autenticado.
   * @returns Los datos de la organización asociada.
   */
  @Get('organization')
  async getMyOrganization(
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Record<string, unknown>> {
    return this.profileService.getMyOrganization(user);
  }
}
