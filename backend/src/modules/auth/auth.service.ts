/**
 * TicketS - AuthService
 *
 * Servicio de autenticación que utiliza Firebase Admin para validar
 * tokens de Firebase Auth y obtener información de usuarios.
 *
 * Este servicio NO maneja login ni registro (eso se hace desde el
 * frontend con Firebase Client SDK). Solo valida tokens y provee
 * información del usuario autenticado.
 */

import { Injectable, Logger } from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import type { CurrentUser } from './interfaces/current-user.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly firebase: FirebaseAdminService) {}

  /**
   * Verifica un token de Firebase Auth y retorna la información
   * del usuario autenticado.
   *
   * @param idToken - Token JWT de Firebase Auth.
   * @returns CurrentUser con los datos del usuario.
   *
   * @throws Error si el token es inválido o el usuario no existe.
   */
  async verifyToken(idToken: string): Promise<CurrentUser> {
    const decodedToken = await this.firebase.auth.verifyIdToken(idToken);

    // Obtener información completa del usuario
    const userRecord = await this.firebase.auth.getUser(decodedToken.uid);

    return {
      uid: userRecord.uid,
      email: userRecord.email || '',
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || '',
      customClaims: decodedToken.claims || {},
      phoneNumber: userRecord.phoneNumber || '',
      disabled: userRecord.disabled,
      createdAt: userRecord.metadata.creationTime || '',
      lastSignInAt: userRecord.metadata.lastSignInTime || '',
      provider: decodedToken.firebase?.sign_in_provider || 'unknown',
    };
  }

  /**
   * Obtiene el perfil del usuario autenticado.
   * Esta información se muestra en GET /auth/me.
   *
   * @param user - Usuario autenticado del request.
   * @returns Perfil público del usuario.
   */
  getProfile(user: CurrentUser) {
    return {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL,
      customClaims: user.customClaims,
    };
  }
}
