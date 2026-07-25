/**
 * TicketS - OrganizationsService
 *
 * Servicio de organizaciones que opera sobre la colección `organizations` de Firestore.
 * Extiende FirestoreRepository para reutilizar operaciones CRUD genéricas.
 */

import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { COLLECTIONS } from '../../constants/collections';
import { FirestoreRepository } from '../../common/firestore/firestore.repository';
import { Timestamps } from '../../common/utils/timestamps';
import { ProfileService } from '../profile/profile.service';
import type { CreateOrganizationDto } from './dto/create-organization.dto';
import type { SetupOrganizationDto } from './dto/setup-organization.dto';
import type { Organization } from './interfaces/organization.interface';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';

@Injectable()
export class OrganizationsService extends FirestoreRepository<Organization> {
  protected collectionName = COLLECTIONS.ORGANIZATIONS;

  constructor(
    firebase: FirebaseAdminService,
    private readonly profileService: ProfileService,
  ) {
    super(firebase);
  }

  /**
   * Crea una nueva organización en Firestore.
   */
  async create(
    dto: CreateOrganizationDto,
    user: CurrentUser,
  ): Promise<Organization> {
    try {
      await this.ensureUnique('slug', dto.slug);

      const organizationData = {
        name: dto.name,
        slug: dto.slug,
        description: dto.description || '',
        logoUrl: dto.logoUrl || '',
        email: dto.email,
        phone: dto.phone || '',
        city: dto.city,
        nit: dto.nit || null,
        ownerId: user.uid,
        status: 'active' as const,
        ...Timestamps.forCreate(),
      };

      const organization = await this.createDoc(organizationData);

      this.logger.log(
        `Organization created: ${organization.id} (slug: ${dto.slug})`,
      );

      return organization;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Error creating organization: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al crear la organización. Intenta nuevamente.',
      );
    }
  }

  /**
   * Obtiene las organizaciones del usuario autenticado.
   */
  async getMyOrganizations(user: CurrentUser): Promise<Organization[]> {
    try {
      return this.findMany((col) =>
        col.where('ownerId', '==', user.uid).orderBy('createdAt', 'desc'),
      );
    } catch (error) {
      this.logger.error(
        `Error fetching organizations for user ${user.uid}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al obtener las organizaciones. Intenta nuevamente.',
      );
    }
  }

  /**
   * Flujo de onboarding: crea la primera organización de un usuario
   * y la asocia automáticamente a su perfil.
   *
   * Flujo:
   *   1. Verificar que el perfil del usuario existe.
   *   2. Validar que el usuario NO tenga ya una organización asociada.
   *   3. Crear la organización con ownerId = user.uid.
   *   4. Actualizar el perfil con el organizationId de la nueva org.
   *
   * @param uid - UID del usuario autenticado.
   * @param dto - Datos de la organización a crear.
   * @returns La organización creada.
   *
   * @throws NotFoundException si el perfil del usuario no existe.
   * @throws ConflictException si el usuario ya tiene una organización.
   */
  async setupMyOrganization(
    uid: string,
    dto: SetupOrganizationDto,
  ): Promise<Organization> {
    // 1. Verificar que el perfil existe y no tiene organización
    const profile = await this.profileService.findByIdOrFail(uid);

    if (profile.organizationId) {
      throw new ConflictException(
        'El usuario ya tiene una organización asociada.',
      );
    }

    // 2. Validar slug único
    await this.ensureUnique('slug', dto.slug);

    try {
      // 3. Crear la organización
      const organizationData: Record<string, unknown> = {
        name: dto.name,
        slug: dto.slug,
        description: dto.description || '',
        logoUrl: dto.imageUrl || '',
        email: '',
        phone: '',
        city: '',
        nit: null,
        ownerId: uid,
        status: 'active',
        ...Timestamps.forCreate(),
      };

      const organization = await this.createDoc(organizationData);

      // 4. Actualizar el perfil con el organizationId
      await this.profileService.setOrganizationId(uid, organization.id);

      this.logger.log(
        `Organization setup complete: ${organization.id} for user ${uid}`,
      );

      return organization;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Error setting up organization: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'Error al configurar la organización. Intenta nuevamente.',
      );
    }
  }
}
