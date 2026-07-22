/**
 * TicketS - Category Interface
 *
 * Modelo de categoría de eventos.
 * Las categorías son globales y no pertenecen a organizaciones.
 *
 * Colección Firestore: categories
 *
 * @see CreateCategoryDto para los datos de creación.
 * @see UpdateCategoryDto para los datos de actualización.
 */

/**
 * Representa una categoría de eventos en Firestore.
 */
export interface Category {
  /** ID del documento en Firestore */
  id: string;
  /** Nombre visible de la categoría (ej: "Conciertos", "Teatro") */
  name: string;
  /** Slug único para URLs (ej: "conciertos") */
  slug: string;
  /** Descripción breve de la categoría */
  description: string;
  /** URL de la imagen representativa de la categoría */
  imageUrl: string;
  /** Indica si la categoría está activa (visible en listados públicos) */
  active: boolean;
  /** Timestamp de creación (Firestore serverTimestamp) */
  createdAt: FirebaseFirestore.Timestamp;
  /** Timestamp de última actualización (Firestore serverTimestamp) */
  updatedAt: FirebaseFirestore.Timestamp;
}
