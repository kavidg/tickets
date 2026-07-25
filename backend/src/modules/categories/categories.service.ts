/**
 * TicketS - CategoriesService
 *
 * Servicio de categorías que opera sobre la colección `categories` de Firestore.
 * Extiende FirestoreRepository para reutilizar operaciones CRUD genéricas.
 *
 * Las categorías son globales y no pertenecen a organizaciones.
 */

import { Injectable, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { COLLECTIONS } from '../../constants/collections';
import { FirestoreRepository } from '../../common/firestore/firestore.repository';
import { Timestamps } from '../../common/utils/timestamps';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';
import type { Category } from './interfaces/category.interface';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';

@Injectable()
export class CategoriesService extends FirestoreRepository<Category> {
  protected collectionName = COLLECTIONS.CATEGORIES;

  constructor(firebase: FirebaseAdminService) {
    super(firebase);
  }

  /**
   * Crea una nueva categoría en Firestore.
   *
   * @param dto - Datos de creación validados por CreateCategoryDto.
   * @param user - Usuario autenticado (se usa para obtener organizationId).
   * @returns La categoría creada.
   *
   * @throws BadRequestException si el usuario no tiene organización asignada.
   * @throws ConflictException si el slug ya está en uso dentro de la organización.
   */
  async create(dto: CreateCategoryDto, user: CurrentUser): Promise<Category> {
    const organizationId = user.organizationId;

    if (!organizationId) {
      throw new BadRequestException(
        'No tienes una organización asignada. Crea o únete a una organización primero.',
      );
    }

    try {
      // Validar slug único dentro de la organización
      // Nota: ensureUnique verifica en toda la colección, pero el slug se compone
      // de organizationId + slug para evitar colisiones entre organizaciones
      await this.ensureUnique('slug', dto.slug);

      const categoryData = {
        organizationId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description || '',
        imageUrl: dto.imageUrl || '',
        active: true,
        ...Timestamps.forCreate(),
      };

      const category = await this.createDoc(categoryData);

      this.logger.log(`Category created: ${category.id} (org: ${organizationId}, slug: ${dto.slug})`);

      return category;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Error creating category: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al crear la categoría. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene las categorías activas de una organización.
   *
   * @param organizationId - ID de la organización.
   * @returns Lista de categorías activas de la organización ordenadas por nombre.
   */
  async getActiveCategories(organizationId: string): Promise<Category[]> {
    try {
      const results = await this.findMany((col) =>
        col
          .where('organizationId', '==', organizationId)
          .where('active', '==', true)
          .orderBy('name', 'asc'),
      );
      return results;
    } catch (error) {
      const errMsg = (error as Error).message;
      this.logger.error(`Error fetching active categories for org ${organizationId}: ${errMsg}`);
      throw new BadRequestException(
        'Error al obtener las categorías. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene todas las categorías activas sin filtro de organización.
   * Endpoint público — no requiere autenticación.
   *
   * La ordenación por nombre se realiza en memoria para evitar la necesidad
   * de un índice compuesto Firestore (active ASC, name ASC).
   * Como la colección de categorías es pequeña (< 100 docs), el sorting
   * en memoria tiene costo despreciable.
   *
   * @returns Lista de categorías activas ordenadas por nombre.
   */
  async getPublicCategories(): Promise<Category[]> {
    try {
      const results = await this.findMany((col) =>
        col.where('active', '==', true),
      );

      // Ordenar en memoria para evitar índice compuesto Firestore
      return results.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    } catch (error) {
      this.logger.error(
        `Error fetching public categories: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al obtener las categorías. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene una categoría por su ID.
   *
   * @param id - ID del documento en Firestore.
   * @returns La categoría encontrada.
   *
   * @throws NotFoundException si la categoría no existe.
   */
  async getCategoryById(id: string): Promise<Category> {
    return this.findByIdOrFail(id);
  }

  /**
   * Actualiza una categoría existente.
   *
   * @param id - ID de la categoría a actualizar.
   * @param dto - Datos a actualizar validados por UpdateCategoryDto.
   * @param organizationId - ID de la organización del usuario autenticado.
   * @returns La categoría actualizada.
   *
   * @throws NotFoundException si la categoría no existe.
   * @throws ForbiddenException si la categoría no pertenece a la organización del usuario.
   * @throws ConflictException si el nuevo slug ya está en uso.
   */
  async update(id: string, dto: UpdateCategoryDto, organizationId: string): Promise<Category> {
    // Verificar que la categoría existe
    const existingCategory = await this.findByIdOrFail(id);

    // Validar ownership: la categoría debe pertenecer a la organización del usuario
    if (existingCategory.organizationId !== organizationId) {
      throw new ForbiddenException(
        'No tienes permisos para modificar esta categoría.',
      );
    }

    // Validar slug único (si se está actualizando)
    if (dto.slug && dto.slug !== existingCategory.slug) {
      await this.ensureUnique('slug', dto.slug);
    }

    try {
      const updateData: Record<string, unknown> = {};

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.slug !== undefined) updateData.slug = dto.slug;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
      if (dto.active !== undefined) updateData.active = dto.active;

      const updated = await this.updateDoc(id, updateData);

      this.logger.log(`Category updated: ${id} (org: ${organizationId})`);

      return updated;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(`Error updating category ${id}: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al actualizar la categoría. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene todas las categorías (activas e inactivas) de una organización.
   *
   * @param organizationId - ID de la organización.
   * @returns Lista completa de categorías de la organización ordenadas por nombre.
   */
  async getAllCategories(organizationId: string): Promise<Category[]> {
    try {
      return this.findMany((col) =>
        col
          .where('organizationId', '==', organizationId)
          .orderBy('name', 'asc'),
      );
    } catch (error) {
      this.logger.error(
        `Error fetching all categories for org ${organizationId}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al obtener las categorías. Intenta nuevamente.',
      );
    }
  }

  /**
   * Elimina una categoría.
   *
   * @param id - ID de la categoría a eliminar.
   * @param organizationId - ID de la organización del usuario autenticado.
   *
   * @throws NotFoundException si la categoría no existe.
   * @throws ForbiddenException si la categoría no pertenece a la organización del usuario.
   */
  async delete(id: string, organizationId: string): Promise<void> {
    const existingCategory = await this.findByIdOrFail(id);

    // Validar ownership: la categoría debe pertenecer a la organización del usuario
    if (existingCategory.organizationId !== organizationId) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar esta categoría.',
      );
    }

    try {
      await this.deleteDoc(id);
      this.logger.log(`Category deleted: ${id} (org: ${organizationId})`);
    } catch (error) {
      this.logger.error(`Error deleting category ${id}: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al eliminar la categoría. Intenta nuevamente.',
      );
    }
  }
}
