/**
 * TicketS - TicketCode Utility
 *
 * Generador de códigos únicos para tickets digitales.
 *
 * Formato: TCK-{RANDOM}-{TIMESTAMP}
 *   - TCK: Prefijo fijo que identifica el tipo de código.
 *   - RANDOM: 6 caracteres alfanuméricos aleatorios (A-Z, 0-9).
 *   - TIMESTAMP: Unix timestamp en milisegundos.
 *
 * Ejemplo: TCK-8X92KD-1720000001234
 *
 * El timestamp garantiza unicidad incluso si dos tickets se generan
 * en el mismo milisegundo, ya que el random de 6 caracteres (36^6 ≈ 2B)
 * ofrece suficiente entropía para evitar colisiones.
 */

/**
 * Caracteres permitidos para la parte aleatoria del código.
 */
const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Longitud de la parte aleatoria del código.
 */
const RANDOM_LENGTH = 6;

/**
 * Utilidad para generar códigos únicos de tickets.
 */
export const TicketCode = {
  /**
   * Genera un código único para un ticket digital.
   *
   * @returns Código en formato TCK-XXXXXXXXXX-XXXXXXXXXX.
   */
  generate(): string {
    const random = this.generateRandom();
    const timestamp = Date.now();
    return `TCK-${random}-${timestamp}`;
  },

  /**
   * Genera una cadena aleatoria de caracteres alfanuméricos.
   */
  generateRandom(): string {
    let result = '';
    for (let i = 0; i < RANDOM_LENGTH; i++) {
      result += RANDOM_CHARS.charAt(Math.floor(Math.random() * RANDOM_CHARS.length));
    }
    return result;
  },
};
