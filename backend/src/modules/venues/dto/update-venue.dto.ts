/**
 * TicketS - UpdateVenueDto
 *
 * DTO para la actualización de un venue/lugar de evento.
 * Todos los campos son opcionales; solo se actualizan los enviados.
 * Las validaciones se realizan mediante class-validator.
 *
 * @see venues.controller.ts para el endpoint PATCH /venues/:id
 */

import {
  IsString,
  IsOptional,
  IsUrl,
  IsNumber,
  IsBoolean,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateVenueDto {
  /**
   * ID de la organización propietaria (opcional).
   */
  @IsOptional()
  @IsString({ message: 'La organización debe ser un texto válido.' })
  organizationId?: string;

  /**
   * Nombre del lugar (opcional).
   */
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres.' })
  name?: string;

  /**
   * Descripción del lugar (opcional).
   */
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres.' })
  description?: string;

  /**
   * Dirección del lugar (opcional).
   */
  @IsOptional()
  @IsString({ message: 'La dirección debe ser un texto válido.' })
  @MinLength(3, { message: 'La dirección debe tener al menos 3 caracteres.' })
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres.' })
  address?: string;

  /**
   * Ciudad (opcional).
   */
  @IsOptional()
  @IsString({ message: 'La ciudad debe ser un texto válido.' })
  @MinLength(2, { message: 'La ciudad debe tener al menos 2 caracteres.' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres.' })
  city?: string;

  /**
   * País (opcional).
   */
  @IsOptional()
  @IsString({ message: 'El país debe ser un texto válido.' })
  @MaxLength(100, { message: 'El país no puede exceder 100 caracteres.' })
  country?: string;

  /**
   * Capacidad máxima de personas (opcional).
   */
  @IsOptional()
  @IsNumber({}, { message: 'La capacidad debe ser un número.' })
  @Min(1, { message: 'La capacidad debe ser al menos 1.' })
  capacity?: number;

  /**
   * URL de la imagen representativa (opcional).
   */
  @IsOptional()
  @IsUrl({}, { message: 'La imagen debe ser una URL válida.' })
  imageUrl?: string;

  /**
   * Indica si el lugar está activo (opcional).
   */
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso.' })
  active?: boolean;
}
