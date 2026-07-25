/**
 * TicketS - CreateVenueDto
 *
 * DTO para la creación de un venue/lugar de evento.
 * organizationId se asigna automáticamente desde el perfil del usuario autenticado.
 * Las validaciones se realizan mediante class-validator.
 *
 * @see venues.controller.ts para el endpoint POST /venues
 */

import {
  IsString,
  IsOptional,
  IsUrl,
  IsNumber,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateVenueDto {
  /**
   * Nombre del lugar (requerido).
   * Mínimo 3 caracteres, máximo 200.
   */
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres.' })
  name!: string;

  /**
   * Descripción del lugar (opcional).
   */
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres.' })
  description?: string;

  /**
   * Dirección del lugar (requerido).
   */
  @IsString({ message: 'La dirección es requerida.' })
  @MinLength(3, { message: 'La dirección debe tener al menos 3 caracteres.' })
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres.' })
  address!: string;

  /**
   * Ciudad (requerido).
   */
  @IsString({ message: 'La ciudad es requerida.' })
  @MinLength(2, { message: 'La ciudad debe tener al menos 2 caracteres.' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres.' })
  city!: string;

  /**
   * Departamento / Estado / Provincia (opcional).
   */
  @IsOptional()
  @IsString({ message: 'El estado debe ser un texto válido.' })
  @MaxLength(100, { message: 'El estado no puede exceder 100 caracteres.' })
  state?: string;

  /**
   * País (opcional).
   */
  @IsOptional()
  @IsString({ message: 'El país debe ser un texto válido.' })
  @MaxLength(100, { message: 'El país no puede exceder 100 caracteres.' })
  country?: string;

  /**
   * Código postal (opcional).
   */
  @IsOptional()
  @IsString({ message: 'El código postal debe ser un texto válido.' })
  @MaxLength(20, { message: 'El código postal no puede exceder 20 caracteres.' })
  postalCode?: string;

  /**
   * Latitud (opcional).
   */
  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número.' })
  latitude?: number;

  /**
   * Longitud (opcional).
   */
  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número.' })
  longitude?: number;

  /**
   * Capacidad máxima de personas (requerido).
   * Debe ser un número positivo.
   */
  @IsNumber({}, { message: 'La capacidad debe ser un número.' })
  @Min(1, { message: 'La capacidad debe ser al menos 1.' })
  capacity!: number;

  /**
   * URL de la imagen representativa (opcional).
   */
  @IsOptional()
  @IsUrl({}, { message: 'La imagen debe ser una URL válida.' })
  imageUrl?: string;
}
