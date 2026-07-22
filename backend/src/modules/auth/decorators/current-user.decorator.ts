/**
 * TicketS - @CurrentUser() Decorator
 *
 * Decorador de parámetros que extrae el usuario autenticado de request.user.
 *
 * @example
 * // Obtener el usuario completo
 * @Get('profile')
 * getProfile(@CurrentUser() user: CurrentUser) {
 *   return user;
 * }
 *
 * // Obtener solo el UID
 * @Get('profile')
 * getProfile(@CurrentUser('uid') uid: string) {
 *   return uid;
 * }
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { CurrentUser as CurrentUserInterface } from '../interfaces/current-user.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserInterface | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserInterface | undefined;

    // Si no hay usuario, retornar undefined (el guard debe proteger antes)
    if (!user) return undefined;

    // Si se solicita una propiedad específica, retornar solo esa
    if (data) return user[data];

    // Retornar el usuario completo
    return user;
  },
);
