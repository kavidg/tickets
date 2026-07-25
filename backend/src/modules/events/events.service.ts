/**
 * TicketS - EventsService
 *
 * Servicio de eventos que opera sobre la colección `events` de Firestore.
 * Extiende FirestoreRepository para reutilizar operaciones CRUD genéricas.
 */

import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { COLLECTIONS } from '../../constants/collections';
import { FirestoreRepository } from '../../common/firestore/firestore.repository';
import { Timestamps } from '../../common/utils/timestamps';
import type { CreateEventDto } from './dto/create-event.dto';
import type { UpdateEventDto } from './dto/update-event.dto';
import type { Event } from './interfaces/event.interface';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';

@Injectable()
export class EventsService extends FirestoreRepository<Event> {
  protected collectionName = COLLECTIONS.EVENTS;

  constructor(firebase: FirebaseAdminService) {
    super(firebase);
  }

  /**
   * Crea un nuevo evento en Firestore.
   * Valida que la categoría y el venue pertenezcan a la organización del usuario.
   */
  async create(dto: CreateEventDto, user: CurrentUser): Promise<Event> {
    const organizationId = user.organizationId;

    if (!organizationId) {
      throw new BadRequestException(
        'No tienes una organización asignada. Crea o únete a una organización primero.',
      );
    }

    await this.ensureUnique('slug', dto.slug);

    // Validar que la categoría (si se proporciona) pertenezca a la organización
    if (dto.categoryId) {
      await this.validateCategoryOwnership(dto.categoryId, organizationId);
    }

    // Validar que el venue (si se proporciona) pertenezca a la organización
    if (dto.venueId) {
      await this.validateVenueOwnership(dto.venueId, organizationId);
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin.',
      );
    }

