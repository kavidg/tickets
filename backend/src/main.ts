/**
 * TicketS - NestJS Application Entry Point
 *
 * Inicializa la aplicación NestJS con:
 *   - Puerto desde variable de entorno (default: 3000)
 *   - Prefijo global /api/v1
 *   - CORS configurado desde variables de entorno
 *   - Validación global de DTOs (class-validator)
 *   - Transformación automática de tipos (class-transformer)
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ---------------------------------------------------------------------------
  // Global prefix
  // ---------------------------------------------------------------------------
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // ---------------------------------------------------------------------------
  // CORS
  // ---------------------------------------------------------------------------
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173'];

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ---------------------------------------------------------------------------
  // Global validation pipe
  // ---------------------------------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Elimina propiedades no decoradas
      forbidNonWhitelisted: true, // Error si se envían propiedades extra
      transform: true,            // Transforma tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ---------------------------------------------------------------------------
  // Start server
  // ---------------------------------------------------------------------------
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 TicketS API running on http://localhost:${port}/${apiPrefix}`);
}

bootstrap();
