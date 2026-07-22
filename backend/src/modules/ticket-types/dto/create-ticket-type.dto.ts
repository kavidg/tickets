/**
 * TicketS - CreateTicketTypeDto
 *
 * DTO para la creación de un tipo de entrada.
 * Valida que los campos requeridos estén presentes y tengan el formato correcto.
 */

import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsIn,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateTicketTypeDto {
  /**
   * ID del evento al que pertenece el tipo de entrada.
   */
  @IsString()
  eventId!: string;

  /**
   * ID de la organización propietaria del evento.
   */
  @IsString()
  organizationId!: string;

  /**
   * Nombre visible del tipo de entrada (ej: 'General', 'VIP').
   */
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  /**
   * Descripción opcional del tipo de entrada.
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /**
   * Precio unitario en la moneda especificada.
   * Debe ser mayor o igual a 0.
   */
  @IsNumber()
  @Min(0)
  price!: number;

  /**
   * Cantidad total de entradas disponibles.
   * Debe ser al menos 1.
   */
  @IsNumber()
  @Min(1)
  quantity!: number;

  /**
   * Código de moneda. Por defecto 'COP'.
   */
  @IsOptional()
  @IsString()
  @IsIn(['COP', 'USD', 'EUR', 'MXN'])
  currency?: string;

  /**
   * Fecha de inicio de venta (opcional).
   */
  @IsOptional()
  @IsDateString()
  salesStartDate?: string;

  /**
   * Fecha de fin de venta (opcional).
   */
  @IsOptional()
  @IsDateString()
  salesEndDate?: string;
}
