/**
 * TicketS - Cloud Function: Webhooks
 *
 * Maneja los webhooks entrantes de las pasarelas de pago.
 * Cada proveedor tiene un endpoint específico.
 *
 * Flujo de un webhook exitoso:
 *   1. Recibe el payload del webhook.
 *   2. Verifica la firma del webhook.
 *   3. Normaliza el payload.
 *   4. Actualiza el estado de la compra.
 *   5. Si el pago fue exitoso:
 *      a. Actualiza stock de TicketTypes.
 *      b. Registra el pago en la colección payments.
 *      c. Genera los tickets automáticamente.
 *      d. Envía notificación al usuario.
 *
 * @see docs/ARCHITECTURE.md para el flujo completo.
 */

import * as functions from 'firebase-functions';
import express, { type Request, type Response } from 'express';

// ---------------------------------------------------------------------------
// Express router para webhooks
// ---------------------------------------------------------------------------

const app = express();

/**
 * Webhook genérico para recibir notificaciones de todas las pasarelas.
 *
 * Cada proveedor se registra en una ruta específica:
 *   POST /webhooks/bold       → Webhooks de Bold
 *   POST /webhooks/mercadopago → Webhooks de MercadoPago
 *   POST /webhooks/stripe     → Webhooks de Stripe
 */
app.post('/:provider', async (req: Request, res: Response) => {
  const { provider } = req.params;

  try {
    // TODO: Implementar procesamiento completo de webhooks:
    // 1. Obtener la configuración del proveedor
    // 2. Obtener la instancia del gateway
    // 3. Procesar el webhook (verificar firma + normalizar)
    // 4. Actualizar estado de la compra
    // 5. Si es pago exitoso:
    //    a. Actualizar stock
    //    b. Registrar pago
    //    c. Generar tickets
    //    d. Enviar notificación

    res.status(200).json({ received: true });
  } catch (error) {
    functions.logger.error(`Error procesando webhook de ${provider}:`, error);
    res.status(500).json({ error: 'Error interno procesando webhook.' });
  }
});

// ---------------------------------------------------------------------------
// Exportar como Cloud Function
// ---------------------------------------------------------------------------

/**
 * Maneja todos los webhooks de pasarelas de pago.
 *
 * Endpoints:
 *   POST /webhooks/bold
 *   POST /webhooks/mercadopago
 *   POST /webhooks/stripe
 */
export const webhooks = functions.https.onRequest(app);
