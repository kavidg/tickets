/**
 * TicketS - useCategories Hook
 *
 * Hook personalizado para consumir categorías desde Firestore a través de
 * category.service.ts. Los componentes NO deben importar category.service.ts
 * directamente.
 *
 * Arquitectura:
 *   Componente → useCategories() → category.service.ts → firestore.ts → Firestore
 *
 * Proporciona funciones útiles para resolver categoryId → category name
 * en componentes de UI.
 *
 * @example
 * import { useCategories } from '../hooks/useCategories';
 *
 * function EventList() {
 *   const { categories, loading, error, categoryNameById, categoryNames } = useCategories();
 *
 *   if (loading) return <Spinner />;
 *
 *   // Obtener nombre de una categoría por su ID
 *   const name = categoryNameById('abc123'); // → 'Música'
 *
 *   // Lista de nombres para el filtro
 *   return <Filters categories={categoryNames} />;
 * }
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

import { getCategories } from '../services/category.service';

import type { Category } from '../types/event';

// ---------------------------------------------------------------------------
// Tipos del hook
// ---------------------------------------------------------------------------

/** Estado retornado por useCategories() */
export interface UseCategoriesState {
  /** Lista de categorías desde Firestore */
  categories: Category[];
  /** Indica si la carga está en progreso */
  loading: boolean;
  /** Mensaje de error o null si no hay error */
  error: string | null;
  /** Recarga las categorías manualmente */
  reload: () => void;
  /** Mapa: categoryId → category.name (para resolución rápida) */
  categoryNameById: Record<string, string>;
  /** Lista de nombres ['Todos', name1, name2, ...] para Filters */
  categoryNames: string[];
}

// ---------------------------------------------------------------------------
// useCategories
// ---------------------------------------------------------------------------

/**
 * Obtiene la lista de categorías desde Firestore.
 *
 * Se ejecuta automáticamente al montar el componente.
 * Proporciona helpers `categoryNameById` (mapa ID → nombre) y
 * `categoryNames` (array con 'Todos' + nombres para filtros).
 *
 * @returns Estado con categories[], loading, error, reload y helpers.
 *
 * @example
 * const { categories, loading, categoryNameById, categoryNames } = useCategories();
 *
 * // Resolver categoryId → nombre
 * const catName = categoryNameById[event.categoryId] || event.categoryId;
 *
 * // Pasar a Filters
 * <Filters categories={categoryNames} ... />
 */
export function useCategories(): UseCategoriesState {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Flag para evitar actualizar estado si el componente se desmonta
  let cancelled = false;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCategories();

      if (cancelled) return;

      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(response.error || 'Error al cargar categorías.');
        setCategories([]);
      }
    } catch (err) {
      if (cancelled) return;
      setError('Error inesperado al cargar categorías.');
      setCategories([]);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    cancelled = false;
    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [fetchCategories]);

  // -----------------------------------------------------------------------
  // Helpers derivados (memorizados)
  // -----------------------------------------------------------------------

  /**
   * Mapa: categoryId → category.name
   * Útil para resolver el nombre de una categoría desde event.categoryId.
   *
   * @example
   * const name = categoryNameById[event.categoryId]; // → 'Música'
   */
  const categoryNameById = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const cat of categories) {
      map[cat.id] = cat.name;
    }
    return map;
  }, [categories]);

  /**
   * Lista de nombres de categorías con 'Todos' al inicio,
   * listo para pasar al componente Filters.
   */
  const categoryNames = useMemo<string[]>(() => {
    return ['Todos', ...categories.map((cat) => cat.name)];
  }, [categories]);

  return {
    categories,
    loading,
    error,
    reload: fetchCategories,
    categoryNameById,
    categoryNames,
  };
}
