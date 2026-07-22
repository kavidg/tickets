/**
 * TicketS - PaymentsModule
 *
 * Módulo de pagos que agrupa todos los proveedores de pago y la fábrica.
 * Expone PaymentFactory para que CheckoutModule lo consuma.
 *
 * Para agregar un nuevo proveedor:
 *   1. Crear el provider en src/payments/providers/.
 *   2. Agregarlo a providers y exports de este módulo.
 *   3. Agregar el case en PaymentFactory.getProvider().
 */

import { Module } from '@nestjs/common';
import { BoldProvider } from './providers/bold.provider';
import { PaymentFactory } from './payment-factory.service';

@Module({
  providers: [BoldProvider, PaymentFactory],
  exports: [PaymentFactory],
})
export class PaymentsModule {}
