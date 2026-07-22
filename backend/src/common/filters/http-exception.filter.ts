/**
 * TicketS - HTTP Exception Filter
 *
 * Filtro global de excepciones HTTP que asegura que todas las respuestas
 * de error tengan un formato consistente.
 *
 * Formato de error:
 * {
 *   success: false,
 *   statusCode: 400,
 *   message: "Mensaje de error",
 *   error: "Bad Request",
 *   timestamp: "2024-01-01T00:00:00.000Z",
 *   path: "/api/v1/events"
 * }
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let error = 'Internal Server Error';

    // ---------------------------------------------------------------------------
    // HttpException conocidas (incluye BadRequest, NotFound, etc.)
    // ---------------------------------------------------------------------------
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) || exception.message;
        error = (resp.error as string) || exception.name;
      }

      error = exception.name;
    }
    // ---------------------------------------------------------------------------
    // Errores no manejados
    // ---------------------------------------------------------------------------
    else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    const errorResponse = {
      success: false,
      statusCode,
      message: Array.isArray(message) ? message : [message],
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(errorResponse);
  }
}
