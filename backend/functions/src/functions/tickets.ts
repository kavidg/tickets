/**
 * TicketS - Cloud Function: Tickets
 *
 * Funciones para la gestión de tickets en el backend.
 *
 * Incluye:
 *   - generateTicketsFromPurchase: Cloud Function llamable para regenerar tickets.
 *   - onPurchaseCompleted: Trigger de Firestore que genera tickets automáticamente
 *     cuando una compra cambia a estado "paid".
 *
 * @see docs/ARCHITECTURE.md para el flujo completo.
 */

import * as functions from 'firebase-functions';

import { COLLECTIONS } from '../constants/collections';
import * as ticketService from '../services/ticket.service';
import type { GenerateTicketsPayload } from '../types/ticket';

/**
 * Cloud Function llamable para regenerar tickets de una compra manualmente.
 *
 * Útil para casos donde la generación automática falló.
 *
 * @example
 * const result = await firebase.functions().httpsCallable('generateTicketsFromPurchase')({
 *   purchaseId: 'abc123',
 *   eventId: 'event789',
 *   organizationId: 'org456',
 *   userId: 'user123',
 * });
 */
export const generateTicketsFromPurchase = functions.https.onCall(
  async (data: GenerateTicketsPayload, context) => {
    // Validar autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Debes iniciar sesión para generar tickets.',
      );
    }

    // Validar datos requeridos
    if (!data.purchaseId || !data.eventId || !data.organizationId || !data.userId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Faltan datos requeridos: purchaseId, eventId, organizationId, userId.',
      );
    }

    try {
      const tickets = await ticketService.createTicketsFromPurchase(data);

      // TODO: Enviar email con tickets al usuario
      // await notificationService.sendTicketsEmail({ ... });

      return {
        success: true,
        ticketsGenerated: tickets.length,
      };
    } catch (error) {
      throw new functions.https.HttpsError(
        'internal',
        `Error generando tickets: ${(error as Error).message}`,
      );
    }
  },
);

/**
 * Trigger de Firestore que genera tickets automáticamente
 * cuando una compra cambia a estado "paid".
 *
 * @example
 * // Cuando se actualiza purchases/{purchaseId} a status === "paid"
 * // esta función se ejecuta automáticamente.
 */
export const onPurchaseCompleted = functions.firestore
  .document(`${COLLECTIONS.PURCHASES}/{purchaseId}`)
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Solo ejecutar si el estado cambió a "paid"
    if (beforeData.status === afterData.status || afterData.status !== 'paid') {
      return;
    }

    const { purchaseId } = context.params;

    functions.logger.info(`Compra ${purchaseId} completada. Generando tickets...`);

    try {
      const payload: GenerateTicketsPayload = {
        purchaseId,
        eventId: afterData.eventId,
        organizationId: afterData.organizationId,
        userId: afterData.userId,
      };

      const tickets = await ticketService.createTicketsFromPurchase(payload);

      functions.logger.info(
        `Tickets generados para compra ${purchaseId}: ${tickets.length} tickets.`,
      );

      // TODO: Enviar email de confirmación con tickets
      // await notificationService.sendTicketsEmail({ ... });
    } catch (error) {
      functions.logger.error(
        `Error generando tickets para compra ${purchaseId}:`,
        error,
      );
    }
  });
