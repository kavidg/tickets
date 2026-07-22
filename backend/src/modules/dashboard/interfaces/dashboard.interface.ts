/**
 * TicketS - Dashboard Analytics Interfaces
 *
 * Interfaces para las métricas del dashboard del organizador.
 *
 * @see DashboardService para los métodos que calculan estas métricas.
 */

/**
 * Resumen general del dashboard de una organización.
 */
export interface DashboardSummary {
  /** ID de la organización */
  organizationId: string;
  /** Cantidad total de eventos creados */
  totalEvents: number;
  /** Cantidad total de entradas configuradas (suma de ticketTypes.quantity) */
  totalTickets: number;
  /** Cantidad de entradas vendidas (suma de ticketTypes.soldQuantity) */
  soldTickets: number;
  /** Cantidad de entradas usadas (check-ins exitosos) */
  usedTickets: number;
  /** Cantidad de compras pendientes de pago */
  pendingPurchases: number;
  /** Ingresos totales (suma de purchases.total donde status === 'paid') */
  totalRevenue: number;
  /** Moneda de los ingresos */
  currency: string;
}

/**
 * Analytics detallados de un evento específico.
 */
export interface EventAnalytics {
  /** ID del evento */
  eventId: string;
  /** Título del evento */
  title: string;
  /** Estado del evento (draft, published, finished, cancelled) */
  status: string;
  /** Cantidad total de entradas configuradas para el evento */
  totalTickets: number;
  /** Cantidad de entradas vendidas del evento */
  soldTickets: number;
  /** Cantidad de entradas disponibles (total - vendidas) */
  availableTickets: number;
  /** Ingresos generados por el evento */
  revenue: number;
  /** Cantidad de asistentes que ingresaron (check-ins exitosos) */
  checkIns: number;
}

/**
 * Analytics de ventas globales de una organización.
 */
export interface SalesAnalytics {
  /** Cantidad total de compras pagadas */
  totalSales: number;
  /** Ingresos totales */
  totalRevenue: number;
  /** Valor promedio por ticket vendido */
  averageTicketValue: number;
  /** Tasa de conversión (paid / total purchases * 100) */
  conversionRate: number;
}
