/**
 * TicketS - CreateTicketDto
 *
 * DTO interno para la creación de tickets.
 * NO tiene endpoint público — solo es utilizado internamente
 * por TicketsService.createTicketsFromPurchase().
 *
 * Los tickets se generan automáticamente desde una Purchase pagada,
 * no a través de una API REST.
 *
 * @see TicketsService.createTicketsFromPurchase para el método que lo utiliza.
 */

import { IsString } from 'class-validator';

/**
 * DTO interno para representar la solicitud de generación de tickets
 * a partir de una compra.
 *
 * Actualmente no se usa directamente en el servicio (se pasa un objeto
 * Purchase completo), pero está disponible para futuras implementaciones
 * que requieran generar tickets manualmente.
 */
export class CreateTicketDto {
  @IsString()
  purchaseId!: string;
}
