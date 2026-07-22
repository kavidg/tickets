/**
 * TicketS - PaymentProvider Interface
 *
 * Interfaz abstracta que deben implementar todos los proveedores de pago.
 * Permite desacoplar la lógica de checkout de la pasarela específica,
 * facilitando el cambio entre Bold, MercadoPago, Stripe, etc.
 *
 * Cada provider debe implementar:
 *   createCheckout(purchase): Promise<PaymentCheckoutResult>
 *
 * El flujo esperado:
 *   CheckoutService → PaymentFactory → Provider.createCheckout() → URL de pago
 */

/**
 * Datos de la compra que el provider necesita para crear un checkout.
 */
export interface PurchaseCheckoutData {
  /** ID único de la compra */
  purchaseId: string;
  /** Total a pagar */
  total: number;
  /** Código de moneda (ej: COP, USD) */
  currency: string;
  /** Descripción de los items para mostrar en la pasarela */
  description: string;
  /** Nombre del comprador */
  customerName?: string;
  /** Email del comprador */
  customerEmail?: string;
}

/**
 * Resultado estandarizado del checkout, independiente de la pasarela.
 */
export interface PaymentCheckoutResult {
  /** Referencia única del pago en la pasarela */
  paymentReference: string;
  /** URL a la que el usuario debe ser redirigido para pagar */
  paymentUrl: string;
  /** Nombre del proveedor (bold, mercadopago, stripe, etc.) */
  provider: string;
  /** Fecha de expiración de la sesión de pago */
  expiresAt: Date;
  /** Estado inicial del pago en la pasarela */
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Interfaz que todo proveedor de pago debe implementar.
 */
export interface PaymentProvider {
  /**
   * Nombre único del proveedor (ej: 'bold', 'mercadopago', 'stripe').
   */
  readonly name: string;

  /**
   * Crea una sesión de checkout en la pasarela de pagos.
   *
   * @param data - Datos de la compra necesarios para crear el checkout.
   * @returns Resultado estandarizado del checkout.
   */
  createCheckout(data: PurchaseCheckoutData): Promise<PaymentCheckoutResult>;
}
