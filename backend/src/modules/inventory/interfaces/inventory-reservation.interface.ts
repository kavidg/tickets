/**
 * TicketS - Inventory Reservation Interface
 *
 * Define los tipos de datos utilizados por InventoryService
 * para gestionar reservas temporales de stock de entradas.
 *
 * Los errores de stock se comunican mediante excepciones (BadRequestException)
 * en lugar de objetos de resultado, permitiendo que la transacción de Firestore
 * se aborte automáticamente.
 */

/**
 * Item de reserva de inventario.
 * Representa la cantidad a reservar/liberar/confirmar de un ticket type.
 */
export interface InventoryReservationItem {
  /** ID del TicketType en Firestore */
  ticketTypeId: string;
  /** Cantidad de entradas a reservar */
  quantity: number;
}
