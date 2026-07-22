/**
 * TicketS - Constantes de colecciones de Firestore (NestJS)
 *
 * Centraliza los nombres de colecciones de Cloud Firestore
 * para uso en los servicios de NestJS.
 *
 * NOTA: Debe mantenerse sincronizado con:
 *   - frontend/src/constants/firestore.ts
 *   - functions/src/constants/collections.ts
 *
 * @see docs/DATABASE.md para el modelo de datos de cada colección.
 */

export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  CATEGORIES: 'categories',
  VENUES: 'venues',
  ORGANIZATIONS: 'organizations',
  ORGANIZER_REQUESTS: 'organizerRequests',
  TICKET_TYPES: 'ticketTypes',
  PURCHASES: 'purchases',
  TICKETS: 'tickets',
  PAYMENTS: 'payments',
  CHECKINS: 'checkins',
  NOTIFICATIONS: 'notifications',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
