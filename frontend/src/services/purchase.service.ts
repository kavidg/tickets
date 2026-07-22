/**
 * TicketS - Servicio de Compras (Purchases)
 *
 * Capa de servicios que encapsula toda la comunicación con Firestore
 * para la gestión de compras de entradas.
 *
 * Colección: `purchases`
 *
 * Flujo de compra:
 *   1. createPurchase() → Crea la orden con status "pending"
 *   2. Integración con pasarela de pagos (futuro)
 *   3. updatePurchaseStatus() → Actualiza a "paid" tras pago exitoso
 *   4. Generación de tickets (futuro, por cada item/quantity)
 *
 * Validaciones:
 *   - userId es requerido.
 *   - eventId es requerido.
 *   - items no puede estar vacío.
 *   - total debe ser >= 0.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  type Timestamp,
} from 'firebase/firestore';

import db from '../firebase/firestore';
import { COLLECTIONS } from '../constants/firestore';
import type {
  Purchase,
  PurchaseItem,
  CreatePurchaseData,
  UpdatePurchaseData,
  CreatePurchaseItem,
} from '../types/purchase';
import type { EventResponse } from '../types/event';

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function handlePurchaseError<T>(error: unknown): EventResponse<T> {
  const firestoreError = error as { code?: string; message?: string };
  const code = firestoreError?.code || 'purchases/unknown';

  return {
    success: false,
    error: firestoreError?.message || 'Error al procesar la compra.',
    code,
  } as EventResponse<T>;
}

/**
 * Calcula el subtotal de un item (unitPrice × quantity).
 *
 * @param item - Item sin subtotal (puede venir opcional desde el frontend).
 * @returns Item con subtotal calculado.
 */
function calculateItemSubtotal(item: CreatePurchaseItem): PurchaseItem {
  return {
    ticketTypeId: item.ticketTypeId,
    ticketName: item.ticketName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.unitPrice * item.quantity,
  };
}

/**
 * Valida los datos requeridos para crear una compra.
 */
function validatePurchaseData(data: CreatePurchaseData): string | null {
  if (!data.userId?.trim()) return 'El usuario es requerido.';
  if (!data.eventId?.trim()) return 'El evento es requerido.';
  if (!data.organizationId?.trim()) return 'La organización es requerida.';
  if (!data.items || data.items.length === 0) return 'La compra debe tener al menos un item.';
  if (data.total < 0) return 'El total debe ser mayor o igual a 0.';
  if (data.subtotal < 0) return 'El subtotal debe ser mayor o igual a 0.';

  for (const item of data.items) {
    if (!item.ticketTypeId?.trim()) return 'Cada item debe tener un tipo de entrada válido.';
    if (item.quantity <= 0) return 'La cantidad de cada item debe ser mayor a 0.';
    if (item.unitPrice < 0) return 'El precio unitario debe ser mayor o igual a 0.';
  }

  return null;
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Crea una nueva compra con estado "pending".
 *
 * Calcula automáticamente los subtotales de cada item si no fueron provistos,
 * y guarda el registro en Firestore.
 *
 * @param data - Datos de la compra.
 * @returns La compra creada o error de validación.
 *
 * @example
 * const { data: purchase } = await createPurchase({
 *   userId: 'user123',
 *   organizationId: 'org456',
 *   eventId: 'event789',
 *   items: [
 *     { ticketTypeId: 'tt1', ticketName: 'VIP', quantity: 2, unitPrice: 150000, subtotal: 300000 },
 *   ],
 *   subtotal: 300000,
 *   serviceFee: 9000,
 *   total: 309000,
 * });
 */
export async function createPurchase(
  data: CreatePurchaseData,
): Promise<EventResponse<Purchase>> {
  // Validar campos requeridos
  const validationError = validatePurchaseData(data);
  if (validationError) {
    return {
      success: false,
      error: validationError,
      code: 'validation-error',
    };
  }

  try {
    const ref = doc(collection(db, COLLECTIONS.PURCHASES));

    // Calcular subtotales por item si no fueron provistos
    const items: PurchaseItem[] = data.items.map((item) =>
      item.subtotal !== undefined
        ? (item as PurchaseItem)
        : calculateItemSubtotal(item as CreatePurchaseItem),
    );

    const purchase: Purchase = {
      id: ref.id,
      userId: data.userId.trim(),
      organizationId: data.organizationId.trim(),
      eventId: data.eventId.trim(),
      items,
      subtotal: data.subtotal,
      serviceFee: data.serviceFee,
      total: data.total,
      currency: data.currency || 'COP',
      paymentMethod: '',
      paymentReference: '',
      status: 'pending',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(ref, purchase);

    return { success: true, data: purchase };
  } catch (error) {
    return handlePurchaseError(error);
  }
}

/**
 * Obtiene una compra por su ID.
 *
 * @param id - ID del documento en Firestore.
 * @returns La compra encontrada o error si no existe.
 *
 * @example
 * const { data: purchase } = await getPurchase('abc123');
 */
export async function getPurchase(id: string): Promise<EventResponse<Purchase>> {
  try {
    const ref = doc(db, COLLECTIONS.PURCHASES, id);
    const docSnap = await getDoc(ref);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Compra no encontrada.',
        code: 'not-found',
      };
    }

    const purchase = { id: docSnap.id, ...docSnap.data() } as Purchase;
    return { success: true, data: purchase };
  } catch (error) {
    return handlePurchaseError(error);
  }
}

/**
 * Obtiene todas las compras de un usuario, ordenadas por fecha de creación descendente.
 *
 * @param userId - UID del usuario.
 * @returns Lista de compras del usuario.
 *
 * @example
 * const { data: purchases } = await getUserPurchases('user123');
 */
export async function getUserPurchases(userId: string): Promise<EventResponse<Purchase[]>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.PURCHASES),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);
    const purchases: Purchase[] = [];

    snapshot.forEach((docSnap) => {
      purchases.push({ id: docSnap.id, ...docSnap.data() } as Purchase);
    });

    return { success: true, data: purchases };
  } catch (error) {
    return handlePurchaseError(error);
  }
}

/**
 * Actualiza el estado de una compra.
 *
 * Utilizado principalmente por la integración con la pasarela de pagos:
 *   - pending → paid: Pago exitoso
 *   - pending → cancelled: Usuario cancela
 *   - pending → expired: Tiempo límite excedido
 *
 * @param id - ID de la compra en Firestore.
 * @param data - Campos a actualizar (status, paymentMethod, paymentReference).
 * @returns La compra actualizada.
 *
 * @example
 * // Marcar como pagada
 * const { data: purchase } = await updatePurchaseStatus('abc123', {
 *   status: 'paid',
 *   paymentMethod: 'stripe',
 *   paymentReference: 'pi_abc123',
 * });
 *
 * // Marcar como cancelada
 * const { data: purchase } = await updatePurchaseStatus('abc123', {
 *   status: 'cancelled',
 * });
 */
export async function updatePurchaseStatus(
  id: string,
  data: UpdatePurchaseData,
): Promise<EventResponse<Purchase>> {
  try {
    const ref = doc(db, COLLECTIONS.PURCHASES, id);

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(ref, updateData);

    const docSnap = await getDoc(ref);
    const purchase = { id: docSnap.id, ...docSnap.data() } as Purchase;

    return { success: true, data: purchase };
  } catch (error) {
    return handlePurchaseError(error);
  }
}
