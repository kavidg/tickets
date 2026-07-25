/**
 * TicketS - CheckoutModule
 *
 * Módulo de checkout responsable de iniciar el proceso de pago.
 * Ahora incluye BoldIntegrityService para generar la firma SHA-256
 * que el Botón de Pagos de Bold requiere.
 *
 * @see CheckoutService para la lógica de negocio.
 * @see BoldIntegrityService para la firma de integridad.
 */

import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { BoldIntegrityService } from './bold-integrity.service';

@Module({
  imports: [],
  controllers: [CheckoutController],
  providers: [CheckoutService, BoldIntegrityService],
  exports: [CheckoutService, BoldIntegrityService],
})
export class CheckoutModule {}
