/**
 * TicketS - Servicio de Categorías
 *
 * Capa de servicios que encapsula toda la comunicación con Firestore
 * para la gestión de categorías de eventos.
 *
 * Colección: `categories`
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
  orderBy,
  type Timestamp,
} from 'firebase/firestore';

import db from '../firebase/firestore';
import { COLLECTIONS } from '../constants/firestore';
import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  EventResponse,
} from '../types/event';

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function handleCategoryError<T>(error: unknown): EventResponse<T> {
  const firestoreError = error as { code?: string; message?: string };
  const code = firestoreError?.code || 'categories/unknown';

  return {
    success: false,
    error: firestoreError?.message || 'Error al procesar la categoría.',
    code,
  } as EventResponse<T>;
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Obtiene todas las categorías activas, ordenadas por nombre.
 *
 * @returns Lista de categorías.
 *
 * @example
 * const { success, data } = await getCategories();
 * if (success) console.log(data);
 */
export async function getCategories(): Promise<EventResponse<Category[]>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.CATEGORIES),
      orderBy('name', 'asc'),
    );

    const snapshot = await getDocs(q);
    const categories: Category[] = [];

    snapshot.forEach((docSnap) => {
      categories.push({ id: docSnap.id, ...docSnap.data() } as Category);
    });

    return { success: true, data: categories };
  } catch (error) {
    return handleCategoryError(error);
  }
}

/**
 * Crea una nueva categoría.
 *
 * @param data - Datos de la categoría a crear.
 * @returns La categoría creada.
 *
 * @example
 * const response = await createCategory({
 *   name: 'Música',
 *   slug: 'musica',
 *   description: 'Eventos musicales',
 * });
 */
export async function createCategory(data: CreateCategoryData): Promise<EventResponse<Category>> {
  try {
    const ref = doc(collection(db, COLLECTIONS.CATEGORIES));

    const category: Category = {
      id: ref.id,
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      active: data.active ?? true,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(ref, category);

    return { success: true, data: category };
  } catch (error) {
    return handleCategoryError(error);
  }
}

/**
 * Actualiza una categoría existente.
 *
 * @param id - ID del documento en Firestore.
 * @param data - Campos a actualizar.
 * @returns La categoría actualizada.
 *
 * @example
 * const response = await updateCategory('abc123', { active: false });
 */
export async function updateCategory(id: string, data: UpdateCategoryData): Promise<EventResponse<Category>> {
  try {
    const ref = doc(db, COLLECTIONS.CATEGORIES, id);

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(ref, updateData);

    const docSnap = await getDoc(ref);
    const category = { id: docSnap.id, ...docSnap.data() } as Category;

    return { success: true, data: category };
  } catch (error) {
    return handleCategoryError(error);
  }
}
