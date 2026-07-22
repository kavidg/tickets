/**
 * TicketS - CategoriesService
 *
 * Servicio de categorías que opera sobre la colección `categories` de Firestore.
 * Extiende FirestoreRepository para reutilizar operaciones CRUD genéricas.
 *
 * Las categorías son globales y no pertenecen a organizaciones.
 */

import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { COLLECTIONS } from '../../constants/collections';
import { FirestoreRepository } from '../../common/firestore/firestore.repository';
import { Timestamps } from '../../common/utils/timestamps';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';
import type { Category } from './interfaces/category.interface';

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
   * @returns La categoría creada.
   *
   * @throws ConflictException si el slug ya está en uso.
   */
  async create(dto: CreateCategoryDto): Promise<Category> {
    try {
      await this.ensureUnique('slug', dto.slug);

      const categoryData = {
        name: dto.name,
        slug: dto.slug,
        description: dto.description || '',
        imageUrl: dto.imageUrl || '',
        active: true,
        ...Timestamps.forCreate(),
      };

      const category = await this.createDoc(categoryData);

      this.logger.log(`Category created: ${category.id} (slug: ${dto.slug})`);

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
   * Obtiene todas las categorías activas.
   * Endpoint público — no requiere autenticación.
   *
   * @returns Lista de categorías activas ordenadas por nombre.
   */
  async getActiveCategories(): Promise<Category[]> {
    try {
      return this.findMany((col) =>
        col.where('active', '==', true).orderBy('name', 'asc'),
      );
    } catch (error) {
      this.logger.error(
        `Error fetching active categories: ${(error as Error).message}`,
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
   * @returns La categoría actualizada.
   *
   * @throws NotFoundException si la categoría no existe.
   * @throws ConflictException si el nuevo slug ya está en uso.
   */
  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    // Verificar que la categoría existe (lanza NotFoundException si no)
    const existingCategory = await this.findByIdOrFail(id);

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

      this.logger.log(`Category updated: ${id}`);

      return updated;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Error updating category ${id}: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al actualizar la categoría. Intenta nuevamente.',
      );
    }
  }

  /**
   * Elimina una categoría.
   *
   * @param id - ID de la categoría a eliminar.
   *
   * @throws NotFoundException si la categoría no existe.
   */
  async delete(id: string): Promise<void> {
    // Lanza NotFoundException si no existe
    await this.findByIdOrFail(id);

    try {
      await this.deleteDoc(id);
      this.logger.log(`Category deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting category ${id}: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al eliminar la categoría. Intenta nuevamente.',
      );
    }
  }
}
