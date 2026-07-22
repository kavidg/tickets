/**
 * TicketS - Timestamps Utility
 *
 * Utilidades centralizadas para manejo de timestamps en Firestore.
 * Evita repetir FieldValue.serverTimestamp() y Timestamp.now()
 * por todo el proyecto.
 *
 * @example
 * import { Timestamps } from '../../common/utils/timestamps';
 *
 * const data = {
 *   ...Timestamps.forCreate(), // { createdAt: serverTimestamp, updatedAt: serverTimestamp }
 *   name: 'Mi evento',
 * };
 */

import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export const Timestamps = {
  /**
   * Valor de servidor para timestamps.
   * Firestore reemplaza este valor con la hora actual del servidor.
   *
   * @returns Un valor FieldValue que Firestore interpreta como timestamp del servidor.
   *
   * @example
   * const data = {
   *   name: 'Evento',
   *   createdAt: Timestamps.serverTimestamp(),
   *   updatedAt: Timestamps.serverTimestamp(),
   * };
   */
  serverTimestamp: () => FieldValue.serverTimestamp(),

  /**
   * Timestamp actual del lado del servidor (Node.js).
   * Útil cuando se necesita un timestamp inmediato (no lazy como serverTimestamp).
   *
   * @returns Un objeto Timestamp con la fecha/hora actual.
   *
   * @example
   * const data = {
   *   name: 'Evento',
   *   expiresAt: Timestamps.now(),
   * };
   */
  now: () => Timestamp.now(),

  /**
   * Convierte un Timestamp de Firestore a un objeto Date de JavaScript.
   *
   * @param timestamp - Timestamp de Firestore a convertir.
   * @returns Objeto Date correspondiente.
   *
   * @example
   * const date = Timestamps.toDate(event.startDate);
   * console.log(date.toISOString());
   */
  toDate: (timestamp: Timestamp): Date => timestamp.toDate(),

  /**
   * Genera un objeto con createdAt y updatedAt para usar en create.
   * Ambos usan serverTimestamp() para que Firestore asigne la hora del servidor.
   *
   * @returns Objeto con createdAt y updatedAt.
   *
   * @example
   * const data = {
   *   name: 'Evento',
   *   ...Timestamps.forCreate(),
   * };
   */
  forCreate: () => ({
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }),

  /**
   * Genera un objeto con updatedAt actualizado para usar en update.
   *
   * @returns Objeto con updatedAt actualizado.
   *
   * @example
   * const updates = {
   *   name: 'Nuevo nombre',
   *   ...Timestamps.forUpdate(),
   * };
   */
  forUpdate: () => ({
    updatedAt: FieldValue.serverTimestamp(),
  }),
} as const;
