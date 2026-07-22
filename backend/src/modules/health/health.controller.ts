/**
 * TicketS - Health Controller
 *
 * Endpoint de salud para verificar que el servidor NestJS
 * está funcionando correctamente.
 *
 * GET /api/v1/health
 *
 * Responde con:
 * {
 *   status: 'ok',
 *   timestamp: '2024-01-01T00:00:00.000Z',
 *   uptime: 12345,
 *   environment: 'development',
 *   firebase: 'connected' | 'disconnected'
 * }
 */

import { Controller, Get, Logger } from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly startTime = Date.now();

  constructor(private readonly firebase: FirebaseAdminService) {}

  @Get()
  async check() {
    let firebaseStatus = 'unknown';

    try {
      // Verificar conectividad con Firestore
      await this.firebase.db.collection('_health_').doc('_check_').get();
      firebaseStatus = 'connected';
    } catch {
      firebaseStatus = 'disconnected';
      this.logger.warn('Firebase health check failed');
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      environment: process.env.NODE_ENV || 'development',
      firebase: firebaseStatus,
    };
  }
}
