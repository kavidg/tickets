/**
 * TicketS - EmailModule
 *
 * Módulo de envío de correos electrónicos.
 * Utiliza Nodemailer para enviar correos transaccionales.
 *
 * Responsabilidades:
 *   - Enviar entradas por correo después de una compra aprobada.
 *   - Generar QR en base64 para incrustar en el HTML.
 *   - Proveer plantilla HTML profesional (tema oscuro).
 *
 * @see EmailService para la lógica de envío.
 */

import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
