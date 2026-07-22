/**
 * TicketS - CreateEventDto
 *
 * DTO para la creación de un evento.
 * Las validaciones se realizan mediante class-validator.
 *
 * @see events.controller.ts para el endpoint POST /events
 */

import {
  IsString,
  IsOptional,
  IsUrl,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateEventDto {
  /**
   * Título del evento (requerido).
   * Mínimo 3 caracteres, máximo 200.
   */
  @IsString({ message: 'El título debe ser un texto válido.' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres.' })
  title!: string;

  /**
   * Slug URL-friendly (requerido).
   * Solo letras minúsculas, números y guiones.
   * Se utiliza para URLs públicas del evento.
   */
  @IsString({ message: 'El slug debe ser un texto válido.' })
  @MinLength(3, { message: 'El slug debe tener al menos 3 caracteres.' })
  @MaxLength(200, { message: 'El slug no puede exceder 200 caracteres.' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones.',
  })
  slug!: string;

  /**
   * Descripción detallada del evento (opcional).
   */
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @MaxLength(2000, { message: 'La descripción no puede exceder 2000 caracteres.' })
  description?: string;

  /**
   * ID de la categoría (requerido).
   */
  @IsString({ message: 'La categoría es requerida.' })
  categoryId!: string;

  /**
   * ID de la organización organizadora (requerido).
   */
  @IsString({ message: 'La organización es requerida.' })
  organizationId!: string;

  /**
   * ID del lugar/venue (opcional).
   */
  @IsOptional()
  @IsString({ message: 'El lugar debe ser un texto válido.' })
  venueId?: string;

  /**
   * URL del banner o imagen principal (opcional).
   */
  @IsOptional()
  @IsUrl({}, { message: 'La imagen debe ser una URL válida.' })
  imageUrl?: string;

  /**
   * Ciudad donde se realiza el evento (requerido).
   */
  @IsString({ message: 'La ciudad es requerida.' })
  @MinLength(2, { message: 'La ciudad debe tener al menos 2 caracteres.' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres.' })
  city!: string;

  /**
   * Dirección específica del lugar (requerido).
   */
  @IsString({ message: 'La dirección es requerida.' })
  @MinLength(3, { message: 'La dirección debe tener al menos 3 caracteres.' })
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres.' })
  address!: string;

  /**
   * Fecha y hora de inicio (requerido, formato ISO 8601).
   */
  @IsDateString({}, { message: 'La fecha de inicio debe tener un formato válido (ISO 8601).' })
  startDate!: string;

  /**
   * Fecha y hora de fin (requerido, formato ISO 8601).
   */
  @IsDateString({}, { message: 'La fecha de fin debe tener un formato válido (ISO 8601).' })
  endDate!: string;
}
