/**
 * TicketS - UpdatePurchaseStatusDto
 *
 * DTO para actualizar el estado de una compra.
 * Será utilizado por el webhook de Bold (o futuros webhooks) cuando
 * la pasarela de pagos confirme, rechace o notifique cambios en el estado.
 *
 * Inicialmente solo permite modificar el status.
 * Más adelante se podrán agregar paymentReference y paymentUrl cuando
 * Bold devuelva esa información.
 */

import { IsString, IsIn } from 'class-validator';

export class UpdatePurchaseStatusDto {
  /**
   * Nuevo estado de la compra.
   *
   * Flujo esperado:
   *   pending → paid (pago exitoso)
   *   pending → failed (pago rechazado)
   *   pending → cancelled (usuario cancela)
   *   pending → expired (reserva expira)
   */
  @IsString()
  @IsIn(['paid', 'cancelled', 'expired', 'failed'])
  status!: string;
}
