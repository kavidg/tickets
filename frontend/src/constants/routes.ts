/**
 * TicketS - Constantes de Rutas
 *
 * Define las rutas de la aplicación organizadas por módulo.
 * Todas las rutas usan el formato hash (#/) para compatibilidad
 * con el sistema de enrutamiento actual.
 */

export const ROUTES = {
  // -----------------------------------------------------------------------
  // Rutas públicas
  // -----------------------------------------------------------------------
  HOME: '#/',
  EVENTS_SECTION: '#events',
  HOW_IT_WORKS: '#/how-it-works',
  EVENT_DETAIL: (id: string) => `#/event/${encodeURIComponent(id)}`,

  // -----------------------------------------------------------------------
  // Rutas de autenticación (públicas)
  // -----------------------------------------------------------------------
  LOGIN: '#/login',
  REGISTER: '#/register',
  FORGOT_PASSWORD: '#/forgot-password',

  // -----------------------------------------------------------------------
  // Rutas de cliente (protegidas)
  // -----------------------------------------------------------------------
  MY_TICKETS: '#/my-tickets',
  MY_PROFILE: '#/my-profile',
  MY_ORDERS: '#/my-orders',

  // -----------------------------------------------------------------------
  // Rutas de organizador (protegidas, futuro: role-based)
  // -----------------------------------------------------------------------
  ORG_DASHBOARD: '#/organizer/dashboard',
  ORG_EVENTS: '#/organizer/events',
  ORG_SETTINGS: '#/organizer/settings',

  // -----------------------------------------------------------------------
  // Rutas de administrador (protegidas, futuro: role-based)
  // -----------------------------------------------------------------------
  ADMIN_PANEL: '#/admin',
  ADMIN_USERS: '#/admin/users',
  ADMIN_SETTINGS: '#/admin/settings',
} as const;

/**
 * Prefijos para identificar grupos de rutas por el inicio del hash.
 */
export const ROUTE_PREFIXES = {
  AUTH: '#/login',
  CLIENT: '#/my-',
  ORGANIZER: '#/organizer/',
  ADMIN: '#/admin',
} as const;
