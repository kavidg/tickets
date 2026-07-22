/**
 * TicketS - VenuesService
 *
 * Servicio de venues que opera sobre la colección `venues` de Firestore.
 * Extiende FirestoreRepository para reutilizar operaciones CRUD genéricas.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { COLLECTIONS } from '../../constants/collections';
import { FirestoreRepository } from '../../common/firestore/firestore.repository';
import { Timestamps } from '../../common/utils/timestamps';
import type { CreateVenueDto } from './dto/create-venue.dto';
import type { UpdateVenueDto } from './dto/update-venue.dto';
import type { Venue } from './interfaces/venue.interface';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';

@Injectable()
export class VenuesService extends FirestoreRepository<Venue> {
  protected collectionName = COLLECTIONS.VENUES;

  constructor(firebase: FirebaseAdminService) {
    super(firebase);
  }

  /**
   * Crea un nuevo venue en Firestore.
   */
  async create(dto: CreateVenueDto, user: CurrentUser): Promise<Venue> {
    // Validar organización y ownership
    await this.validateOrganizationOwnership(dto.organizationId, user.uid);

    try {
      const venueData = {
        organizationId: dto.organizationId,
        name: dto.name,
        description: dto.description || '',
        address: dto.address,
        city: dto.city,
        country: dto.country || '',
        capacity: dto.capacity,
        imageUrl: dto.imageUrl || '',
        active: true,
        ...Timestamps.forCreate(),
      };

      const venue = await this.createDoc(venueData);

      this.logger.log(`Venue created: ${venue.id} (name: ${dto.name})`);

      return venue;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error creating venue: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al crear el lugar. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene los venues del usuario autenticado.
   */
  async getMyVenues(user: CurrentUser): Promise<Venue[]> {
    try {
      // Obtener IDs de organizaciones del usuario
      const orgDocs = await this.findRawInCollection(
        COLLECTIONS.ORGANIZATIONS,
        (col) => col.where('ownerId', '==', user.uid).select('id'),
      );

      if (orgDocs.length === 0) {
        return [];
      }

      const orgIds = orgDocs.map((doc) => doc.id as string);

      return this.findMany((col) =>
        col.where('organizationId', 'in', orgIds).orderBy('createdAt', 'desc'),
      );
    } catch (error) {
      this.logger.error(
        `Error fetching venues for user ${user.uid}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al obtener los lugares. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene un venue por su ID.
   */
  async getVenueById(id: string): Promise<Venue> {
    return this.findByIdOrFail(id);
  }

  /**
   * Actualiza un venue existente.
   */
  async update(
    id: string,
    dto: UpdateVenueDto,
    user: CurrentUser,
  ): Promise<Venue> {
    // Verificar que el venue existe
    const existingVenue = await this.findByIdOrFail(id);

    // Validar ownership de la organización actual
    await this.validateOrganizationOwnership(
      existingVenue.organizationId,
      user.uid,
    );

    // Validar ownership de la nueva organización (si se está cambiando)
    if (
      dto.organizationId &&
      dto.organizationId !== existingVenue.organizationId
    ) {
      await this.validateOrganizationOwnership(dto.organizationId, user.uid);
    }

    try {
      const updateData: Record<string, unknown> = {};

      if (dto.organizationId !== undefined) updateData.organizationId = dto.organizationId;
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.address !== undefined) updateData.address = dto.address;
      if (dto.city !== undefined) updateData.city = dto.city;
      if (dto.country !== undefined) updateData.country = dto.country;
      if (dto.capacity !== undefined) updateData.capacity = dto.capacity;
      if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
      if (dto.active !== undefined) updateData.active = dto.active;

      const updated = await this.updateDoc(id, updateData);

      this.logger.log(`Venue updated: ${id}`);

      return updated;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Error updating venue ${id}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al actualizar el lugar. Intenta nuevamente.',
      );
    }
  }

  /**
   * Elimina un venue.
   */
  async delete(id: string, user: CurrentUser): Promise<void> {
    // Verificar que el venue existe y validar ownership
    const existingVenue = await this.findByIdOrFail(id);

    await this.validateOrganizationOwnership(
      existingVenue.organizationId,
      user.uid,
    );

    try {
      await this.deleteDoc(id);
      this.logger.log(`Venue deleted: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(
        `Error deleting venue ${id}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al eliminar el lugar. Intenta nuevamente.',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers privados
  // ---------------------------------------------------------------------------

  private async validateOrganizationOwnership(
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const orgData = await this.getRawDoc(
      COLLECTIONS.ORGANIZATIONS,
      organizationId,
    );

    if (!orgData) {
      throw new NotFoundException('La organización no existe.');
    }

    if (orgData.ownerId !== userId) {
      throw new ForbiddenException(
        'No eres el propietario de esta organización.',
      );
    }
  }
}
