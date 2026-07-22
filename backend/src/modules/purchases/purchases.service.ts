/**
 * TicketS - PurchasesService
 *
 * Servicio de compras que opera sobre la colección `purchases` de Firestore.
 * Extiende FirestoreRepository para reutilizar operaciones CRUD genéricas.
 *
 * Responsabilidades:
 * - Validar existencia de evento, organización y tipos de entrada.
 * - Verificar stock disponible y estado activo de los TicketTypes.
 * - Calcular precios exclusivamente desde Firestore (nunca confiar en el frontend).
 * - Asignar estado 'pending' y expiración de 30 minutos.
 * - NO modificar soldQuantity — eso ocurre cuando Bold confirma el pago.
 *
 * Los precios se obtienen de Firestore para evitar manipulación desde el cliente.
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
import { InventoryService } from '../inventory/inventory.service';
import type { CreatePurchaseDto, CreatePurchaseItemDto } from './dto/create-purchase.dto';
import type { UpdatePurchaseStatusDto } from './dto/update-purchase-status.dto';
import type { Purchase, PurchaseItem } from './interfaces/purchase.interface';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';
import type { InventoryReservationItem } from '../inventory/interfaces/inventory-reservation.interface';

/**
 * Tiempo de expiración de la reserva en milisegundos (30 minutos).
 */
const PURCHASE_EXPIRATION_MS = 30 * 60 * 1000;

@Injectable()
export class PurchasesService extends FirestoreRepository<Purchase> {
  protected collectionName = COLLECTIONS.PURCHASES;

  constructor(
    firebase: FirebaseAdminService,
    private readonly inventoryService: InventoryService,
  ) {
    super(firebase);
  }

