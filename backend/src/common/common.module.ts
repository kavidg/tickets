/**
 * TicketS - CommonModule
 *
 * Módulo global que registra los filtros, interceptors y guards
 * compartidos por toda la aplicación.
 *
 * Incluye:
 *   - AllExceptionsFilter: Formato consistente de errores
 *   - ResponseInterceptor: Formato consistente de respuestas exitosas
 *   - RolesGuard: Protección por roles (futura integración con Firebase Auth)
 */

import { Module, Global } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    RolesGuard,
  ],
  exports: [RolesGuard],
})
export class CommonModule {}
