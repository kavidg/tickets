/**
 * TicketS - OrganizationsController
 *
 * Controlador del módulo de organizaciones.
 * Todos los endpoints requieren autenticación mediante FirebaseAuthGuard.
 *
 * Endpoints:
 *   POST /organizations          → Crear una nueva organización
 *   GET  /organizations/my       → Listar organizaciones del usuario
 *   POST /organizations/setup    → Onboarding: crear primera organización + asociar perfil
 *
 * @see FirebaseAuthGuard para la validación del token.
 * @see CurrentUser decorator para acceder al usuario autenticado.
 * @see OrganizationsService para la lógica de negocio.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { SetupOrganizationDto } from './dto/setup-organization.dto';
import type { CurrentUser as CurrentUserType } from '../auth/interfaces/current-user.interface';

@Controller('organizations')
@UseGuards(FirebaseAuthGuard)
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  /**
   * POST /api/v1/organizations
   *
   * Crea una nueva organización.
   */
  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateOrganizationDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.organizationsService.create(dto, user);
  }

  /**
   * GET /api/v1/organizations/my
   *
   * Retorna las organizaciones del usuario autenticado.
   */
  @Get('my')
  async getMyOrganizations(@CurrentUser() user: CurrentUserType) {
    return this.organizationsService.getMyOrganizations(user);
  }

  /**
   * POST /api/v1/organizations/setup
   *
   * Flujo de onboarding: crea la primera organización del usuario
   * y la asocia automáticamente a su perfil.
   *
   * @param dto - Datos de la organización (name, slug, description?, imageUrl?).
   * @param user - Usuario autenticado.
   * @returns La organización creada.
   */
  @Post('setup')
  async setup(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: SetupOrganizationDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.organizationsService.setupMyOrganization(user.uid, dto);
  }
}
