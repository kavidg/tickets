/**
 * TicketS - Payment Factory
 *
 * Fábrica de pasarelas de pago.
 * Permite registrar nuevos proveedores y resolverlos dinámicamente.
 *
 * @example
 * const gateway = PaymentFactory.getProvider('bold');
 * const result = await gateway.createPayment(request);
 */

import type { PaymentGateway } from './interfaces/payment-gateway';
import type { PaymentProvider, ProviderConfig } from '../types/payment';
import { BoldGateway } from './providers/bold';

// ---------------------------------------------------------------------------
// Registro de proveedores
// ---------------------------------------------------------------------------

/**
 * Mapa de proveedores registrados.
 * Se extiende agregando nuevas entradas cuando se añade un proveedor.
 */
const registeredProviders: Map<string, new (config: ProviderConfig) => PaymentGateway> = new Map([
  ['bold', BoldGateway],
  // Futuros proveedores:
  // ['mercadopago', MercadoPagoGateway],
  // ['stripe', StripeGateway],
]);

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export class PaymentFactory {
  /**
   * Obtiene una instancia del proveedor de pago solicitado.
   *
   * @param provider - Nombre del proveedor (bold, mercadopago, stripe).
   * @param config - Configuración del proveedor.
   * @returns Instancia del gateway.
   *
   * @throws Error si el proveedor no está registrado.
   *
   * @example
   * const bold = PaymentFactory.getProvider('bold', boldConfig);
   * const result = await bold.createPayment(paymentRequest);
   */
  static getProvider(provider: PaymentProvider, config: ProviderConfig): PaymentGateway {
    const GatewayClass = registeredProviders.get(provider);

    if (!GatewayClass) {
      throw new Error(
        `Proveedor de pago "${provider}" no soportado. ` +
        `Proveedores disponibles: ${Array.from(registeredProviders.keys()).join(', ')}`,
      );
    }

    return new GatewayClass(config);
  }

  /**
   * Obtiene la lista de proveedores registrados.
   *
   * @returns Array de nombres de proveedores disponibles.
   */
  static getAvailableProviders(): string[] {
    return Array.from(registeredProviders.keys());
  }

  /**
   * Verifica si un proveedor está registrado.
   *
   * @param provider - Nombre del proveedor.
   * @returns true si el proveedor está disponible.
   */
  static hasProvider(provider: string): boolean {
    return registeredProviders.has(provider);
  }
}
