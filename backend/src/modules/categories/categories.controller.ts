/**
 * TicketS - CategoriesController
 *
 * Controlador del módulo de categorías.
 * Las categorías son globales y no pertenecen a organizaciones.
 *
 * Permisos:
 *   - GET /categories      → Público (solo activas)
 *   - GET /categories/all  → Requiere autenticación (activas + inactivas)
 *   - GET /categories/:id  → Público
 *   - POST /categories     → Solo super_admin
 *   - PATCH /categories/:id → Solo super_admin
 *   - DELETE /categories/:id → Solo super_admin
 *
 * @see FirebaseAuthGuard para la validación del token.
 * @see RolesGuard para la autorización por roles.
 * @see HasRoles decorator para definir roles requeridos.
 * @see CategoriesService para la lógica de negocio.
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
import { RolesGuard, HasRoles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import type { CurrentUser as CurrentUserType } from '../auth/interfaces/current-user.interface';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * POST /api/v1/categories
   *
   * Crea una nueva categoría.
   * La organización se asigna automáticamente desde el perfil del usuario.
   *
   * Validaciones:
   *   - name: requerido, mínimo 3 caracteres
   *   - slug: requerido, único, solo minúsculas/números/guiones
   *   - description: opcional, máximo 500 caracteres
   *   - imageUrl: opcional, URL válida
   *
   * @param dto - Datos de la categoría validados.
   * @param user - Usuario autenticado.
   * @returns La categoría creada.
   */
  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @HasRoles('super_admin', 'organizer')
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateCategoryDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.categoriesService.create(dto, user);
  }

  /**
   * GET /api/v1/categories
   *
   * Lista las categorías activas de la organización del usuario autenticado.
   * Requiere autenticación.
   *
   * @param user - Usuario autenticado.
   * @returns Lista de categorías activas de la organización.
   */
  @Get()
  @UseGuards(FirebaseAuthGuard)
  async findAll(@CurrentUser() user: CurrentUserType) {
    const orgId = user.organizationId;
    if (!orgId) {
      return [];
    }
    return this.categoriesService.getActiveCategories(orgId);
  }

  /**
   * GET /api/v1/categories/public
   *
   * Lista todas las categorías activas sin filtro de organización.
   * Endpoint público — no requiere autenticación.
   * Útil para páginas públicas (HomePage, EventDetailPage).
   *
   * @returns Lista de categorías activas ordenadas por nombre.
   */
  @Get('public')
  async findAllPublic() {
    return this.categoriesService.getPublicCategories();
  }

  /**
   * GET /api/v1/categories/all
   *
   * Lista todas las categorías (activas e inactivas) de la organización
   * del usuario autenticado.
   * Útil para el panel de administración.
   *
   * @param user - Usuario autenticado.
   * @returns Lista completa de categorías de la organización.
   */
  @Get('all')
  @UseGuards(FirebaseAuthGuard)
  async findAllAdmin(@CurrentUser() user: CurrentUserType) {
    const orgId = user.organizationId;
    if (!orgId) {
      return [];
    }
    return this.categoriesService.getAllCategories(orgId);
  }

  /**
   * GET /api/v1/categories/:id
   *
   * Obtiene una categoría por su ID.
   * Endpoint público — no requiere autenticación.
   *
   * @param id - ID de la categoría.
   * @returns La categoría encontrada.
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(id);
  }

  /**
   * PATCH /api/v1/categories/:id
   *
   * Actualiza una categoría existente.
   * Solo permite modificar categorías de la organización del usuario.
   *
   * @param id - ID de la categoría a actualizar.
   * @param dto - Datos a actualizar validados.
   * @param user - Usuario autenticado.
   * @returns La categoría actualizada.
   */
  @Patch(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @HasRoles('super_admin', 'organizer')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: UpdateCategoryDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.categoriesService.update(id, dto, user.organizationId || '');
  }

  /**
   * DELETE /api/v1/categories/:id
   *
   * Elimina una categoría.
   * Solo permite eliminar categorías de la organización del usuario.
   *
   * @param id - ID de la categoría a eliminar.
   * @param user - Usuario autenticado.
   */
  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @HasRoles('super_admin', 'organizer')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.categoriesService.delete(id, user.organizationId || '');
  }

}
