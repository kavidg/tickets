/**
 * TicketS - CreateVenueDto
 *
 * DTO para la creación de un venue/lugar de evento.
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
   * ID de la organización propietaria (requerido).
   */
  @IsString({ message: 'La organización es requerida.' })
  organizationId!: string;

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
   * País (opcional, por defecto se asume país no especificado).
   */
  @IsOptional()
  @IsString({ message: 'El país debe ser un texto válido.' })
  @MaxLength(100, { message: 'El país no puede exceder 100 caracteres.' })
  country?: string;

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
