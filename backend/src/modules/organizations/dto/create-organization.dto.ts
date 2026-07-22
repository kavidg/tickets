/**
 * TicketS - CreateOrganizationDto
 *
 * DTO para la creación de una organización.
 * Las validaciones se realizan mediante class-validator.
 *
 * @see organizations.controller.ts para el endpoint POST /organizations
 */

import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateOrganizationDto {
  /**
   * Nombre de la organización (requerido).
   * Mínimo 3 caracteres, máximo 100.
   */
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres.' })
  name!: string;

  /**
   * Slug URL-friendly (requerido).
   * Solo letras minúsculas, números y guiones.
   * Se utiliza para URLs públicas.
   */
  @IsString({ message: 'El slug debe ser un texto válido.' })
  @MinLength(3, { message: 'El slug debe tener al menos 3 caracteres.' })
  @MaxLength(80, { message: 'El slug no puede exceder 80 caracteres.' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones.',
  })
  slug!: string;

  /**
   * Descripción de la organización (opcional).
   */
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres.' })
  description?: string;

  /**
   * URL del logo (opcional).
   */
  @IsOptional()
  @IsUrl({}, { message: 'El logo debe ser una URL válida.' })
  logoUrl?: string;

  /**
   * Correo electrónico de contacto (requerido).
   */
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido.' })
  email!: string;

  /**
   * Teléfono de contacto (opcional).
   */
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto válido.' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres.' })
  phone?: string;

  /**
   * Ciudad de la organización (requerido).
   */
  @IsString({ message: 'La ciudad debe ser un texto válido.' })
  @MinLength(2, { message: 'La ciudad debe tener al menos 2 caracteres.' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres.' })
  city!: string;

  /**
   * NIT/RUC de la organización (opcional).
   */
  @IsOptional()
  @IsString({ message: 'El NIT debe ser un texto válido.' })
  @MaxLength(30, { message: 'El NIT no puede exceder 30 caracteres.' })
  nit?: string;
}
