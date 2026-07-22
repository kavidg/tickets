/**
 * TicketS - UsersService
 *
 * Servicio de usuarios que consulta la colección `users` de Firestore
 * para obtener perfiles de usuario.
 * Extiende FirestoreRepository para reutilizar operaciones CRUD genéricas.
 *
 * Cada documento usa el UID de Firebase Auth como ID del documento,
 * lo que permite consultas rápidas por UID.
 */

import { Injectable } from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { COLLECTIONS } from '../../constants/collections';
import { FirestoreRepository } from '../../common/firestore/firestore.repository';
import type { UserProfile } from './interfaces/user-profile.interface';

@Injectable()
export class UsersService extends FirestoreRepository<UserProfile> {
  protected collectionName = COLLECTIONS.USERS;

  constructor(firebase: FirebaseAdminService) {
    super(firebase);
  }

  /**
   * Obtiene el perfil completo del usuario desde Firestore.
   *
   * @param uid - UID del usuario (mismo que Firebase Auth).
   * @returns UserProfile completo desde Firestore.
   *
   * @throws NotFoundException si el perfil no existe en Firestore.
   */
  async getUserProfile(uid: string): Promise<UserProfile> {
    return this.findByIdOrFail(uid);
  }
}
