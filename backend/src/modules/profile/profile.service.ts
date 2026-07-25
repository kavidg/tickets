/**
 * TicketS - ProfileService
 *
 * Servicio de perfil de usuario que opera sobre la colección `users` de Firestore.
 * Extiende FirestoreRepository para reutilizar operaciones CRUD genéricas.
 *
 * Cada documento usa el UID de Firebase Auth como ID del documento,
 * lo que permite consultas rápidas por UID usando findByIdOrFail.
 *
 * @see Profile para el modelo de datos.
 * @see ProfileController para los endpoints HTTP.
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { COLLECTIONS } from '../../constants/collections';
import { FirestoreRepository } from '../../common/firestore/firestore.repository';
import { Timestamps } from '../../common/utils/timestamps';
import type { Profile, ProfileRole } from './interfaces/profile.interface';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';

@Injectable()
export class ProfileService extends FirestoreRepository<Profile> {
  protected collectionName = COLLECTIONS.USERS;

  constructor(firebase: FirebaseAdminService) {
    super(firebase);
  }

  /**
   * Obtiene el perfil del usuario autenticado.
   *
   * @param user - Usuario autenticado.
   * @returns El perfil del usuario.
   *
   * @throws NotFoundException si el perfil no existe.
   */
  async getMyProfile(user: CurrentUser): Promise<Profile> {
    return this.findByIdOrFail(user.uid);
  }

  /**
   * Crea el perfil inicial para un usuario.
   *
   * @param user - Usuario autenticado.
   * @param data - Datos opcionales del perfil (displayName, role, phone, city, photoURL).
   * @returns El perfil creado.
   *
   * @throws BadRequestException si el perfil ya existe.
   */
  async createProfile(
    user: CurrentUser,
    data?: { displayName?: string; role?: string; phone?: string; city?: string; photoURL?: string },
  ): Promise<Profile> {
    // Verificar que el perfil no exista ya
    const existing = await this.findById(user.uid);
    if (existing) {
      throw new BadRequestException('El perfil ya existe.');
    }

    const profileData: Record<string, unknown> = {
      uid: user.uid,
      email: user.email || '',
      displayName: data?.displayName || user.email?.split('@')[0] || 'Usuario',
      role: (data?.role as ProfileRole) || ('organizer' as ProfileRole),
      phone: data?.phone || null,
      city: data?.city || null,
      photoURL: data?.photoURL || null,
      organizationId: null,
      ...Timestamps.forCreate(),
    };

    // Usar el UID como ID del documento
    await this.collection.doc(user.uid).set(profileData);

    const profile = await this.findByIdOrFail(user.uid);

    this.logger.log(`Profile created for user ${user.uid}`);

    return profile;
  }

  /**
   * Actualiza el perfil del usuario autenticado.
   *
   * Solo permite modificar:
   *   - displayName
   *
   * NO permite modificar:
   *   - uid, email, role, organizationId, createdAt
   *
   * @param user - Usuario autenticado.
   * @param data - Datos a actualizar.
   * @returns El perfil actualizado.
   *
   * @throws NotFoundException si el perfil no existe.
   */
  async updateProfile(
    user: CurrentUser,
    data: { displayName?: string },
  ): Promise<Profile> {
    // Verificar que el perfil existe (lanza NotFoundException si no)
    await this.findByIdOrFail(user.uid);

    const updateData: Record<string, unknown> = {};

    if (data.displayName !== undefined) {
      updateData.displayName = data.displayName;
    }

    return this.updateDoc(user.uid, updateData);
  }

  /**
   * Asigna un organizationId al perfil del usuario.
   *
   * @param uid - UID del usuario.
   * @param organizationId - ID de la organización a asociar.
   */
  async setOrganizationId(uid: string, organizationId: string): Promise<void> {
    await this.collection.doc(uid).update({
      organizationId,
    });

    this.logger.log(`Organization ${organizationId} linked to user ${uid}`);
  }

  /**
   * Obtiene la organización asociada al perfil del usuario autenticado.
   *
   * Flujo:
   *   1. Obtener el perfil del usuario.
   *   2. Obtener organizationId del perfil.
   *   3. Buscar la organización en Firestore.
   *   4. Retornar la organización.
   *
   * @param user - Usuario autenticado.
   * @returns Los datos de la organización asociada.
   *
   * @throws NotFoundException si el perfil no existe o no tiene organización.
   */
  async getMyOrganization(user: CurrentUser): Promise<Record<string, unknown>> {
    const profile = await this.findByIdOrFail(user.uid);

    if (!profile.organizationId) {
      throw new BadRequestException(
        'No tienes una organización asociada a tu perfil.',
      );
    }

    const orgData = await this.getRawDoc(
      COLLECTIONS.ORGANIZATIONS,
      profile.organizationId,
    );

    if (!orgData) {
      throw new BadRequestException(
        'La organización asociada a tu perfil ya no existe.',
      );
    }

    return orgData;
  }
}
