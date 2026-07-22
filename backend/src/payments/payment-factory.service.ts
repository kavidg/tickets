/**
 * TicketS - PaymentFactory
 *
 * Fábrica de proveedores de pago.
 * Selecciona el provider adecuado según configuración y delega la
 * creación del checkout.
 *
 * Actualmente soporta:
 *   - bold: BoldProvider (mock, principal)
 *
 * Preparado para:
 *   - mercadopago: MercadoPagoProvider (futuro)
 *   - stripe: StripeProvider (futuro)
 *
 * CheckoutService utiliza esta fábrica para no conocer detalles
 * de la implementación específica de la pasarela.
 *
 * @see PaymentProvider para la interfaz que todos los providers implementan.
 * @see CheckoutService para el consumo de esta fábrica.
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { BoldProvider } from './providers/bold.provider';
import type {
  PaymentProvider,
  PurchaseCheckoutData,
  PaymentCheckoutResult,
} from './payment-provider.interface';

@Injectable()
export class PaymentFactory {
  private readonly logger = new Logger(PaymentFactory.name);

  constructor(private readonly boldProvider: BoldProvider) {}

  /**
   * Crea un checkout utilizando el proveedor especificado.
   *
   * @param data - Datos de la compra necesarios para el checkout.
   * @param providerName - Nombre del proveedor a utilizar (default: 'bold').
   * @returns Resultado estandarizado del checkout.
   */
  async createCheckout(
    data: PurchaseCheckoutData,
    providerName: string = 'bold',
  ): Promise<PaymentCheckoutResult> {
    const provider = this.getProvider(providerName);

    this.logger.log(
      `Creating checkout with provider "${providerName}" for purchase ${data.purchaseId}`,
    );

    return provider.createCheckout(data);
  }

  /**
   * Obtiene el proveedor correspondiente al nombre.
   * Si el proveedor no está soportado, lanza un error.
   *
   * @param providerName - Nombre del proveedor.
   * @returns Instancia del PaymentProvider.
   *
   * @throws Error si el proveedor no está soportado.
   */
  private getProvider(providerName: string): PaymentProvider {
    switch (providerName) {
      case 'bold':
        return this.boldProvider;

      // Futuros providers:
      // case 'mercadopago':
      //   return this.mercadoPagoProvider;
      // case 'stripe':
      //   return this.stripeProvider;

      default:
        throw new BadRequestException(
          `Proveedor de pago no soportado: "${providerName}". ` +
            'Proveedores disponibles: bold.',
        );
    }
  }
}
