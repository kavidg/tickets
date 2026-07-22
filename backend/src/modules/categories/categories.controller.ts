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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * POST /api/v1/categories
   *
   * Crea una nueva categoría.
   * Solo usuarios con rol super_admin pueden crear categorías.
   *
   * Validaciones:
   *   - name: requerido, mínimo 3 caracteres
   *   - slug: requerido, único, solo minúsculas/números/guiones
   *   - description: opcional, máximo 500 caracteres
   *   - imageUrl: opcional, URL válida
   *
   * @param dto - Datos de la categoría validados.
   * @returns La categoría creada.
   */
  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @HasRoles('super_admin')
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(dto);
  }

  /**
   * GET /api/v1/categories
   *
   * Lista las categorías activas.
   * Endpoint público — no requiere autenticación.
   *
   * @returns Lista de categorías activas ordenadas por nombre.
   */
  @Get()
  async findAll() {
    return this.categoriesService.getActiveCategories();
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
   * Solo usuarios con rol super_admin pueden actualizar categorías.
   *
   * @param id - ID de la categoría a actualizar.
   * @param dto - Datos a actualizar validados.
   * @returns La categoría actualizada.
   */
  @Patch(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @HasRoles('super_admin')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  /**
   * DELETE /api/v1/categories/:id
   *
   * Elimina una categoría.
   * Solo usuarios con rol super_admin pueden eliminar categorías.
   *
   * @param id - ID de la categoría a eliminar.
   */
  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @HasRoles('super_admin')
  async delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
