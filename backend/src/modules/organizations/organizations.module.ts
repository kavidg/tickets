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
import { ProfileModule } from '../profile/profile.module';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  imports: [ProfileModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
