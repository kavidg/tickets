/**
 * TicketS - QR Code Utility
 *
 * Prepara el payload que será codificado en el código QR de cada ticket.
 * Actualmente solo prepara la estructura de datos.
 * La generación visual del QR se implementará en el frontend o mediante
 * una librería como qrcode cuando sea necesaria.
 *
 * @see Ticket para la fuente de datos.
 */

import type { Ticket } from '../../modules/tickets/interfaces/ticket.interface';

/**
 * Payload que se codificará en el QR del ticket.
 * Contiene la información mínima necesaria para validar el ingreso.
 */
export interface QRCodePayload {
  /** ID del ticket en Firestore */
  ticketId: string;
  /** Código único del ticket (TCK-XXXXXX-XXXXXXXXXX) */
  code: string;
  /** ID del evento al que da acceso */
  eventId: string;
}

/**
 * Utilidad para generar datos de código QR.
 */
export const QRCodeData = {
  /**
   * Genera el payload para codificar en el QR de un ticket.
   *
   * @param ticket - Ticket del cual extraer los datos.
   * @returns Payload estructurado para el QR.
   */
  generate(ticket: Ticket): QRCodePayload {
    return {
      ticketId: ticket.id,
      code: ticket.code,
      eventId: ticket.eventId,
    };
  },
};
