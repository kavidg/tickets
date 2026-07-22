/**
 * TicketS - BoldProvider
 *
 * Proveedor de pago para Bold (pasarela principal).
 *
 * ACTUALMENTE: Implementación mock que simula el flujo real de Bold.
 * Cuando se integre con Bold real, solo este archivo necesitará cambios.
 *
 * Flujo real de Bold:
 *   1. Enviar datos de la transacción a Bold API.
 *   2. Bold devuelve paymentReference, paymentUrl y expiresAt.
 *   3. El usuario es redirigido a paymentUrl para completar el pago.
 *   4. Bold envía un webhook cuando el pago es confirmado.
 *
 * Estructura del mock:
 *   - Genera un paymentReference con formato bold_xxxxx.
 *   - Genera una paymentUrl simulada (no funcional).
 *   - expiresAt = 30 minutos desde ahora.
 *   - status = 'pending'.
 *
 * @see PaymentProvider para la interfaz implementada.
 * @see PaymentFactory para la selección del provider.
 */

import { Injectable } from '@nestjs/common';
import type {
  PaymentProvider,
  PurchaseCheckoutData,
  PaymentCheckoutResult,
} from '../payment-provider.interface';

@Injectable()
export class BoldProvider implements PaymentProvider {
  readonly name = 'bold';

  /**
   * Crea una sesión de checkout simulada en Bold.
   *
   * @param data - Datos de la compra.
   * @returns Resultado del checkout con paymentReference y paymentUrl simulados.
   */
  async createCheckout(data: PurchaseCheckoutData): Promise<PaymentCheckoutResult> {
    // TODO: Reemplazar con llamada real a Bold API
    // when BOLD_API_KEY and BOLD_API_URL are configured
    //
    // const response = await fetch(process.env.BOLD_API_URL + '/checkout', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.BOLD_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     amount: data.total,
    //     currency: data.currency,
    //     reference: data.purchaseId,
    //     description: data.description,
    //     customer_email: data.customerEmail,
    //   }),
    // });
    // const boldResponse = await response.json();
    // return {
    //   paymentReference: boldResponse.reference,
    //   paymentUrl: boldResponse.payment_url,
    //   provider: 'bold',
    //   expiresAt: new Date(boldResponse.expires_at),
    //   status: 'pending',
    // };

    // Mock: simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generar referencia simulada
    const paymentReference = `bold_${data.purchaseId}_${Date.now()}`;

    // URL simulada (no funcional, solo para desarrollo)
    const paymentUrl = `https://checkout.bold.co/pay/${paymentReference}`;

    // Expira en 30 minutos
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    return {
      paymentReference,
      paymentUrl,
      provider: this.name,
      expiresAt,
      status: 'pending',
    };
  }
}
