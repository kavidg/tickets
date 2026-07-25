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
   * Obtiene todos los venues activos (público, sin filtro de organización).
   * Endpoint público — no requiere autenticación.
   */
  async getPublicVenues(): Promise<Venue[]> {
    try {
      return this.findMany((col) =>
        col.where('active', '==', true).orderBy('name', 'asc'),
      );
    } catch (error) {
      this.logger.error(`Error fetching public venues: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al obtener los lugares. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene los venues activos de la organización del usuario autenticado.
   */
  async getActiveVenues(organizationId: string): Promise<Venue[]> {
    console.log('[VenuesService.getActiveVenues] organizationId:', organizationId);
    try {
      const results = await this.findMany((col) =>
        col
          .where('organizationId', '==', organizationId)
          .where('active', '==', true)
          .orderBy('name', 'asc'),
      );
      console.log('[VenuesService.getActiveVenues] results count:', results.length);
      return results;
    } catch (error) {
      const errMsg = (error as Error).message;
      this.logger.error(`Error fetching active venues for org ${organizationId}: ${errMsg}`);
      if (errMsg.includes('index') || errMsg.includes('FAILED_PRECONDITION')) {
        this.logger.warn(`Firestore index required for venues query. orgId: ${organizationId}`);
      }
      throw new BadRequestException(
        `Error al obtener los lugares: ${errMsg}`,
      );
    }
  }

  /**
   * Obtiene todos los venues (activos e inactivos) de la organización.
   */
  async getAllVenues(organizationId: string): Promise<Venue[]> {
    try {
      return this.findMany((col) =>
        col
          .where('organizationId', '==', organizationId)
          .orderBy('name', 'asc'),
      );
    } catch (error) {
      this.logger.error(
        `Error fetching all venues for org ${organizationId}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al obtener los lugares. Intenta nuevamente.',
      );
    }
  }

  /**
   * Crea un nuevo venue.
   * La organización se asigna automáticamente desde el perfil del usuario autenticado.
   */
  async create(dto: CreateVenueDto, user: CurrentUser): Promise<Venue> {
    const organizationId = user.organizationId;

    if (!organizationId) {
      throw new BadRequestException(
        'No tienes una organización asignada. Crea o únete a una organización primero.',
      );
    }

    try {
      const venueData: Record<string, unknown> = {
        organizationId,
        name: dto.name,
        description: dto.description || '',
        address: dto.address,
        city: dto.city,
        state: dto.state || '',
        country: dto.country || '',
        postalCode: dto.postalCode || '',
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        capacity: dto.capacity,
        imageUrl: dto.imageUrl || '',
        active: true,
        ...Timestamps.forCreate(),
      };

      const venue = await this.createDoc(venueData);

      this.logger.log(`Venue created: ${venue.id} (org: ${organizationId}, name: ${dto.name})`);

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
   * Obtiene los venues del usuario autenticado (basado en su organización).
   */
  async getMyVenues(user: CurrentUser): Promise<Venue[]> {
    const organizationId = user.organizationId;
    if (!organizationId) return [];
    return this.getAllVenues(organizationId);
  }

  /**
   * Obtiene un venue por su ID.
   */
  async getVenueById(id: string): Promise<Venue> {
    return this.findByIdOrFail(id);
  }

  /**
   * Actualiza un venue existente.
   * Valida que la categoría pertenezca a la organización del usuario.
   */
  async update(
    id: string,
    dto: UpdateVenueDto,
    user: CurrentUser,
  ): Promise<Venue> {
    const existingVenue = await this.findByIdOrFail(id);
    const organizationId = user.organizationId || '';

    // Validar ownership
    if (existingVenue.organizationId !== organizationId) {
      throw new ForbiddenException(
        'No tienes permisos para modificar este lugar.',
      );
    }

    try {
      const updateData: Record<string, unknown> = {};

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.address !== undefined) updateData.address = dto.address;
      if (dto.city !== undefined) updateData.city = dto.city;
      if (dto.state !== undefined) updateData.state = dto.state;
      if (dto.country !== undefined) updateData.country = dto.country;
      if (dto.postalCode !== undefined) updateData.postalCode = dto.postalCode;
      if (dto.latitude !== undefined) updateData.latitude = dto.latitude;
      if (dto.longitude !== undefined) updateData.longitude = dto.longitude;
      if (dto.capacity !== undefined) updateData.capacity = dto.capacity;
      if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
      if (dto.active !== undefined) updateData.active = dto.active;

      const updated = await this.updateDoc(id, updateData);

      this.logger.log(`Venue updated: ${id} (org: ${organizationId})`);

      return updated;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error updating venue ${id}: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al actualizar el lugar. Intenta nuevamente.',
      );
    }
  }

  /**
   * Elimina un venue.
   * Valida que la categoría pertenezca a la organización del usuario.
   */
  async delete(id: string, user: CurrentUser): Promise<void> {
    const existingVenue = await this.findByIdOrFail(id);
    const organizationId = user.organizationId || '';

    // Validar ownership
    if (existingVenue.organizationId !== organizationId) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este lugar.',
      );
    }

    try {
      await this.deleteDoc(id);
      this.logger.log(`Venue deleted: ${id} (org: ${organizationId})`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(`Error deleting venue ${id}: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al eliminar el lugar. Intenta nuevamente.',
      );
    }
  }
}
