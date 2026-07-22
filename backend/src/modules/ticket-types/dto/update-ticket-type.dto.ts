/**
 * TicketS - UpdateTicketTypeDto
 *
 * DTO para la actualización de un tipo de entrada.
 * Todos los campos son opcionales.
 * No permite modificar soldQuantity (solo modificable por Purchases).
 * No permite modificar eventId ni organizationId (pertenencia inmodificable).
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

export class UpdateTicketTypeDto {
  /**
   * Nombre visible del tipo de entrada.
   */
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  /**
   * Descripción del tipo de entrada.
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /**
   * Precio unitario.
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  /**
   * Cantidad total de entradas disponibles.
   */
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  /**
   * Estado del tipo de entrada.
   */
  @IsOptional()
  @IsString()
  @IsIn(['active', 'paused', 'sold_out', 'closed'])
  status?: string;

  /**
   * Código de moneda.
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
