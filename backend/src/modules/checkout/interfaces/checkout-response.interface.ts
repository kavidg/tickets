/**
 * TicketS - Checkout Response Interface
 *
 * Define la estructura de la respuesta del endpoint POST /api/v1/checkout.
 * Esta respuesta es lo que el frontend recibe después de iniciar el proceso
 * de pago y contiene los datos necesarios para redirigir al usuario a la
 * pasarela de pagos.
 */

/**
 * Respuesta estandarizada del checkout.
 * El frontend utiliza paymentUrl para redirigir al usuario a la pasarela.
 */
export interface CheckoutResponse {
  /** ID de la compra asociada */
  purchaseId: string;
  /** Referencia única del pago en la pasarela */
  paymentReference: string;
  /** URL de pago de la pasarela (redirigir al usuario aquí) */
  paymentUrl: string;
  /** Nombre del proveedor de pago (bold, mercadopago, etc.) */
  provider: string;
  /** Fecha de expiración de la sesión de pago */
  expiresAt: Date;
}
