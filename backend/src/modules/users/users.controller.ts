/**
 * TicketS - UsersController
 *
 * Controlador del módulo de usuarios.
 * Proporciona endpoints para consultar el perfil del usuario autenticado
 * desde la colección `users` de Firestore.
 *
 * Endpoints:
 *   GET /users/me → Perfil completo desde Firestore
 *
 * @see FirebaseAuthGuard para la validación del token.
 * @see CurrentUser decorator para acceder al usuario autenticado.
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import type { CurrentUser as CurrentUserType } from '../auth/interfaces/current-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/v1/users/me
   *
   * Retorna el perfil del usuario autenticado desde Firestore.
   * Utiliza request.user.uid (obtenido del token por FirebaseAuthGuard)
   * para buscar el documento en la colección `users`.
   *
   * @param user - Usuario autenticado (via @CurrentUser).
   * @returns Perfil completo desde Firestore.
   *
   * @example
   * // Request
   * GET /api/v1/users/me
   * Authorization: Bearer <firebase-id-token>
   *
   * // Response
   * {
   *   "success": true,
   *   "data": {
   *     "uid": "abc123",
   *     "email": "user@example.com",
   *     "displayName": "María García",
   *     "role": "cliente",
   *     "status": "active",
   *     "organizationId": "org456",
   *     "phone": "+573001234567",
   *     "city": "Cali",
   *     "createdAt": { ... },
   *     "updatedAt": { ... }
   *   },
   *   "timestamp": "2024-01-01T00:00:00.000Z",
   *   "path": "/api/v1/users/me"
   * }
   */
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async getProfile(@CurrentUser() user: CurrentUserType) {
    return this.usersService.getUserProfile(user.uid);
  }
}
