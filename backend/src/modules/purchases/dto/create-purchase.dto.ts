/**
 * TicketS - CreatePurchaseDto
 *
 * DTO para la creación de una orden de compra.
 * Solo recibe los datos mínimos necesarios desde el frontend.
 *
 * Los precios, subtotales, totales y cargos se calculan desde Firestore
 * para evitar manipulación de precios desde el cliente.
 *
 * NOTA: No se permite recibir price, subtotal, total, serviceFee, currency,
 * paymentProvider, paymentReference, paymentUrl ni status.
 * Todo eso se calcula o asigna automáticamente en el servidor.
 */

import {
  IsString,
  IsArray,
  IsNumber,
  ArrayMinSize,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Item individual dentro del DTO de creación.
 */
export class CreatePurchaseItemDto {
  /**
   * ID del TicketType a comprar.
   */
  @IsString()
  ticketTypeId!: string;

  /**
   * Cantidad de entradas a comprar de este tipo.
   * Debe ser al menos 1.
   */
  @IsNumber()
  @Min(1)
  quantity!: number;
}

/**
 * DTO de creación de compra.
 *
 * El frontend envía únicamente:
 * - organizationId
 * - eventId
 * - items[] con ticketTypeId y quantity
 *
 * Todo lo demás (precios, totales, fechas) se calcula en el servidor.
 */
export class CreatePurchaseDto {
  /**
   * ID de la organización propietaria del evento.
   */
  @IsString()
  organizationId!: string;

  /**
   * ID del evento que se está comprando.
   */
  @IsString()
  eventId!: string;

  /**
   * Items de la compra (tipos de entrada y cantidades).
   * Debe contener al menos 1 item.
   */
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items!: CreatePurchaseItemDto[];
}
