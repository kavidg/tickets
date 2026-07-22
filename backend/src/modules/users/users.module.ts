/**
 * TicketS - UsersModule
 *
 * Módulo de usuarios de NestJS.
 * Proporciona endpoints para consultar perfiles de usuario
 * desde la colección `users` de Firestore.
 *
 * @see UsersController para los endpoints disponibles.
 * @see UsersService para la lógica de consulta a Firestore.
 */

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
