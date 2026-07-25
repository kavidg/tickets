/**
 * TicketS - Constantes de Rutas
 *
 * Define las rutas de la aplicación organizadas por módulo.
 * Rutas absolutas para BrowserRouter (sin hash).
 */

export const ROUTES = {
  // -----------------------------------------------------------------------
  // Rutas públicas
  // -----------------------------------------------------------------------
  HOME: '/',
  EVENTS_SECTION: '/events',
  HOW_IT_WORKS: '/how-it-works',
  EVENT_DETAIL: (id: string) => `/event/${encodeURIComponent(id)}`,
  CHECKOUT: '/checkout',
  PURCHASE_SUCCESS: '/purchase/success',
  TICKETS_SEARCH: '/tickets/search',

  // -----------------------------------------------------------------------
  // Rutas de autenticación (públicas)
  // -----------------------------------------------------------------------
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // -----------------------------------------------------------------------
  // Rutas de cliente (protegidas)
  // -----------------------------------------------------------------------
  MY_TICKETS: '/my-tickets',
  MY_PROFILE: '/my-profile',
  MY_ORDERS: '/my-orders',

  // -----------------------------------------------------------------------
  // Rutas de organizador (protegidas)
  // -----------------------------------------------------------------------
  ORG_DASHBOARD: '/organizer/dashboard',
  ORG_EVENTS: '/organizer/events',
  ORG_EVENTS_CREATE: '/organizer/events/create',
  ORG_VENUES: '/organizer/venues',
  ORG_SETTINGS: '/organizer/settings',
  ORG_SETUP: '/organization/setup',

  // -----------------------------------------------------------------------
  // Rutas de administrador (protegidas)
  // -----------------------------------------------------------------------
  ADMIN_PANEL: '/admin',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

/**
 * Prefijos para identificar grupos de rutas por el inicio del path.
 */
export const ROUTE_PREFIXES = {
  AUTH: '/login',
  CLIENT: '/my-',
  ORGANIZER: '/organizer/',
  ADMIN: '/admin',
} as const;
