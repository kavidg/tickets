/**
 * TicketS - TicketTypesService
 *
 * Servicio de tipos de entrada que opera sobre la colección `ticketTypes` de Firestore.
 * Extiende FirestoreRepository para reutilizar operaciones CRUD genéricas.
 *
 * Cada TicketType pertenece a un Event, que a su vez pertenece a una Organization.
 * El ownership se valida verificando que el usuario autenticado sea owner de la organización.
 *
 * El campo soldQuantity inicia en 0 y SOLO puede modificarse mediante el módulo Purchases.
 * No se permite modificar soldQuantity a través de DTOs de actualización.
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
import type { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import type { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import type { TicketType } from './interfaces/ticket-type.interface';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';

@Injectable()
export class TicketTypesService extends FirestoreRepository<TicketType> {
  protected collectionName = COLLECTIONS.TICKET_TYPES;

  constructor(firebase: FirebaseAdminService) {
    super(firebase);
  }

  /**
   * Crea un nuevo tipo de entrada en Firestore.
   *
   * @param dto - Datos de creación validados por CreateTicketTypeDto.
   * @param user - Usuario autenticado.
   * @returns El TicketType creado.
   *
   * @throws NotFoundException si el evento o la organización no existen.
   * @throws ForbiddenException si el usuario no es owner de la organización.
   * @throws BadRequestException si las fechas de venta son inválidas.
   */
  async create(dto: CreateTicketTypeDto, user: CurrentUser): Promise<TicketType> {
    // Validar que el evento existe y el usuario es owner de la organización
    await this.validateEventOwnership(dto.eventId, dto.organizationId, user.uid);

    // Validar fechas de venta
    this.validateSalesDates(dto.salesStartDate, dto.salesEndDate);

    try {
      const ticketTypeData: Record<string, unknown> = {
        eventId: dto.eventId,
        organizationId: dto.organizationId,
        name: dto.name,
        description: dto.description || '',
        price: dto.price,
        quantity: dto.quantity,
        soldQuantity: 0,
        currency: dto.currency || 'COP',
        status: 'active',
        ...Timestamps.forCreate(),
      };

      // Asignar fechas de venta si existen
      if (dto.salesStartDate) {
        ticketTypeData.salesStartDate = new Date(dto.salesStartDate);
      }
      if (dto.salesEndDate) {
        ticketTypeData.salesEndDate = new Date(dto.salesEndDate);
      }

      const ticketType = await this.createDoc(ticketTypeData);

      this.logger.log(
        `TicketType created: ${ticketType.id} (name: ${dto.name}, event: ${dto.eventId})`,
      );

      return ticketType;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error creating ticket type: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al crear el tipo de entrada. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene los tipos de entrada del usuario autenticado.
   * Busca ticket types de eventos pertenecientes a organizaciones donde el usuario es owner.
   */
  async getMyTicketTypes(user: CurrentUser): Promise<TicketType[]> {
    try {
      // 1. Obtener IDs de organizaciones del usuario
      const orgDocs = await this.findRawInCollection(
        COLLECTIONS.ORGANIZATIONS,
        (col) => col.where('ownerId', '==', user.uid).select('id'),
      );

      if (orgDocs.length === 0) {
        return [];
      }

      const orgIds = orgDocs.map((doc) => doc.id as string);

      // 2. Obtener IDs de eventos de esas organizaciones
      const eventDocs = await this.findRawInCollection(
        COLLECTIONS.EVENTS,
        (col) => col.where('organizationId', 'in', orgIds).select('id'),
      );

      if (eventDocs.length === 0) {
        return [];
      }

      const eventIds = eventDocs.map((doc) => doc.id as string);

      // 3. Obtener ticket types de esos eventos
      return this.findMany((col) =>
        col.where('eventId', 'in', eventIds).orderBy('createdAt', 'desc'),
      );
    } catch (error) {
      this.logger.error(
        `Error fetching ticket types for user ${user.uid}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al obtener los tipos de entrada. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene los tipos de entrada de un evento específico.
   * Valida que el usuario tenga ownership del evento.
   */
  async getByEvent(eventId: string, user: CurrentUser): Promise<TicketType[]> {
    // Validar que el usuario tiene acceso al evento
    await this.validateEventAccess(eventId, user.uid);

    try {
      return this.findMany((col) =>
        col
          .where('eventId', '==', eventId)
          .orderBy('createdAt', 'asc'),
      );
    } catch (error) {
      this.logger.error(
        `Error fetching ticket types for event ${eventId}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al obtener los tipos de entrada del evento. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene un tipo de entrada por su ID.
   * Valida que el usuario tenga ownership sobre el evento del ticket type.
   *
   * @param id - ID del TicketType.
   * @param user - Usuario autenticado.
   * @returns El TicketType encontrado.
   *
   * @throws NotFoundException si no existe.
   * @throws ForbiddenException si el usuario no tiene ownership del evento.
   */
  async getById(id: string, user: CurrentUser): Promise<TicketType> {
    const ticketType = await this.findByIdOrFail(id);

    // Validar que el usuario tenga acceso al evento
    await this.validateEventAccess(ticketType.eventId, user.uid);

    return ticketType;
  }

  /**
   * Actualiza un tipo de entrada existente.
   *
   * @param id - ID del TicketType a actualizar.
   * @param dto - Datos a actualizar (soldQuantity no es modificable).
   * @param user - Usuario autenticado.
   * @returns El TicketType actualizado.
   *
   * @throws NotFoundException si no existe.
   * @throws ForbiddenException si el usuario no tiene ownership.
   * @throws BadRequestException si las fechas son inválidas.
   */
  async update(
    id: string,
    dto: UpdateTicketTypeDto,
    user: CurrentUser,
  ): Promise<TicketType> {
    // Verificar que el ticket type existe
    const existingTicketType = await this.findByIdOrFail(id);

    // Validar ownership del evento
    await this.validateEventAccess(existingTicketType.eventId, user.uid);

    // Validar fechas de venta (si se están actualizando ambas)
    if (dto.salesStartDate || dto.salesEndDate) {
      const startDate: string | undefined = dto.salesStartDate
        ? dto.salesStartDate
        : existingTicketType.salesStartDate?.toDate().toISOString();
      const endDate: string | undefined = dto.salesEndDate
        ? dto.salesEndDate
        : existingTicketType.salesEndDate?.toDate().toISOString();

      if (startDate && endDate) {
        this.validateSalesDates(startDate, endDate);
      }
    }

    try {
      const updateData: Record<string, unknown> = {};

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.price !== undefined) updateData.price = dto.price;
      if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.currency !== undefined) updateData.currency = dto.currency;
      if (dto.salesStartDate !== undefined) {
        updateData.salesStartDate = new Date(dto.salesStartDate);
      }
      if (dto.salesEndDate !== undefined) {
        updateData.salesEndDate = new Date(dto.salesEndDate);
      }

      // NOTA: soldQuantity NO se incluye — solo se modifica desde Purchases.

      const updated = await this.updateDoc(id, updateData);

      this.logger.log(`TicketType updated: ${id}`);

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
        `Error updating ticket type ${id}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al actualizar el tipo de entrada. Intenta nuevamente.',
      );
    }
  }

  /**
   * Elimina un tipo de entrada.
   *
   * @param id - ID del TicketType a eliminar.
   * @param user - Usuario autenticado.
   *
   * @throws NotFoundException si no existe.
   * @throws ForbiddenException si el usuario no tiene ownership.
   */
  async delete(id: string, user: CurrentUser): Promise<void> {
    // Verificar que el ticket type existe
    const existingTicketType = await this.findByIdOrFail(id);

    // Validar ownership del evento
    await this.validateEventAccess(existingTicketType.eventId, user.uid);

    try {
      await this.deleteDoc(id);
      this.logger.log(`TicketType deleted: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(
        `Error deleting ticket type ${id}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al eliminar el tipo de entrada. Intenta nuevamente.',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers privados
  // ---------------------------------------------------------------------------

  /**
   * Valida que un evento exista y que el usuario sea owner de la organización
   * propietaria del evento.
   *
   * @param eventId - ID del evento.
   * @param organizationId - ID de la organización.
   * @param userId - UID del usuario autenticado.
   *
   * @throws NotFoundException si el evento o la organización no existen.
   * @throws ForbiddenException si el usuario no es owner de la organización.
   */
  private async validateEventOwnership(
    eventId: string,
    organizationId: string,
    userId: string,
  ): Promise<void> {
    // Validar que el evento existe
    const eventData = await this.getRawDoc(COLLECTIONS.EVENTS, eventId);

    if (!eventData) {
      throw new NotFoundException('El evento no existe.');
    }

    // Validar que el evento pertenece a la organización indicada
    if (eventData.organizationId !== organizationId) {
      throw new ForbiddenException(
        'El evento no pertenece a la organización especificada.',
      );
    }

    // Validar que la organización existe y el usuario es owner
    await this.validateOrganizationOwnership(organizationId, userId);
  }

  /**
   * Valida que el usuario tenga acceso (ownership) a un evento específico.
   * Obtiene el evento de Firestore y verifica el ownership de la organización.
   *
   * @param eventId - ID del evento.
   * @param userId - UID del usuario autenticado.
   *
   * @throws NotFoundException si el evento no existe.
   * @throws ForbiddenException si el usuario no es owner de la organización.
   */
  private async validateEventAccess(
    eventId: string,
    userId: string,
  ): Promise<void> {
    const eventData = await this.getRawDoc(COLLECTIONS.EVENTS, eventId);

    if (!eventData) {
      throw new NotFoundException('El evento no existe.');
    }

    const organizationId = eventData.organizationId as string;

    if (!organizationId) {
      throw new NotFoundException('El evento no tiene una organización asociada.');
    }

    await this.validateOrganizationOwnership(organizationId, userId);
  }

  /**
   * Valida que el usuario sea owner de la organización.
   */
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

  /**
   * Valida que salesStartDate sea anterior a salesEndDate, si ambas existen.
   *
   * @throws BadRequestException si las fechas son inválidas.
   */
  private validateSalesDates(
    salesStartDate?: string,
    salesEndDate?: string,
  ): void {
    if (!salesStartDate || !salesEndDate) {
      return;
    }

    const startDate = new Date(salesStartDate);
    const endDate = new Date(salesEndDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'Las fechas de venta no tienen un formato válido.',
      );
    }

    if (startDate >= endDate) {
      throw new BadRequestException(
        'La fecha de inicio de venta debe ser anterior a la fecha de fin.',
      );
    }
  }
}
