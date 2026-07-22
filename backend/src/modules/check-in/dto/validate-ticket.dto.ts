/**
 * TicketS - ValidateTicketDto
 *
 * DTO para validar un ticket de ingreso.
 * El organizador envía el código del ticket (escaneado del QR o escrito)
 * y el sistema verifica si es válido para ingresar al evento.
 */

import { IsString, MinLength } from 'class-validator';

export class ValidateTicketDto {
  /**
   * Código único del ticket (formato: TCK-XXXXXX-XXXXXXXXXX).
   * Se obtiene escaneando el QR del ticket o escribiendo el código manualmente.
   */
  @IsString()
  @MinLength(5)
  code!: string;
}
