/**
 * TicketS - InventoryModule
 *
 * Módulo de inventario de entradas.
 * NO tiene controlador — solo expone InventoryService para ser inyectado
 * por PurchasesService y futuros módulos (webhooks, Cloud Functions).
 *
 * InventoryService gestiona la reserva temporal de stock mientras
 * una compra está en estado "pending", evitando sobreventa.
 *
 * @see PurchasesService para el consumo principal.
 */

import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Module({
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
