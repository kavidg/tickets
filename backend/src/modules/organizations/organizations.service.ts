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
import type { CreateOrganizationDto } from './dto/create-organization.dto';
import type { Organization } from './interfaces/organization.interface';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';

@Injectable()
export class OrganizationsService extends FirestoreRepository<Organization> {
  protected collectionName = COLLECTIONS.ORGANIZATIONS;

  constructor(firebase: FirebaseAdminService) {
    super(firebase);
  }

  /**
   * Crea una nueva organización en Firestore.
   *
   * @param dto - Datos de creación validados por CreateOrganizationDto.
   * @param user - Usuario autenticado (CurrentUser).
   * @returns La organización creada.
   *
   * @throws ConflictException si el slug ya está en uso.
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
   *
   * @param user - Usuario autenticado (CurrentUser).
   * @returns Lista de organizaciones donde el usuario es owner.
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
}
