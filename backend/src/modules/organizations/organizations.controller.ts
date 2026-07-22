/**
 * TicketS - OrganizationsController
 *
 * Controlador del módulo de organizaciones.
 * Todos los endpoints requieren autenticación mediante FirebaseAuthGuard.
 *
 * Endpoints:
 *   POST /organizations     → Crear una nueva organización
 *   GET  /organizations/my  → Listar organizaciones del usuario autenticado
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
   * El ownerId se asigna automáticamente con el uid del usuario autenticado.
   *
   * Validaciones:
   *   - name: requerido, mínimo 3 caracteres
   *   - slug: requerido, único, solo minúsculas/números/guiones
   *   - email: formato válido
   *   - nit: opcional
   *
   * @param dto - Datos de la organización validados.
   * @param user - Usuario autenticado.
   * @returns La organización creada.
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
   * Solo organizaciones donde el usuario es ownerId.
   *
   * @param user - Usuario autenticado.
   * @returns Lista de organizaciones del usuario.
   */
  @Get('my')
  async getMyOrganizations(@CurrentUser() user: CurrentUserType) {
    return this.organizationsService.getMyOrganizations(user);
  }
}
