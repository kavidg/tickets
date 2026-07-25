/**
 * TicketS - ConfigModule
 *
 * Módulo de configuración global de NestJS.
 * Carga y valida las variables de entorno utilizando @nestjs/config.
 *
 * @example
 * // Uso en servicios:
 * constructor(private configService: ConfigService) {}
 * const port = this.configService.get<number>('PORT');
 */

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

// ---------------------------------------------------------------------------
// Configuración por entorno
// ---------------------------------------------------------------------------

/**
 * Configuración de la aplicación agrupada por área.
 * Se fusiona con las variables de entorno cargadas desde .env
 */
const appConfig = () => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  bold: {
    publicKey: process.env.BOLD_PUBLIC_KEY || '',
    secretKey: process.env.BOLD_SECRET_KEY || '',
  },
});

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,           // Disponible en todos los módulos sin reimportar
      load: [appConfig],        // Carga configuración estructurada
      validationOptions: {
        allowUnknown: true,     // Permite variables adicionales
        abortEarly: false,      // Reporta todos los errores de validación
      },
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
