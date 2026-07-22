/**
 * TicketS - FirebaseAdminModule
 *
 * Módulo global que provee FirebaseAdminService a toda la aplicación.
 * Los servicios de negocio pueden inyectar FirebaseAdminService directamente
 * sin necesidad de importar este módulo en cada módulo funcional.
 *
 * @example
 * // En un servicio:
 * constructor(private readonly firebase: FirebaseAdminService) {}
 *
 * // En un módulo funcional (no requiere import si es global):
 * // @Module({ providers: [MiServicio] })
 * // export class MiModulo {}
 */

import { Module, Global } from '@nestjs/common';
import { FirebaseAdminService } from './firebase.service';

@Global()
@Module({
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class FirebaseAdminModule {}
