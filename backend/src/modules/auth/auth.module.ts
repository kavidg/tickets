/**
 * TicketS - AuthModule
 *
 * Módulo de autenticación de NestJS.
 * Proporciona el guard FirebaseAuthGuard, el decorador @CurrentUser(),
 * y el endpoint GET /auth/me.
 *
 * Este módulo NO maneja login ni registro. La autenticación primaria
 * se realiza desde el frontend con Firebase Client SDK.
 * NestJS únicamente valida los tokens emitidos por Firebase Auth.
 *
 * @see FirebaseAuthGuard para la validación de tokens.
 * @see CurrentUser decorator para acceder al usuario autenticado.
 */

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
