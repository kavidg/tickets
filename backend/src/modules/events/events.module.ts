/**
 * TicketS - EventsModule
 *
 * Módulo de eventos de NestJS.
 * Proporciona endpoints CRUD para gestionar eventos en Firestore.
 *
 * Endpoints:
 *   POST   /events     → Crear evento (autenticado)
 *   GET    /events/my  → Mis eventos (autenticado)
 *   GET    /events/:id → Obtener evento por ID (autenticado)
 *   PATCH  /events/:id → Actualizar evento (autenticado, solo organizador)
 *   DELETE /events/:id → Eliminar evento (autenticado, solo organizador)
 *
 * @see EventsController para los endpoints disponibles.
 * @see EventsService para la lógica de negocio.
 */

import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
