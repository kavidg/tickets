/**
 * TicketS - ProfileModule
 *
 * Módulo de perfil de usuario.
 * Permite al usuario autenticado consultar y actualizar su perfil,
 * así como obtener la organización asociada.
 *
 * @see ProfileService para la lógica de gestión del perfil.
 */

import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
