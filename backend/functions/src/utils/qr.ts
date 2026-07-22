/**
 * TicketS - Utilidad de Generación de Códigos QR
 *
 * Proporciona funciones para generar y validar códigos QR
 * asociados a los tickets de entrada.
 *
 * El QR codifica un objeto JSON con:
 *   - ticketId: ID del ticket
 *   - qrToken: Token único del ticket
 *   - eventId: ID del evento
 *   - iat: Timestamp de emisión
 *
 * NOTA: Esta implementación es un esqueleto. La generación real
 * de imágenes QR se completa en una fase posterior.
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/**
 * Datos codificados dentro del código QR del ticket.
 */
export interface QrCodeData {
  ticketId: string;
  qrToken: string;
  eventId: string;
  iat: number; // Issued at timestamp
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Genera los datos que se codificarán en el QR.
 * No genera la imagen QR, solo prepara el payload.
 *
 * @param ticketId - ID del ticket.
 * @param qrToken - Token único del ticket.
 * @param eventId - ID del evento.
 * @returns Objeto serializable para codificar en el QR.
 *
 * @example
 * const data = generateQrData('ticket123', 'uuid-abc', 'event789');
 * // QR codifica: { ticketId: 'ticket123', qrToken: 'uuid-abc', eventId: 'event789', iat: 1712345678 }
 */
export function generateQrData(ticketId: string, qrToken: string, eventId: string): QrCodeData {
  return {
    ticketId,
    qrToken,
    eventId,
    iat: Math.floor(Date.now() / 1000),
  };
}

/**
 * Valida que los datos del QR sean correctos y no hayan expirado.
 *
 * @param data - Datos decodificados del QR.
 * @param maxAgeDays - Días máximos de validez desde la emisión (default: 365).
 * @returns true si los datos son válidos.
 *
 * @example
 * const isValid = validateQrData(qrData, 365);
 */
export function validateQrData(data: QrCodeData, maxAgeDays: number = 365): boolean {
  if (!data.ticketId || !data.qrToken || !data.eventId) return false;
  if (!data.iat || data.iat <= 0) return false;

  const now = Math.floor(Date.now() / 1000);
  const maxAgeSeconds = maxAgeDays * 24 * 60 * 60;
  const age = now - data.iat;

  if (age > maxAgeSeconds) return false;
  if (age < 0) return false; // Fecha futura

  return true;
}

/**
 * Genera la URL para la imagen del QR.
 * Útil si se usa un servicio externo de generación de QR.
 *
 * @param data - Datos codificados del QR.
 * @param size - Tamaño del QR en píxeles (default: 300).
 * @returns URL del servicio de generación de QR.
 *
 * @example
 * const url = getQrImageUrl(qrData);
 * // <img src={url} alt="QR Ticket" />
 */
export function getQrImageUrl(data: QrCodeData, size: number = 300): string {
  const payload = JSON.stringify(data);
  const encoded = encodeURIComponent(payload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
}