  /**
   * Crea una nueva orden de compra en Firestore.
   *
   * Valida que el evento exista, la organización exista, los ticket types
   * pertenezcan al evento, tengan stock suficiente y estén activos.
   *
   * Los precios se obtienen de Firestore, no del frontend.
   *
   * @param dto - Datos de creación validados por CreatePurchaseDto.
   * @param user - Usuario autenticado (comprador).
   * @returns La Purchase creada con status 'pending'.
   *
   * @throws NotFoundException si el evento, organización o ticket type no existen.
   * @throws BadRequestException si hay errores de validación (stock, estado, etc.).
   */
  async create(dto: CreatePurchaseDto, user: CurrentUser): Promise<Purchase> {
    // 1. Validar que el evento existe
    const eventData = await this.getRawDoc(COLLECTIONS.EVENTS, dto.eventId);
    if (!eventData) {
      throw new NotFoundException('El evento no existe.');
    }

    // 2. Validar que la organización existe
    const orgData = await this.getRawDoc(COLLECTIONS.ORGANIZATIONS, dto.organizationId);
    if (!orgData) {
      throw new NotFoundException('La organización no existe.');
    }

    // 3. Validar que el evento pertenece a la organización
    if (eventData.organizationId !== dto.organizationId) {
      throw new BadRequestException(
        'El evento no pertenece a la organización especificada.',
      );
    }

    // 4. Validar y calcular cada item
    const items: PurchaseItem[] = [];
    let subtotal = 0;

    for (const itemDto of dto.items) {
      const validatedItem = await this.validateAndCalculateItem(
        itemDto,
        dto.eventId,
        dto.organizationId,
      );
      items.push(validatedItem);
      subtotal += validatedItem.subtotal;
    }

    // 5. Calcular totales
    const serviceFee = 0;
    const total = subtotal + serviceFee;
    const expiresAt = new Date(Date.now() + PURCHASE_EXPIRATION_MS);

    try {
      // 6. Crear la compra primero para obtener el ID
      const purchaseData: Record<string, unknown> = {
        userId: user.uid,
        organizationId: dto.organizationId,
        eventId: dto.eventId,
        items,
        subtotal,
        serviceFee,
        total,
        currency: 'COP',
        paymentProvider: 'bold',
        paymentReference: null,
        paymentUrl: null,
        status: 'pending',
        expiresAt: expiresAt,
        ...Timestamps.forCreate(),
      };

      const purchase = await this.createDoc(purchaseData);

      // 7. Reservar el inventario atómicamente
      // Si la reserva falla, la compra no debe existir → se elimina y se lanza error
      try {
        const reservationItems: InventoryReservationItem[] = items.map(
          (item) => ({
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
          }),
        );

        await this.inventoryService.reserveTickets(
          purchase.id,
          dto.eventId,
          reservationItems,
        );
      } catch (reservationError) {
        // La reserva falló — eliminar la compra para mantener consistencia
        await this.deleteDoc(purchase.id);
        throw reservationError;
      }

      this.logger.log(
        `Purchase created: ${purchase.id} (user: ${user.uid}, event: ${dto.eventId}, total: ${total})`,
      );

      return purchase;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error creating purchase: ${(error as Error).message}`);
      throw new BadRequestException(
        'Error al crear la compra. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene las compras del usuario autenticado.
   *
   * @param user - Usuario autenticado.
   * @returns Lista de compras del usuario, ordenadas por fecha de creación descendente.
   */
  async getMyPurchases(user: CurrentUser): Promise<Purchase[]> {
    try {
      return this.findMany((col) =>
        col.where('userId', '==', user.uid).orderBy('createdAt', 'desc'),
      );
    } catch (error) {
      this.logger.error(
        `Error fetching purchases for user ${user.uid}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al obtener tus compras. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene una compra por su ID.
   * Solo el comprador o el owner de la organización pueden consultarla.
   *
   * @param id - ID de la Purchase.
   * @param user - Usuario autenticado.
   * @returns La Purchase encontrada.
   *
   * @throws NotFoundException si la compra no existe.
   * @throws ForbiddenException si el usuario no tiene acceso.
   */
  async getById(id: string, user: CurrentUser): Promise<Purchase> {
    const purchase = await this.findByIdOrFail(id);

    // Validar acceso: solo el comprador o el owner de la organización
    if (purchase.userId !== user.uid) {
      await this.validateOrganizationOwnerAccess(
        purchase.organizationId,
        user.uid,
      );
    }

    return purchase;
  }

  /**
   * Actualiza el estado de una compra.
   * Diseñado para ser utilizado por webhooks de la pasarela de pagos.
   *
   * @param id - ID de la Purchase.
   * @param dto - Datos de actualización (nuevo estado).
   * @returns La Purchase actualizada.
   *
   * @throws NotFoundException si la compra no existe.
   */
  async updateStatus(
    id: string,
    dto: UpdatePurchaseStatusDto,
  ): Promise<Purchase> {
    const existingPurchase = await this.findByIdOrFail(id);

    try {
      const updateData: Record<string, unknown> = {
        status: dto.status,
      };

      const updated = await this.updateDoc(id, updateData);

      this.logger.log(
        `Purchase ${id} status updated: ${existingPurchase.status} → ${dto.status}`,
      );

      return updated;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Error updating purchase ${id} status: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al actualizar el estado de la compra. Intenta nuevamente.',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers privados
  // ---------------------------------------------------------------------------

  /**
   * Valida un item de compra contra Firestore.
   * Obtiene el TicketType real y calcula el subtotal desde el precio real.
   *
   * @param itemDto - Item DTO del frontend (ticketTypeId, quantity).
   * @param expectedEventId - Evento al que debe pertenecer el ticket type.
   * @param expectedOrganizationId - Organización propietaria.
   * @returns PurchaseItem validado y calculado.
   *
   * @throws NotFoundException si el TicketType no existe.
   * @throws BadRequestException si hay errores de validación.
   */
  private async validateAndCalculateItem(
    itemDto: CreatePurchaseItemDto,
    expectedEventId: string,
    expectedOrganizationId: string,
  ): Promise<PurchaseItem> {
    // Obtener el TicketType real desde Firestore
    const ticketTypeData = await this.getRawDoc(
      COLLECTIONS.TICKET_TYPES,
      itemDto.ticketTypeId,
    );

    if (!ticketTypeData) {
      throw new NotFoundException(
        `El tipo de entrada con ID "${itemDto.ticketTypeId}" no existe.`,
      );
    }

    // Validar que pertenece al evento
    if (ticketTypeData.eventId !== expectedEventId) {
      throw new BadRequestException(
        `El tipo de entrada "${ticketTypeData.name}" no pertenece a este evento.`,
      );
    }

    // Validar que pertenece a la organización
    if (ticketTypeData.organizationId !== expectedOrganizationId) {
      throw new BadRequestException(
        `El tipo de entrada "${ticketTypeData.name}" no pertenece a esta organización.`,
      );
    }

    // Validar que el ticket type está activo
    const ticketTypeStatus = ticketTypeData.status as string;
    if (ticketTypeStatus !== 'active') {
      const statusLabels: Record<string, string> = {
        paused: 'pausado',
        sold_out: 'agotado',
        closed: 'cerrado',
      };
      throw new BadRequestException(
        `El tipo de entrada "${ticketTypeData.name}" no está disponible (${statusLabels[ticketTypeStatus] || ticketTypeStatus}).`,
      );
    }

    // Validar stock suficiente
    const availableQuantity =
      (ticketTypeData.quantity as number) -
      (ticketTypeData.soldQuantity as number);
    if (availableQuantity < itemDto.quantity) {
      throw new BadRequestException(
        `No hay suficientes entradas disponibles para "${ticketTypeData.name}". ` +
          `Disponibles: ${availableQuantity}, solicitadas: ${itemDto.quantity}.`,
      );
    }

    // Obtener precio real desde Firestore (nunca confiar en el frontend)
    const unitPrice = ticketTypeData.price as number;
    const ticketName = ticketTypeData.name as string;
    const subtotal = unitPrice * itemDto.quantity;

    return {
      ticketTypeId: itemDto.ticketTypeId,
      ticketName,
      quantity: itemDto.quantity,
      unitPrice,
      subtotal,
    };
  }

  /**
   * Valida que el usuario sea owner de la organización.
   * Utilizado para verificar acceso de organizadores a compras de sus eventos.
   *
   * @param organizationId - ID de la organización.
   * @param userId - UID del usuario autenticado.
   *
   * @throws NotFoundException si la organización no existe.
   * @throws ForbiddenException si el usuario no es owner.
   */
  private async validateOrganizationOwnerAccess(
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
        'No tienes permiso para acceder a esta compra.',
      );
    }
  }
}
