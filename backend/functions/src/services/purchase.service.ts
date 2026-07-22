/**
 * TicketS - Servicio de Compras (Backend)
 *
 * Capa de servicios del backend para operaciones de compras.
 * Se diferencia del frontend service porque opera con Firebase Admin SDK
 * y puede realizar operaciones que requieren privilegios elevados.
 *
 * Responsabilidades exclusivas del backend:
 *   - Validar disponibilidad de entradas antes de confirmar.
 *   - Actualizar stock (soldQuantity) en TicketTypes.
 *   - Manejar transiciones de estado complejas.
 *   - Registrar pagos en la colección payments.
 */

import * as admin from 'firebase-admin';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import type { Purchase, PurchaseStatus } from '../types/purchase';
import type { PaymentResult } from '../types/payment';

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Obtiene una compra por su ID.
 */
export async function getPurchaseById(purchaseId: string): Promise<Purchase | null> {
  const docSnap = await db.collection(COLLECTIONS.PURCHASES).doc(purchaseId).get();
  return docSnap.exists ? ({ id: docSnap.id, ...docSnap.data() } as Purchase) : null;
}

/**
 * Actualiza el estado de una compra.
 * Utilizado después de procesar un pago exitoso o fallido.
 */
export async function updatePurchaseStatus(
  purchaseId: string,
  status: PurchaseStatus,
  extraData?: Record<string, unknown>,
): Promise<void> {
  const updateData = {
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    ...extraData,
  };

  await db.collection(COLLECTIONS.PURCHASES).doc(purchaseId).update(updateData);
}

/**
 * Actualiza el stock de los tipos de entrada después de una compra.
 * Incrementa soldQuantity en cada TicketType.
 */
export async function updateTicketTypesStock(
  items: Array<{ ticketTypeId: string; quantity: number }>,
): Promise<void> {
  const batch = db.batch();

  for (const item of items) {
    const ref = db.collection(COLLECTIONS.TICKET_TYPES).doc(item.ticketTypeId);
    batch.update(ref, {
      soldQuantity: admin.firestore.FieldValue.increment(item.quantity),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
}

/**
 * Registra el resultado de un pago en la colección payments.
 */
export async function recordPayment(purchaseId: string, result: PaymentResult): Promise<void> {
  const paymentRef = db.collection(COLLECTIONS.PAYMENTS).doc();

  await paymentRef.set({
    id: paymentRef.id,
    purchaseId,
    provider: result.provider,
    transactionId: result.transactionId,
    status: result.status,
    amount: 0, // TODO: obtener del purchase
    currency: 'COP',
    rawResponse: result.raw || {},
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Verifica disponibilidad de stock antes de confirmar una compra.
 * Retorna true si hay suficiente stock para todos los items.
 */
export async function validateStockAvailability(
  items: Array<{ ticketTypeId: string; quantity: number }>,
): Promise<{ available: boolean; errors: string[] }> {
  const errors: string[] = [];

  for (const item of items) {
    const docSnap = await db.collection(COLLECTIONS.TICKET_TYPES).doc(item.ticketTypeId).get();

    if (!docSnap.exists) {
      errors.push(`El tipo de entrada ${item.ticketTypeId} no existe.`);
      continue;
    }

    const ticketType = docSnap.data() as { quantity: number; soldQuantity: number; name: string };
    const available = ticketType.quantity - ticketType.soldQuantity;

    if (available < item.quantity) {
      errors.push(
        `Stock insuficiente para "${ticketType.name}": ` +
        `disponibles ${available}, solicitados ${item.quantity}.`,
      );
    }
  }

  return { available: errors.length === 0, errors };
}
