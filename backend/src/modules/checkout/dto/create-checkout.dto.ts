/**
 * TicketS - CreateCheckoutDto
 *
 * DTO para iniciar el proceso de checkout.
 * Solo requiere el ID de la compra que se desea pagar.
 *
 * CheckoutService se encarga de validar que la compra exista,
 * pertenezca al usuario autenticado y esté en estado 'pending'.
 */

import { IsString } from 'class-validator';

export class CreateCheckoutDto {
  /**
   * ID de la Purchase que se desea pagar.
   */
  @IsString()
  purchaseId!: string;
}
