/**
 * TicketS - PurchasesController
 *
 * Controlador de compras.
 * Todos los endpoints requieren autenticación mediante FirebaseAuthGuard.
 *
 * La creación de compras valida precios desde Firestore y asigna
 * automáticamente el estado 'pending'.
 *
 * El endpoint de actualización de estado está diseñado para ser
 * utilizado posteriormente por el webhook de Bold.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseStatusDto } from './dto/update-purchase-status.dto';
import type { CurrentUser as CurrentUserInterface } from '../auth/interfaces/current-user.interface';
import type { Purchase } from './interfaces/purchase.interface';

@Controller('api/v1/purchases')
@UseGuards(FirebaseAuthGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  /**
   * Crea una nueva orden de compra.
   *
   * @param dto - Datos de creación (eventId, organizationId, items[]).
   * @param user - Usuario autenticado (comprador).
   * @returns La Purchase creada con status 'pending'.
   */
  @Post()
  async create(
    @Body() dto: CreatePurchaseDto,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Purchase> {
    return this.purchasesService.create(dto, user);
  }

  /**
   * Obtiene las compras del usuario autenticado.
   *
   * @param user - Usuario autenticado.
   * @returns Lista de compras del usuario.
   */
  @Get('my')
  async getMyPurchases(
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Purchase[]> {
    return this.purchasesService.getMyPurchases(user);
  }

  /**
   * Obtiene una compra por su ID.
   * Solo el comprador o el owner de la organización pueden acceder.
   *
   * @param id - ID de la Purchase.
   * @param user - Usuario autenticado.
   * @returns La Purchase encontrada.
   */
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Purchase> {
    return this.purchasesService.getById(id, user);
  }

  /**
   * Actualiza el estado de una compra.
   * Diseñado para webhooks de la pasarela de pagos.
   *
   * @param id - ID de la Purchase.
   * @param dto - Nuevo estado (paid, cancelled, expired, failed).
   * @returns La Purchase actualizada.
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseStatusDto,
  ): Promise<Purchase> {
    return this.purchasesService.updateStatus(id, dto);
  }
}
