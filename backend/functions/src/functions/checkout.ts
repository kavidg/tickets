/**
 * TicketS - Cloud Function: Checkout
 *
 * Inicia el flujo de pago para una compra.
 *
 * Flujo:
 *   1. Recibe el purchaseId y el método de pago seleccionado.
 *   2. Valida que la compra exista y esté en estado "pending".
 *   3. Valida disponibilidad de stock en los TicketTypes.
 *   4. Inicia la transacción con la pasarela de pago seleccionada.
 *   5. Retorna la URL de redirección para que el usuario pague.
 *
 * @see docs/ARCHITECTURE.md para el flujo completo.
 */

import * as functions from 'firebase-functions';
import type { CheckoutRequest } from '../types/purchase';

/**
 * Inicia el proceso de checkout.
 *
 * @example
 * // Llamada desde el frontend:
 * const result = await firebase.functions().httpsCallable('checkout')({
 *   purchaseId: 'abc123',
 *   userId: 'user456',
 *   paymentMethod: 'bold',
 *   returnUrl: 'https://tickets.app/purchase/abc123/confirmation',
 * });
 */
export const checkout = functions.https.onCall(async (data: CheckoutRequest, context) => {
  // Validar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Debes iniciar sesión para realizar una compra.',
    );
  }

  const { purchaseId, userId, paymentMethod, returnUrl } = data;

  // Validar datos requeridos
  if (!purchaseId || !userId || !paymentMethod) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Faltan datos requeridos: purchaseId, userId, paymentMethod.',
    );
  }

  // TODO: Implementar lógica de checkout:
  // 1. Obtener la compra
  // 2. Validar que pertenezca al usuario autenticado
  // 3. Validar que esté en estado "pending"
  // 4. Validar disponibilidad de stock
  // 5. Iniciar pago con la pasarela
  // 6. Actualizar estado de la compra
  // 7. Retornar URL de redirección

  return {
    success: true,
    redirectUrl: `${returnUrl}?purchaseId=${purchaseId}`,
    message: 'Checkout iniciado.',
  };
});

/**
 * Verifica el estado de un pago.
 *
 * @example
 * const result = await firebase.functions().httpsCallable('checkPaymentStatus')({
 *   purchaseId: 'abc123',
 * });
 */
export const checkPaymentStatus = functions.https.onCall(async (data: { purchaseId: string }) => {
  if (!data.purchaseId) {
    throw new functions.https.HttpsError('invalid-argument', 'purchaseId es requerido.');
  }

  // TODO: Consultar estado de la compra y retornarlo
  return {
    success: true,
    purchaseId: data.purchaseId,
    status: 'pending',
  };
});
