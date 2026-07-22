/**
 * TicketS - CreateCategoryDto
 *
 * DTO para la creación de una categoría de eventos.
 * Solo usuarios con rol super_admin pueden crear categorías.
 *
 * @see Category para el modelo completo.
 * @see CategoriesController.create para el uso en el endpoint.
 */

import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
  /**
   * Nombre visible de la categoría.
   * Ejemplo: "Conciertos", "Teatro", "Deportes"
   */
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres.' })
  readonly name!: string;

  /**
   * Slug único para URLs amigables.
   * Solo minúsculas, números y guiones.
   * Ejemplo: "conciertos", "teatro", "eventos-deportivos"
   */
  @IsString({ message: 'El slug debe ser un texto válido.' })
  @MinLength(3, { message: 'El slug debe tener al menos 3 caracteres.' })
  @MaxLength(80, { message: 'El slug no puede exceder 80 caracteres.' })
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'El slug solo puede contener minúsculas, números y guiones (ej: "conciertos-2024").',
  })
  readonly slug!: string;

  /**
   * Descripción breve de la categoría.
   */
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @MaxLength(500, {
    message: 'La descripción no puede exceder 500 caracteres.',
  })
  readonly description?: string;

  /**
   * URL de la imagen representativa de la categoría.
   */
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen no es válida.' })
  readonly imageUrl?: string;
}
