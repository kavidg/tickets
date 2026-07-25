/**
 * TicketS - CreateProfileDto
 *
 * DTO para crear el perfil inicial del usuario autenticado.
 * Los campos uid y email se obtienen automáticamente del token JWT.
 */

import { IsOptional, IsString, MinLength, MaxLength, IsIn } from 'class-validator';

/**
 * Roles permitidos durante la creación del perfil desde el frontend.
 * 'organizer' y 'cliente' son los roles iniciales disponibles.
 */
const ALLOWED_ROLES = ['organizer', 'cliente'] as const;

export class CreateProfileDto {
  /**
   * Nombre visible del usuario.
   */
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName?: string;

  /**
   * Rol inicial del usuario.
   * @default 'organizer' (backend default)
   */
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_ROLES)
  role?: 'organizer' | 'cliente';

  /**
   * URL de la foto de perfil.
   */
  @IsOptional()
  @IsString()
  photoURL?: string;

  /**
   * Número de teléfono.
   */
  @IsOptional()
  @IsString()
  phone?: string;

  /**
   * Ciudad de residencia.
   */
  @IsOptional()
  @IsString()
  city?: string;
}
