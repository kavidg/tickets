/**
 * TicketS - DashboardService
 *
 * Servicio de analytics y métricas para organizadores.
 * Calcula estadísticas agregadas a partir de múltiples colecciones de Firestore.
 *
 * No tiene colección propia — extiende FirestoreRepository solo para
 * reutilizar los métodos de consulta cross-collection (findRawInCollection,
 * getRawDoc) sin exponer this.firebase.db directamente.
 *
 * Índices compuestos requeridos en Firestore:
 *   - events: organizationId ASC
 *   - ticketTypes: organizationId ASC
 *   - purchases: organizationId ASC, status ASC
 *   - checkIns: organizationId ASC, createdAt DESC
 *   - checkIns: organizationId ASC, result ASC
 *
 * @see DashboardSummary para el resumen general.
 * @see EventAnalytics para analytics por evento.
 * @see SalesAnalytics para analytics de ventas.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase.service';
import { COLLECTIONS } from '../../constants/collections';
import { FirestoreRepository, type FirestoreEntity } from '../../common/firestore/firestore.repository';
import type {
  DashboardSummary,
  EventAnalytics,
  SalesAnalytics,
} from './interfaces/dashboard.interface';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';

@Injectable()
export class DashboardService extends FirestoreRepository<FirestoreEntity> {
  protected collectionName = COLLECTIONS.ORGANIZATIONS;

  constructor(firebase: FirebaseAdminService) {
    super(firebase);
  }

  /**
   * Obtiene el resumen general del dashboard de una organización.
   *
   * Calcula:
   *   - totalEvents:   eventos de la organización
   *   - totalTickets:  suma de quantity de todos los ticket types
   *   - soldTickets:   suma de soldQuantity de todos los ticket types
   *   - usedTickets:   check-ins exitosos de la organización
   *   - pendingPurchases: compras en estado pending
   *   - totalRevenue:  suma de total de compras pagadas
   *
   * @param organizationId - ID de la organización.
   * @param user - Usuario autenticado.
   * @returns DashboardSummary con métricas calculadas.
   *
   * @throws NotFoundException si la organización no existe.
   * @throws ForbiddenException si el usuario no tiene acceso.
   */
  async getOrganizationDashboard(
    organizationId: string,
    user: CurrentUser,
  ): Promise<DashboardSummary> {
    // Validar acceso a la organización
    await this.validateDashboardAccess(organizationId, user);

    // Ejecutar queries en paralelo
    const [events, ticketTypes, paidPurchases, pendingPurchases, checkIns] =
      await Promise.all([
        this.findRawInCollection(COLLECTIONS.EVENTS, (col) =>
          col.where('organizationId', '==', organizationId),
        ),
        this.findRawInCollection(COLLECTIONS.TICKET_TYPES, (col) =>
          col.where('organizationId', '==', organizationId),
        ),
        this.findRawInCollection(COLLECTIONS.PURCHASES, (col) =>
          col.where('organizationId', '==', organizationId).where('status', '==', 'paid'),
        ),
        this.findRawInCollection(COLLECTIONS.PURCHASES, (col) =>
          col.where('organizationId', '==', organizationId).where('status', '==', 'pending'),
        ),
        this.findRawInCollection(COLLECTIONS.CHECKINS, (col) =>
          col.where('organizationId', '==', organizationId).where('result', '==', 'success'),
        ),
      ]);

    // Calcular métricas
    const totalTickets = ticketTypes.reduce(
      (sum, tt) => sum + ((tt.quantity as number) || 0),
      0,
    );
    const soldTickets = ticketTypes.reduce(
      (sum, tt) => sum + ((tt.soldQuantity as number) || 0),
      0,
    );
    const totalRevenue = paidPurchases.reduce(
      (sum, p) => sum + ((p.total as number) || 0),
      0,
    );
    const usedTickets = checkIns.length;

    return {
      organizationId,
      totalEvents: events.length,
      totalTickets,
      soldTickets,
      usedTickets,
      pendingPurchases: pendingPurchases.length,
      totalRevenue,
      currency: 'COP',
    };
  }

  /**
   * Obtiene analytics detallados de un evento específico.
   *
   * @param eventId - ID del evento.
   * @param user - Usuario autenticado.
   * @returns EventAnalytics con métricas del evento.
   *
   * @throws NotFoundException si el evento no existe.
   * @throws ForbiddenException si el usuario no tiene acceso.
   */
  async getEventAnalytics(
    eventId: string,
    user: CurrentUser,
  ): Promise<EventAnalytics> {
    // Validar que el evento existe
    const eventData = await this.getRawDoc(COLLECTIONS.EVENTS, eventId);
    if (!eventData) {
      throw new NotFoundException('El evento no existe.');
    }

    // Validar acceso a la organización del evento
    const organizationId = eventData.organizationId as string;
    await this.validateDashboardAccess(organizationId, user);

    // Ejecutar queries en paralelo
    const [ticketTypes, paidPurchases, checkIns] = await Promise.all([
      this.findRawInCollection(COLLECTIONS.TICKET_TYPES, (col) =>
        col.where('eventId', '==', eventId),
      ),
      this.findRawInCollection(COLLECTIONS.PURCHASES, (col) =>
        col.where('eventId', '==', eventId).where('status', '==', 'paid'),
      ),
      this.findRawInCollection(COLLECTIONS.CHECKINS, (col) =>
        col
          .where('eventId', '==', eventId)
          .where('result', '==', 'success'),
      ),
    ]);

    // Calcular métricas
    const totalTickets = ticketTypes.reduce(
      (sum, tt) => sum + ((tt.quantity as number) || 0),
      0,
    );
    const soldTickets = ticketTypes.reduce(
      (sum, tt) => sum + ((tt.soldQuantity as number) || 0),
      0,
    );
    const revenue = paidPurchases.reduce(
      (sum, p) => sum + ((p.total as number) || 0),
      0,
    );

    return {
      eventId,
      title: eventData.title as string,
      status: eventData.status as string,
      totalTickets,
      soldTickets,
      availableTickets: totalTickets - soldTickets,
      revenue,
      checkIns: checkIns.length,
    };
  }

  /**
   * Obtiene analytics de ventas globales de una organización.
   *
   * @param organizationId - ID de la organización.
   * @param user - Usuario autenticado.
   * @returns SalesAnalytics con métricas de ventas.
   *
   * @throws NotFoundException si la organización no existe.
   * @throws ForbiddenException si el usuario no tiene acceso.
   */
  async getSalesAnalytics(
    organizationId: string,
    user: CurrentUser,
  ): Promise<SalesAnalytics> {
    // Validar acceso a la organización
    await this.validateDashboardAccess(organizationId, user);

    // Ejecutar queries en paralelo
    const [allPurchases, paidPurchases] = await Promise.all([
      this.findRawInCollection(COLLECTIONS.PURCHASES, (col) =>
        col.where('organizationId', '==', organizationId),
      ),
      this.findRawInCollection(COLLECTIONS.PURCHASES, (col) =>
        col.where('organizationId', '==', organizationId).where('status', '==', 'paid'),
      ),
    ]);

    // Calcular métricas
    const totalSales = paidPurchases.length;
    const totalRevenue = paidPurchases.reduce(
      (sum, p) => sum + ((p.total as number) || 0),
      0,
    );
    const averageTicketValue = totalSales > 0
      ? Math.round(totalRevenue / totalSales)
      : 0;
    const conversionRate = allPurchases.length > 0
      ? Math.round((totalSales / allPurchases.length) * 100)
      : 0;

    return {
      totalSales,
      totalRevenue,
      averageTicketValue,
      conversionRate,
    };
  }

  // ---------------------------------------------------------------------------
  // Validación de acceso
  // ---------------------------------------------------------------------------

  /**
   * Valida que el usuario tenga acceso al dashboard de la organización.
   *
   * Acceso permitido para:
   *   - Owner de la organización.
   *   - (Futuro) Usuarios con rol admin o staff.
   *
   * @param organizationId - ID de la organización.
   * @param user - Usuario autenticado.
   *
   * @throws NotFoundException si la organización no existe.
   * @throws ForbiddenException si el usuario no tiene acceso.
   */
  private async validateDashboardAccess(
    organizationId: string,
    user: CurrentUser,
  ): Promise<void> {
    const orgData = await this.getRawDoc(
      COLLECTIONS.ORGANIZATIONS,
      organizationId,
    );

    if (!orgData) {
      throw new NotFoundException('La organización no existe.');
    }

    if (orgData.ownerId !== user.uid) {
      // TODO: Validar por rol (admin / staff) cuando estén implementados
      throw new ForbiddenException(
        'No tienes permiso para ver el dashboard de esta organización.',
      );
    }
  }
}
