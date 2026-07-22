/**
 * TicketS - UpdateCategoryDto
 *
 * DTO para la actualización de una categoría de eventos.
 * Todos los campos son opcionales — solo se actualizan los enviados.
 *
 * @see Category para el modelo completo.
 * @see CategoriesController.update para el uso en el endpoint.
 */

import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
  IsBoolean,
  Matches,
} from 'class-validator';

export class UpdateCategoryDto {
  /**
   * Nombre visible de la categoría.
   */
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres.' })
  readonly name?: string;

  /**
   * Slug único para URLs amigables.
   */
  @IsOptional()
  @IsString({ message: 'El slug debe ser un texto válido.' })
  @MinLength(3, { message: 'El slug debe tener al menos 3 caracteres.' })
  @MaxLength(80, { message: 'El slug no puede exceder 80 caracteres.' })
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'El slug solo puede contener minúsculas, números y guiones (ej: "conciertos-2024").',
  })
  readonly slug?: string;

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

  /**
   * Indica si la categoría está activa.
   * Las categorías inactivas no se muestran en listados públicos.
   */
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso.' })
  readonly active?: boolean;
}
