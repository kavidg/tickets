/**
 * TicketS - CheckoutController
 *
 * Controlador de checkout.
 * Único endpoint: POST /checkout
 *
 * Endpoint público — no requiere autenticación.
 * El purchaseId actúa como identificador de la compra.
 *
 * Recibe el ID de una compra y devuelve la información necesaria
 * para redirigir al usuario a la pasarela de pagos.
 *
 * La integración con la pasarela se delega en PaymentFactory,
 * por lo que este controlador no conoce detalles de Bold.
 */

import { Controller, Post, Body } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import type { CheckoutResponse } from './interfaces/checkout-response.interface';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * POST /checkout
   *
   * Inicia el proceso de pago para una compra.
   * Endpoint público — el purchaseId identifica la compra.
   *
   * @param dto - Datos del checkout (purchaseId).
   * @returns CheckoutResponse con paymentUrl para redirigir a la pasarela.
   */
  @Post()
  async create(@Body() dto: CreateCheckoutDto): Promise<CheckoutResponse> {
    return this.checkoutService.create(dto);
  }
}
