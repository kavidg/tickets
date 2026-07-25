/**
 * TicketS - Servicio de Categorías (API REST)
 *
 * Capa de servicios que encapsula la comunicación con la API NestJS
 * para la gestión de categorías.
 *
 * Arquitectura:
 *   Componente → Hook → Service (este archivo) → API NestJS → Firestore
 *
 * Endpoints:
 *   GET    /api/v1/categories        → Categorías activas (público)
 *   GET    /api/v1/categories/all    → Todas (autenticado)
 *   GET    /api/v1/categories/:id    → Por ID
 *   POST   /api/v1/categories        → Crear
 *   PATCH  /api/v1/categories/:id    → Actualizar
 *   DELETE /api/v1/categories/:id    → Eliminar
 */

import auth from '../firebase/auth';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const API_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Categoría retornada por la API NestJS */
export interface CategoryFromApi {
  id: string;
  /** ID de la organización a la que pertenece */
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  active: boolean;
  createdAt: { _seconds: number; _nanoseconds: number };
  updatedAt: { _seconds: number; _nanoseconds: number };
}

/** Respuesta del servicio con array de categorías */
export interface CategoriesResponse {
  success: boolean;
  data?: CategoryFromApi[];
  error?: string;
}

/** Respuesta del servicio con una categoría individual */
export interface CategoryResponse {
  success: boolean;
  data?: CategoryFromApi;
  error?: string;
}

/** Datos para crear una categoría (coincide con CreateCategoryDto del backend) */
export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

/** Datos para actualizar una categoría (coincide con UpdateCategoryDto del backend) */
export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

/**
 * Obtiene el token JWT del usuario autenticado.
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Debes iniciar sesión para realizar esta operación.');
  }
  return user.getIdToken();
}

/**
 * Maneja errores HTTP de forma consistente.
 */
async function handleHttpError(response: Response): Promise<string> {
  if (response.status === 401) {
    return 'Tu sesión ha expirado. Inicia sesión nuevamente.';
  }
  if (response.status === 409) {
    const body = await response.json().catch(() => ({}));
    return body?.message || body?.error || 'El slug ya está en uso.';
  }
  const body = await response.json().catch(() => ({}));
  return body?.message || body?.error || 'Error del servidor.';
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Obtiene todas las categorías activas (público, sin filtro de organización).
 *
 * GET /api/v1/categories/public
 * Endpoint público — no requiere autenticación.
 * Útil para páginas públicas como HomePage y EventDetailPage.
 *
 * @returns Lista de categorías activas.
 */
export async function getPublicCategoriesApi(): Promise<CategoriesResponse> {
  try {
    const response = await fetch(`${API_URL}/categories/public`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await handleHttpError(response);
      return { success: false, error };
    }

    const body = await response.json();
    const rawCategories: CategoryFromApi[] = body?.data ?? body ?? [];
    return {
      success: true,
      data: Array.isArray(rawCategories) ? rawCategories : [],
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error de conexión con el servidor.',
    };
  }
}

/**
 * Obtiene las categorías activas de la organización del usuario autenticado.
 *
 * GET /api/v1/categories
 * Requiere autenticación.
 *
 * @returns Lista de categorías activas de la organización.
 */
export async function getMyCategoriesApi(): Promise<CategoriesResponse> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/categories`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await handleHttpError(response);
      return { success: false, error };
    }

    const body = await response.json();
    const rawCategories: CategoryFromApi[] = body?.data ?? body ?? [];
    return {
      success: true,
      data: Array.isArray(rawCategories) ? rawCategories : [],
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error de conexión con el servidor.',
    };
  }
}

/**
 * Obtiene todas las categorías (activas e inactivas).
 * Requiere autenticación.
 *
 * GET /api/v1/categories/all
 *
 * @returns Lista completa de categorías.
 */
export async function getAllCategoriesApi(): Promise<CategoriesResponse> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/categories/all`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await handleHttpError(response);
      return { success: false, error };
    }

    const body = await response.json();
    const rawCategories: CategoryFromApi[] = body?.data ?? body ?? [];
    return {
      success: true,
      data: Array.isArray(rawCategories) ? rawCategories : [],
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error de conexión con el servidor.',
    };
  }
}

/**
 * Crea una nueva categoría.
 *
 * POST /api/v1/categories
 *
 * @param data - Datos de la categoría a crear.
 * @returns La categoría creada.
 */
export async function createCategoryApi(
  data: CreateCategoryData,
): Promise<CategoryResponse> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await handleHttpError(response);
      return { success: false, error };
    }

    const body = await response.json();
    const category: CategoryFromApi = body?.data ?? body;
    return category?.id
      ? { success: true, data: category }
      : { success: false, error: 'Error al crear la categoría.' };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error de conexión con el servidor.',
    };
  }
}

/**
 * Actualiza una categoría existente.
 *
 * PATCH /api/v1/categories/:id
 *
 * @param id - ID de la categoría.
 * @param data - Datos a actualizar.
 * @returns La categoría actualizada.
 */
export async function updateCategoryApi(
  id: string,
  data: UpdateCategoryData,
): Promise<CategoryResponse> {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_URL}/categories/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const error = await handleHttpError(response);
      return { success: false, error };
    }

    const body = await response.json();
    return { success: true, data: body?.data ?? body };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error de conexión con el servidor.',
    };
  }
}

/**
 * Elimina una categoría.
 *
 * DELETE /api/v1/categories/:id
 *
 * @param id - ID de la categoría a eliminar.
 */
export async function deleteCategoryApi(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_URL}/categories/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const error = await handleHttpError(response);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error de conexión con el servidor.',
    };
  }
}
