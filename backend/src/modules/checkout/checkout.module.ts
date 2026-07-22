/**
 * TicketS - CheckoutModule
 *
 * Módulo de checkout responsable de iniciar el proceso de pago.
 * Depende de PaymentsModule para la integración con la pasarela.
 *
 * CheckoutModule desacopla completamente la lógica de negocio
 * de los detalles de implementación de la pasarela de pagos.
 *
 * @see PaymentsModule para los proveedores de pago.
 * @see CheckoutService para la lógica de negocio.
 */

import { Module } from '@nestjs/common';
import { PaymentsModule } from '../../payments/payments.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

@Module({
  imports: [PaymentsModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
