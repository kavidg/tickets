/**
 * TicketS - Response Interceptor
 *
 * Interceptor global que envuelve todas las respuestas exitosas
 * en un formato consistente utilizando ApiResponse<T>.
 *
 * Formato de respuesta:
 * {
 *   success: true,
 *   data: { ... },
 *   timestamp: "2024-01-01T00:00:00.000Z",
 *   path: "/api/v1/events"
 * }
 *
 * @see ApiResponse para el tipo de respuesta.
 * @see AllExceptionsFilter para el formato de errores.
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import type { ApiResponse } from '../types/api-response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
