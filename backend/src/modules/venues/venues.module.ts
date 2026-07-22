/**
 * TicketS - VenuesModule
 *
 * Módulo de venues (lugares de evento) de NestJS.
 * Proporciona endpoints CRUD para gestionar espacios físicos en Firestore.
 *
 * Endpoints:
 *   POST   /venues     → Crear venue (autenticado, solo owner de la org)
 *   GET    /venues/my  → Mis venues (autenticado)
 *   GET    /venues/:id → Obtener venue por ID (autenticado)
 *   PATCH  /venues/:id → Actualizar venue (autenticado, solo owner de la org)
 *   DELETE /venues/:id → Eliminar venue (autenticado, solo owner de la org)
 *
 * @see VenuesController para los endpoints disponibles.
 * @see VenuesService para la lógica de negocio.
 */

import { Module } from '@nestjs/common';
import { VenuesController } from './venues.controller';
import { VenuesService } from './venues.service';

@Module({
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule {}
