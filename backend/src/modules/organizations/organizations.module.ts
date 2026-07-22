/**
 * TicketS - OrganizationsModule
 *
 * Módulo de organizaciones de NestJS.
 * Proporciona endpoints para gestionar organizaciones en Firestore.
 *
 * Endpoints:
 *   POST /organizations     → Crear organización (autenticado)
 *   GET  /organizations/my  → Mis organizaciones (autenticado)
 *
 * @see OrganizationsController para los endpoints disponibles.
 * @see OrganizationsService para la lógica de negocio.
 */

import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
