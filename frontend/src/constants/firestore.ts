/**
 * TicketS - Constantes de colecciones de Firestore
 *
 * Centraliza todos los nombres de colecciones de Cloud Firestore
 * para evitar strings duplicados en los servicios.
 *
 * Uso:
 *   import { COLLECTIONS } from '../constants/firestore';
 *   collection(db, COLLECTIONS.EVENTS)
 *
 * @see FIRESTORE_RULES.md para las reglas de seguridad de cada colección.
 * @see DATABASE.md para el modelo de datos de cada colección.
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
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
