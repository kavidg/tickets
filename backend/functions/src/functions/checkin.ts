/**
 * TicketS - Cloud Function: Check-in
 *
 * Funciones para la validación de tickets en el punto de entrada del evento.
 *
 * Flujo de check-in:
 *   1. El organizador escanea el QR del ticket.
 *   2. La función valida el qrToken contra Firestore.
 *   3. Si el ticket es válido y está activo, lo marca como "used".
 *   4. Retorna los datos del ticket y del asistente.
 *
 * @see docs/ARCHITECTURE.md para el flujo completo.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { COLLECTIONS } from '../constants/collections';
import * as ticketService from '../services/ticket.service';
import { validateQrData, type QrCodeData } from '../utils/qr';

/**
 * Valida un código QR de ticket y realiza el check-in.
 *
 * @example
 * // Llamada desde la app del organizador (escáner QR):
 * const result = await firebase.functions().httpsCallable('checkinByQR')({
 *   qrData: '{"ticketId":"...","qrToken":"...","eventId":"...","iat":...}',
 *   eventId: 'event789',
 * });
 */
export const checkinByQR = functions.https.onCall(
  async (data: { qrData: string; eventId: string }, context) => {
    // Validar autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Debes iniciar sesión para realizar check-in.',
      );
    }

    // Validar datos requeridos
    if (!data.qrData || !data.eventId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Faltan datos requeridos: qrData, eventId.',
      );
    }

    try {
      // Decodificar datos del QR
      let qrCodeData: QrCodeData;
      try {
        qrCodeData = JSON.parse(data.qrData) as QrCodeData;
      } catch {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'El formato del QR no es válido.',
        );
      }

      // Validar integridad de los datos del QR
      if (!validateQrData(qrCodeData)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'El código QR ha expirado o es inválido.',
        );
      }

      // Verificar que el QR corresponde al evento
      if (qrCodeData.eventId !== data.eventId) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Este ticket no corresponde al evento actual.',
        );
      }

      // Buscar el ticket por qrToken
      const ticket = await ticketService.validateQrToken(qrCodeData.qrToken);

      if (!ticket) {
        throw new functions.https.HttpsError(
          'not-found',
          'Ticket no encontrado. Verifica que el código QR sea válido.',
        );
      }

      // Validar estado del ticket
      if (ticket.status === 'used') {
        throw new functions.https.HttpsError(
          'already-exists',
          'Este ticket ya fue utilizado. Ingreso denegado.',
        );
      }

      if (ticket.status === 'cancelled') {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Este ticket ha sido cancelado. Ingreso denegado.',
        );
      }

      // Realizar check-in
      await ticketService.checkInTicket(ticket.id, context.auth.uid);

      // TODO: Registrar check-in en colección checkins
      // await db.collection(COLLECTIONS.CHECKINS).add({ ... });

      return {
        success: true,
        ticket: {
          id: ticket.id,
          ticketTypeName: ticket.ticketTypeName,
          attendeeName: ticket.attendeeName,
          attendeeEmail: ticket.attendeeEmail,
          status: 'used',
        },
        message: '¡Check-in exitoso! Bienvenido al evento.',
      };
    } catch (error) {
      // Si ya es un HttpsError, relanzarlo
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        'Error procesando el check-in. Intenta nuevamente.',
      );
    }
  },
);

/**
 * Obtiene todos los tickets de un evento para el organizador.
 *
 * @example
 * const result = await firebase.functions().httpsCallable('getEventTickets')({
 *   eventId: 'event789',
 * });
 */
export const getEventTickets = functions.https.onCall(
  async (data: { eventId: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión.');
    }

    if (!data.eventId) {
      throw new functions.https.HttpsError('invalid-argument', 'eventId es requerido.');
    }

    try {
      const snapshot = await admin
        .firestore()
        .collection(COLLECTIONS.TICKETS)
        .where('eventId', '==', data.eventId)
        .orderBy('createdAt', 'asc')
        .get();

      const tickets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        tickets,
        total: tickets.length,
      };
    } catch (error) {
      throw new functions.https.HttpsError(
        'internal',
        'Error obteniendo tickets del evento.',
      );
    }
  },
);
