/**
 * TicketS - Checkout Response Interface
 *
 * Define la estructura de la respuesta del endpoint POST /api/v1/checkout.
 *
 * Además de los datos de la compra, incluye la Integrity Signature
 * necesaria para el Botón de Pagos de Bold:
 *   - signature: Firma SHA-256 generada con la llave secreta
 *   - publicKey: Llave pública para que el frontend inicialice Bold SDK
 *
 * @see BoldIntegrityService para el algoritmo de firma.
 */

export interface CheckoutResponse {
  /** ID de la compra asociada */
  purchaseId: string;
  /** Referencia única generada para esta compra */
  reference: string;
  /** Monto total de la compra en la unidad más pequeña de la moneda */
  amount: number;
  /** Moneda (COP, USD, etc.) */
  currency: string;
  /** Integrity Signature SHA-256 para el Botón de Pagos de Bold */
  signature: string;
  /** Llave pública de Bold para inicializar el SDK en el frontend */
  publicKey: string;
}
