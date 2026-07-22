/**
 * TicketS - FirebaseAuthGuard
 *
 * Guard de autenticación que valida tokens JWT de Firebase Auth
 * y enriquece request.user con el perfil de Firestore.
 *
 * Flujo:
 *   1. Extrae el token del header Authorization: Bearer <token>
 *   2. Verifica el token usando Firebase Admin (auth.verifyIdToken)
 *   3. Obtiene el usuario completo desde Firebase Auth (auth.getUser)
 *   4. Consulta el perfil del usuario en Firestore (colección `users`)
 *   5. Fusiona ambos orígenes y coloca CurrentUser en request.user
 *
 * @example
 * // Proteger un controlador completo
 * @UseGuards(FirebaseAuthGuard)
 * @Controller('events')
 * export class EventsController { ... }
 *
 * // Proteger un endpoint específico
 * @Get('profile')
 * @UseGuards(FirebaseAuthGuard)
 * getProfile(@CurrentUser() user: CurrentUser) { ... }
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseAdminService } from '../../../firebase/firebase.service';
import { COLLECTIONS } from '../../../constants/collections';
import type { CurrentUser } from '../interfaces/current-user.interface';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(private readonly firebase: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // ---------------------------------------------------------------------------
    // 1. Extraer token del header
    // ---------------------------------------------------------------------------
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException(
        'Token de autenticación no proporcionado.',
      );
    }

    try {
      // ---------------------------------------------------------------------------
      // 2. Verificar token con Firebase Admin
      // ---------------------------------------------------------------------------
      const decodedToken = await this.firebase.auth.verifyIdToken(token);

      // ---------------------------------------------------------------------------
      // 3. Obtener información completa del usuario
      // ---------------------------------------------------------------------------
      const userRecord = await this.firebase.auth.getUser(decodedToken.uid);

      // ---------------------------------------------------------------------------
      // 4. Consultar perfil en Firestore
      // ---------------------------------------------------------------------------
      let firestoreProfile: Record<string, unknown> = {};
      try {
        const profileSnap = await this.firebase.db
          .collection(COLLECTIONS.USERS)
          .doc(decodedToken.uid)
          .get();

        if (profileSnap.exists) {
          firestoreProfile = profileSnap.data() as Record<string, unknown>;
        } else {
          this.logger.warn(`Firestore profile not found for uid: ${decodedToken.uid}`);
        }
      } catch (profileError) {
        this.logger.warn(`Error fetching Firestore profile: ${(profileError as Error).message}`);
        // No bloquear la autenticación si Firestore falla
      }

      // ---------------------------------------------------------------------------
      // 5. Fusionar token + Firestore y construir CurrentUser
      // ---------------------------------------------------------------------------
      const currentUser: CurrentUser = {
        // Token
        uid: userRecord.uid,
        email: userRecord.email || '',
        emailVerified: userRecord.emailVerified,
        customClaims: decodedToken.claims || {},
        phoneNumber: userRecord.phoneNumber || '',
        disabled: userRecord.disabled,
        provider: decodedToken.firebase?.sign_in_provider || 'unknown',
        createdAt: userRecord.metadata.creationTime || '',
        lastSignInAt: userRecord.metadata.lastSignInTime || '',

        // Firestore (con fallback a valores del token o defaults)
        displayName: (firestoreProfile.displayName as string) || userRecord.displayName || '',
        photoURL: (firestoreProfile.photoURL as string) || userRecord.photoURL || '',
        role: (firestoreProfile.role as CurrentUser['role']) || 'cliente',
        status: (firestoreProfile.status as CurrentUser['status']) || 'active',
        organizationId: (firestoreProfile.organizationId as string) || '',
        city: (firestoreProfile.city as string) || '',
      };

      (request as unknown as Record<string, unknown>).user = currentUser;

      return true;
    } catch (error) {
      // Si el error ya es UnauthorizedException, relanzarlo
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.warn(`Token verification failed: ${(error as Error).message}`);
      throw new UnauthorizedException(
        'Token de autenticación inválido o expirado.',
      );
    }
  }

  /**
   * Extrae el token Bearer del header Authorization.
   *
   * @param request - Request de Express.
   * @returns El token JWT o null si no está presente.
   */
  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) return null;

    return token;
  }
}
