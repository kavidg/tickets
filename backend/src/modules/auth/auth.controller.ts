/**
 * TicketS - AuthController
 *
 * Controlador del módulo de autenticación.
 * Proporciona endpoints para consultar el perfil del usuario autenticado.
 *
 * Endpoints:
 *   GET /auth/me → Perfil del usuario autenticado
 *
 * @see FirebaseAuthGuard para la validación del token.
 * @see CurrentUser decorator para acceder al usuario.
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthService } from './auth.service';
import type { CurrentUser as CurrentUserType } from './interfaces/current-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * GET /api/v1/auth/me
   *
   * Retorna la información del usuario autenticado.
   *
   * @param user - Usuario autenticado extraído del token (via @CurrentUser).
   * @returns Perfil del usuario con uid, email, emailVerified, displayName,
   *          photoURL y customClaims.
   *
   * @example
   * // Request
   * GET /api/v1/auth/me
   * Authorization: Bearer <firebase-id-token>
   *
   * // Response
   * {
   *   "success": true,
   *   "data": {
   *     "uid": "abc123",
   *     "email": "user@example.com",
   *     "emailVerified": true,
   *     "displayName": "María García",
   *     "photoURL": "https://...",
   *     "customClaims": { "role": "cliente" }
   *   },
   *   "timestamp": "2024-01-01T00:00:00.000Z",
   *   "path": "/api/v1/auth/me"
   * }
   */
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  getProfile(@CurrentUser() user: CurrentUserType) {
    return this.authService.getProfile(user);
  }
}
