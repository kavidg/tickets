/**
 * TicketS - CategoriesModule
 *
 * Módulo de categorías de eventos.
 * Las categorías son globales y no pertenecen a organizaciones.
 *
 * Permisos:
 *   - Lectura: Público (categorías activas)
 *   - Escritura: Solo super_admin
 *
 * @see CategoriesController para los endpoints.
 * @see CategoriesService para la lógica de negocio.
 */

import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
