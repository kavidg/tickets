/**
 * TicketS - SetupOrganizationDto
 *
 * DTO para el flujo de onboarding.
 * Permite a un usuario autenticado crear su primera organización
 * y asociarla automáticamente a su perfil.
 *
 * A diferencia de CreateOrganizationDto, este DTO requiere menos campos
 * porque está diseñado para el flujo inicial de configuración.
 */

import {
  IsString,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class SetupOrganizationDto {
  /**
   * Nombre de la organización.
   */
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name!: string;

  /**
   * Slug URL-friendly para la URL de la organización.
   * Solo minúsculas, números y guiones.
   */
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones.',
  })
  slug!: string;

  /**
   * Descripción breve de la organización.
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /**
   * URL del logo de la organización.
   */
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;
}
