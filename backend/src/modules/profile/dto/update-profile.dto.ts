/**
 * TicketS - UpdateProfileDto
 *
 * DTO para actualizar el perfil del usuario autenticado.
 * Solo permite modificar displayName.
 *
 * Los campos uid, email, role y organizationId NO son modificables
 * a través de este DTO.
 */

import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  /**
   * Nombre visible del usuario.
   * Opcional — si no se envía, no se modifica.
   */
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName?: string;
}
