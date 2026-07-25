/**
 * TicketS - PurchasesController
 *
 * Controlador de compras.
 *
 * El endpoint de creación (POST /) es público — no requiere autenticación.
 * Los endpoints de consulta (my, :id) requieren FirebaseAuthGuard.
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

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  /**
   * POST /api/v1/purchases
   *
   * Crea una nueva orden de compra.
   * Endpoint público — no requiere autenticación.
   * Los datos del comprador se envían en el body (buyer.name, buyer.email, buyer.phone).
   *
   * @param dto - Datos de creación (eventId, organizationId, items[], buyer).
   * @returns La Purchase creada con status 'pending'.
   */
  @Post()
  async create(@Body() dto: CreatePurchaseDto): Promise<Purchase> {
    return this.purchasesService.create(dto);
  }

  /**
   * Obtiene las compras del usuario autenticado.
   * Requiere autenticación.
   *
   * @param user - Usuario autenticado.
   * @returns Lista de compras del usuario.
   */
  @Get('my')
  @UseGuards(FirebaseAuthGuard)
  async getMyPurchases(
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Purchase[]> {
    return this.purchasesService.getMyPurchases(user);
  }

  /**
   * Obtiene una compra por su ID.
   * Solo el comprador o el owner de la organización pueden acceder.
   * Requiere autenticación.
   *
   * @param id - ID de la Purchase.
   * @param user - Usuario autenticado.
   * @returns La Purchase encontrada.
   */
  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
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
