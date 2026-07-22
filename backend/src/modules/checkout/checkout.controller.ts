/**
 * TicketS - CheckoutController
 *
 * Controlador de checkout.
 * Único endpoint: POST /api/v1/checkout
 *
 * Recibe el ID de una compra y devuelve la información necesaria
 * para redirigir al usuario a la pasarela de pagos.
 *
 * La integración con la pasarela se delega en PaymentFactory,
 * por lo que este controlador no conoce detalles de Bold.
 */

import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import type { CurrentUser as CurrentUserInterface } from '../auth/interfaces/current-user.interface';
import type { CheckoutResponse } from './interfaces/checkout-response.interface';

@Controller('api/v1/checkout')
@UseGuards(FirebaseAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * Inicia el proceso de pago para una compra.
   *
   * @param dto - Datos del checkout (purchaseId).
   * @param user - Usuario autenticado (comprador).
   * @returns CheckoutResponse con paymentUrl para redirigir a la pasarela.
   */
  @Post()
  async create(
    @Body() dto: CreateCheckoutDto,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<CheckoutResponse> {
    return this.checkoutService.create(dto, user);
  }
}