    try {
      const eventData = {
        title: dto.title,
        slug: dto.slug,
        description: dto.description || '',
        categoryId: dto.categoryId || null,
        categoryName: dto.categoryName || null,
        organizationId,
        venueId: dto.venueId || null,
        venueName: dto.venueName || null,
        organizerId: user.uid,
        imageUrl: dto.imageUrl || '',
        city: dto.city,
        address: dto.address,
        startDate,
        endDate,
        status: 'draft' as const,
        ...Timestamps.forCreate(),
      };

      const event = await this.createDoc(eventData);

      this.logger.log(`Event created: ${event.id} (org: ${organizationId}, slug: ${dto.slug})`);

      return event;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error creating event: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al crear el evento. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene los eventos del usuario autenticado.
   */
  async getMyEvents(user: CurrentUser): Promise<Event[]> {
    try {
      return this.findMany((col) =>
        col.where('organizerId', '==', user.uid).orderBy('createdAt', 'desc'),
      );
    } catch (error) {
      this.logger.error(
        `Error fetching events for user ${user.uid}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al obtener los eventos. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene un evento por su ID.
   */
  async getEventById(id: string): Promise<Event> {
    return this.findByIdOrFail(id);
  }

  /**
   * Actualiza un evento existente.
   */
  async update(
    id: string,
    dto: UpdateEventDto,
    user: CurrentUser,
  ): Promise<Event> {
    // Verificar que el evento existe y el usuario es el organizador
    const existingEvent = await this.findByIdOrFail(id);

    if (existingEvent.organizerId !== user.uid) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este evento.',
      );
    }

    // Validar slug único (si se está actualizando)
    if (dto.slug && dto.slug !== existingEvent.slug) {
      await this.ensureUnique('slug', dto.slug);
    }

    // Validar categoría (si se está cambiando y es un ID real)
    if (dto.categoryId && dto.categoryId !== existingEvent.categoryId) {
      await this.validateCategoryOwnership(dto.categoryId, existingEvent.organizationId);
    }

    // Validar venue (si se está cambiando y es un ID real)
    if (dto.venueId && dto.venueId !== existingEvent.venueId) {
      await this.validateVenueOwnership(dto.venueId, existingEvent.organizationId);
    }

    // Validar fechas
    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : existingEvent.startDate.toDate();
    const endDate = dto.endDate
      ? new Date(dto.endDate)
      : existingEvent.endDate.toDate();

    if (startDate >= endDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin.',
      );
    }

    try {
      const updateData: Record<string, unknown> = {};

      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.slug !== undefined) updateData.slug = dto.slug;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
      if (dto.categoryName !== undefined) updateData.categoryName = dto.categoryName;
      if (dto.venueId !== undefined) updateData.venueId = dto.venueId;
      if (dto.venueName !== undefined) updateData.venueName = dto.venueName;
      if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
      if (dto.city !== undefined) updateData.city = dto.city;
      if (dto.address !== undefined) updateData.address = dto.address;
      if (dto.startDate !== undefined) updateData.startDate = new Date(dto.startDate);
      if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);
      if (dto.status !== undefined) updateData.status = dto.status;

      const updated = await this.updateDoc(id, updateData);

      this.logger.log(`Event updated: ${id}`);

      return updated;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error updating event ${id}: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al actualizar el evento. Intenta nuevamente.',
      );
    }
  }

  /**
   * Elimina un evento.
   */
  async delete(id: string, user: CurrentUser): Promise<void> {
    // Verificar que el evento existe y el usuario es el organizador
    const existingEvent = await this.findByIdOrFail(id);

    if (existingEvent.organizerId !== user.uid) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este evento.',
      );
    }

    try {
      await this.deleteDoc(id);
      this.logger.log(`Event deleted: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(`Error deleting event ${id}: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al eliminar el evento. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene todos los eventos públicos (published).
   * Usa Firebase Admin SDK — sin restricciones de reglas Firestore.
   * Endpoint público — NO requiere autenticación.
   *
   * @returns Lista de eventos publicados ordenados por startDate ascendente.
   */
  async getPublicEvents(): Promise<Record<string, unknown>[]> {
    try {
      const docs = await this.findRawInCollection(
        COLLECTIONS.EVENTS,
        (col) =>
          col
            .where('status', '==', 'published')
            .orderBy('startDate', 'asc'),
      );

      this.logger.log(`Public events listed: ${docs.length} events`);

      return docs;
    } catch (error) {
      this.logger.error(
        `Error fetching public events: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al obtener los eventos. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene un evento público por su slug.
   * Solo retorna eventos con status 'published'.
   * Incluye los tipos de entrada (ticket types) asociados.
   *
   * Este método es público — NO requiere autenticación.
   *
   * @param slug - Slug único del evento.
   * @returns Evento con ticketTypes incluidos.
   *
   * @throws NotFoundException si el evento no existe o no está publicado.
   */
  async getPublicEventBySlug(slug: string): Promise<Record<string, unknown>> {
    try {
      const events = await this.findMany((col) =>
        col
          .where('slug', '==', slug)
          .where('status', '==', 'published')
          .limit(1),
      );

      if (events.length === 0) {
        throw new NotFoundException(
          'El evento no existe o no está disponible.',
        );
      }

      const event = events[0];

      // Obtener tipos de entrada asociados al evento
      const ticketTypeDocs = await this.findRawInCollection(
        COLLECTIONS.TICKET_TYPES,
        (col) => col.where('eventId', '==', event.id),
      );

      // Mapear tipos de entrada con campo available calculado
      const ticketTypes = ticketTypeDocs.map((tt) => ({
        id: tt.id,
        eventId: tt.eventId,
        name: tt.name,
        description: tt.description || '',
        price: tt.price,
        quantity: tt.quantity,
        soldQuantity: tt.soldQuantity || 0,
        currency: tt.currency || 'COP',
        status: tt.status || 'active',
        available: (tt.quantity as number) - ((tt.soldQuantity as number) || 0),
      }));

      this.logger.log(`Public event accessed: ${event.id} (slug: ${slug})`);

      return {
        id: event.id,
        title: event.title,
        slug: event.slug,
        description: event.description,
        imageUrl: event.imageUrl,
        city: event.city,
        address: event.address,
        startDate: event.startDate,
        endDate: event.endDate,
        categoryId: event.categoryId,
        organizationId: event.organizationId,
        organizerId: event.organizerId,
        ticketTypes,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error fetching public event by slug ${slug}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al obtener el evento. Intenta nuevamente.',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers privados
  // ---------------------------------------------------------------------------

  /**
   * Valida que una categoría pertenezca a la organización especificada.
   */
  private async validateCategoryOwnership(
    categoryId: string,
    organizationId: string,
  ): Promise<void> {
    const categoryData = await this.getRawDoc(
      COLLECTIONS.CATEGORIES,
      categoryId,
    );

    if (!categoryData) {
      throw new NotFoundException('La categoría no existe.');
    }

    if (categoryData.organizationId !== organizationId) {
      throw new ForbiddenException(
        'La categoría no pertenece a tu organización.',
      );
    }
  }

  /**
   * Valida que un venue pertenezca a la organización especificada.
   */
  private async validateVenueOwnership(
    venueId: string,
    organizationId: string,
  ): Promise<void> {
    const venueData = await this.getRawDoc(
      COLLECTIONS.VENUES,
      venueId,
    );

    if (!venueData) {
      throw new NotFoundException('El lugar no existe.');
    }

    if (venueData.organizationId !== organizationId) {
      throw new ForbiddenException(
        'El lugar no pertenece a tu organización.',
      );
    }
  }
}
