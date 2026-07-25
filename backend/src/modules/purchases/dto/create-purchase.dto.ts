/**
 * TicketS - CreatePurchaseDto
 *
 * DTO para la creación de una orden de compra.
 * Recibe los datos mínimos desde el frontend, incluyendo datos del comprador.
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
  MinLength,
  ValidateNested,
  IsEmail,
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
 * Datos del comprador (público, sin autenticación).
 */
export class CreatePurchaseBuyerDto {
  /**
   * Nombre completo del comprador.
   */
  @IsString()
  @MinLength(1, { message: 'El nombre del comprador es obligatorio.' })
  name!: string;

  /**
   * Correo electrónico del comprador.
   */
  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  email!: string;

  /**
   * Número de teléfono del comprador.
   */
  @IsString()
  @MinLength(1, { message: 'El teléfono del comprador es obligatorio.' })
  phone!: string;
}

/**
 * DTO de creación de compra.
 *
 * El frontend envía:
 * - organizationId
 * - eventId
 * - items[] con ticketTypeId y quantity
 * - buyer con name, email, phone
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

  /**
   * Datos del comprador (público, sin autenticación).
   */
  @ValidateNested()
  @Type(() => CreatePurchaseBuyerDto)
  buyer!: CreatePurchaseBuyerDto;
}
