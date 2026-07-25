/**
 * TicketS - useCategories Hook
 *
 * Hook personalizado para consumir categorías desde la API NestJS.
 * Los componentes NO deben importar category.service.ts directamente.
 *
 * Arquitectura:
 *   Componente → useCategories() → category.service.ts → API NestJS → Firestore
 *
 * Proporciona:
 *   - useCategories()     → hook público con categorías activas + helpers
 *   - useAdminCategories() → hook de administración con CRUD completo
 *
 * @example
 * import { useCategories } from '../hooks/useCategories';
 *
 * function EventList() {
 *   const { categories, loading, categoryNameById, categoryNames } = useCategories();
 *   if (loading) return <Spinner />;
 *   const name = categoryNameById('abc123'); // → 'Música'
 *   return <Filters categories={categoryNames} />;
 * }
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

import {
  getPublicCategoriesApi,
  getMyCategoriesApi,
  getAllCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from '../services/category.service';

import type {
  CategoryFromApi,
  CreateCategoryData,
  UpdateCategoryData,
} from '../services/category.service';

// ---------------------------------------------------------------------------
// Tipos del hook (público)
// ---------------------------------------------------------------------------

/** Estado retornado por useCategories() */
export interface UseCategoriesState {
  /** Lista de categorías activas */
  categories: CategoryFromApi[];
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
// Tipos del hook (admin)
// ---------------------------------------------------------------------------

/** Estado retornado por useAdminCategories() */
export interface UseAdminCategoriesState {
  /** Lista completa de categorías (activas e inactivas) */
  categories: CategoryFromApi[];
  /** Indica si la carga está en progreso */
  loading: boolean;
  /** Indica si una operación (create/update/delete) está en progreso */
  saving: boolean;
  /** Mensaje de error o null si no hay error */
  error: string | null;
  /** Mensaje de éxito temporal */
  successMessage: string | null;
  /** Recarga la lista manualmente */
  reload: () => void;
  /** Crea una nueva categoría */
  createCategory: (data: CreateCategoryData) => Promise<boolean>;
  /** Actualiza una categoría existente */
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<boolean>;
  /** Elimina una categoría */
  deleteCategory: (id: string) => Promise<boolean>;
}

// ---------------------------------------------------------------------------
// useCategories (público)
// ---------------------------------------------------------------------------

/**
 * Obtiene la lista de categorías activas desde el endpoint público.
 * No requiere autenticación — útil para páginas públicas como HomePage y EventDetailPage.
 *
 * Se ejecuta automáticamente al montar el componente.
 * Proporciona helpers `categoryNameById` (mapa ID → nombre) y
 * `categoryNames` (array con 'Todos' + nombres para filtros).
 *
 * @returns Estado con categories[], loading, error, reload y helpers.
 */
/**
 * useMyCategories
 *
 * Hook para obtener las categorías activas de la ORGANIZACIÓN del usuario autenticado.
 * Requiere que el usuario esté autenticado (llama GET /api/v1/categories con Bearer token).
 * Útil para formularios protegidos como CreateEventForm.
 *
 * @returns Estado con categories[], loading, error, reload.
 */
export function useMyCategories(): UseCategoriesState {
  const [categories, setCategories] = useState<CategoryFromApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  let cancelled = false;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMyCategoriesApi();

      console.log('[useMyCategories] API response:', JSON.stringify({
        success: response.success,
        count: response.data?.length ?? 0,
        error: response.error,
        firstItem: response.data?.[0] ? { id: response.data[0].id, name: response.data[0].name, orgId: response.data[0].organizationId } : null,
      }));

      if (cancelled) return;

      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(response.error || 'Error al cargar categorías de la organización.');
        setCategories([]);
      }
    } catch {
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

  const categoryNameById = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const cat of categories) {
      map[cat.id] = cat.name;
    }
    return map;
  }, [categories]);

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


export function useCategories(): UseCategoriesState {
  const [categories, setCategories] = useState<CategoryFromApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  let cancelled = false;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPublicCategoriesApi();

      if (cancelled) return;

      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(response.error || 'Error al cargar categorías.');
        setCategories([]);
      }
    } catch {
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

  const categoryNameById = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const cat of categories) {
      map[cat.id] = cat.name;
    }
    return map;
  }, [categories]);

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

// ---------------------------------------------------------------------------
// useAdminCategories (admin CRUD)
// ---------------------------------------------------------------------------

/**
 * Hook de administración de categorías con CRUD completo.
 *
 * Obtiene todas las categorías (activas e inactivas) y permite
 * crear, actualizar y eliminar categorías.
 *
 * @returns Estado con categories[], loading, saving, error, successMessage,
 *          reload(), createCategory(), updateCategory(), deleteCategory().
 */
export function useAdminCategories(): UseAdminCategoriesState {
  const [categories, setCategories] = useState<CategoryFromApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  let cancelled = false;

  // -----------------------------------------------------------------------
  // Cargar categorías
  // -----------------------------------------------------------------------
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAllCategoriesApi();

      if (cancelled) return;

      if (response.success) {
        setCategories(response.data ?? []);
      } else {
        setError(response.error || 'Error al cargar categorías.');
        setCategories([]);
      }
    } catch {
      if (cancelled) return;
      setError('Error inesperado al cargar categorías.');
      setCategories([]);
    } finally {
      if (!cancelled) setLoading(false);
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
  // Crear categoría
  // -----------------------------------------------------------------------
  const createCategory = useCallback(
    async (data: CreateCategoryData): Promise<boolean> => {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await createCategoryApi(data);

        if (cancelled) return false;

        if (response.success && response.data) {
          setCategories((prev) => [...prev, response.data!]);
          setSuccessMessage('Categoría creada correctamente.');
          return true;
        } else {
          setError(response.error || 'Error al crear la categoría.');
          return false;
        }
      } catch {
        if (cancelled) return false;
        setError('Error inesperado al crear la categoría.');
        return false;
      } finally {
        if (!cancelled) setSaving(false);
      }
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Actualizar categoría
  // -----------------------------------------------------------------------
  const updateCategory = useCallback(
    async (id: string, data: UpdateCategoryData): Promise<boolean> => {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await updateCategoryApi(id, data);

        if (cancelled) return false;

        if (response.success && response.data) {
          setCategories((prev) =>
            prev.map((c) => (c.id === id ? response.data! : c)),
          );
          setSuccessMessage('Categoría actualizada correctamente.');
          return true;
        } else {
          setError(response.error || 'Error al actualizar la categoría.');
          return false;
        }
      } catch {
        if (cancelled) return false;
        setError('Error inesperado al actualizar la categoría.');
        return false;
      } finally {
        if (!cancelled) setSaving(false);
      }
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Eliminar categoría
  // -----------------------------------------------------------------------
  const deleteCategory = useCallback(
    async (id: string): Promise<boolean> => {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await deleteCategoryApi(id);

        if (cancelled) return false;

        if (response.success) {
          setCategories((prev) => prev.filter((c) => c.id !== id));
          setSuccessMessage('Categoría eliminada correctamente.');
          return true;
        } else {
          setError(response.error || 'Error al eliminar la categoría.');
          return false;
        }
      } catch {
        if (cancelled) return false;
        setError('Error inesperado al eliminar la categoría.');
        return false;
      } finally {
        if (!cancelled) setSaving(false);
      }
    },
    [],
  );

  return {
    categories,
    loading,
    saving,
    error,
    successMessage,
    reload: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
