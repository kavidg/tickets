/**
 * TicketS - Roles Guard
 *
 * Guard de autorización basado en roles.
 * Protege endpoints según el rol del usuario autenticado.
 *
 * FirebaseAuthGuard debe ejecutarse ANTES que RolesGuard
 * para que request.user esté disponible.
 *
 * @example
 * // Uso en un controlador:
 * @UseGuards(FirebaseAuthGuard, RolesGuard)
 * @HasRoles('super_admin')
 * @Post()
 * async create() { ... }
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { CurrentUser } from '../../modules/auth/interfaces/current-user.interface';

export const ROLES_KEY = 'roles';

/**
 * Decorador para asignar roles requeridos a un endpoint.
 *
 * @param roles - Roles permitidos para acceder al endpoint.
 *
 * @example
 * @HasRoles('super_admin')
 * @HasRoles('organizador', 'admin')
 */
export const HasRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUser | undefined = request.user;

    // Si no hay usuario autenticado, denegar acceso
    if (!user) {
      this.logger.warn('RolesGuard: No authenticated user in request.');
      throw new ForbiddenException(
        'Debes iniciar sesión para acceder a este recurso.',
      );
    }

    // Verificar si el rol del usuario está en los roles requeridos
    const hasRole = user.role && requiredRoles.includes(user.role);

    if (!hasRole) {
      this.logger.warn(
        `RolesGuard: User ${user.uid} with role "${user.role}" tried to access resource requiring [${requiredRoles.join(', ')}]`,
      );
      throw new ForbiddenException(
        'No tienes permisos suficientes para realizar esta acción.',
      );
    }

    return true;
  }
}
