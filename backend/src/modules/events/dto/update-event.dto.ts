/**
 * TicketS - UpdateEventDto
 *
 * DTO para la actualización de un evento.
 * Todos los campos son opcionales; solo se actualizan los enviados.
 * Las validaciones se realizan mediante class-validator.
 *
 * @see events.controller.ts para el endpoint PATCH /events/:id
 */

import {
  IsString,
  IsOptional,
  IsUrl,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
  IsIn,
} from 'class-validator';
import type { EventStatus } from '../interfaces/event.interface';

const VALID_STATUSES: EventStatus[] = [
  'draft',
  'published',
  'finished',
  'cancelled',
];

export class UpdateEventDto {
  /**
   * Título del evento (opcional).
   */
  @IsOptional()
  @IsString({ message: 'El título debe ser un texto válido.' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres.' })
  title?: string;

  /**
   * Slug URL-friendly (opcional).
   */
  @IsOptional()
  @IsString({ message: 'El slug debe ser un texto válido.' })
  @MinLength(3, { message: 'El slug debe tener al menos 3 caracteres.' })
  @MaxLength(200, { message: 'El slug no puede exceder 200 caracteres.' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones.',
  })
  slug?: string;

  /**
   * Descripción detallada del evento (opcional).
   */
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @MaxLength(2000, { message: 'La descripción no puede exceder 2000 caracteres.' })
  description?: string;

  /**
   * ID de la categoría (opcional).
   */
  @IsOptional()
  @IsString({ message: 'La categoría debe ser un texto válido.' })
  categoryId?: string;

  /**
   * ID de la organización organizadora (opcional).
   */
  @IsOptional()
  @IsString({ message: 'La organización debe ser un texto válido.' })
  organizationId?: string;

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
   * Ciudad donde se realiza el evento (opcional).
   */
  @IsOptional()
  @IsString({ message: 'La ciudad debe ser un texto válido.' })
  @MinLength(2, { message: 'La ciudad debe tener al menos 2 caracteres.' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres.' })
  city?: string;

  /**
   * Dirección específica del lugar (opcional).
   */
  @IsOptional()
  @IsString({ message: 'La dirección debe ser un texto válido.' })
  @MinLength(3, { message: 'La dirección debe tener al menos 3 caracteres.' })
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres.' })
  address?: string;

  /**
   * Fecha y hora de inicio (opcional, formato ISO 8601).
   */
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe tener un formato válido (ISO 8601).' })
  startDate?: string;

  /**
   * Fecha y hora de fin (opcional, formato ISO 8601).
   */
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe tener un formato válido (ISO 8601).' })
  endDate?: string;

  /**
   * Estado del evento (opcional).
   */
  @IsOptional()
  @IsIn(VALID_STATUSES, {
    message: 'El estado debe ser uno de: draft, published, finished, cancelled.',
  })
  status?: EventStatus;
}
