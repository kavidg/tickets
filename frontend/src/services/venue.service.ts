/**
 * TicketS - Servicio de Lugares (Venues) — API REST
 *
 * Capa de servicios que encapsula la comunicación con la API NestJS
 * para la gestión de lugares físicos de eventos.
 *
 * Endpoints:
 *   GET  /api/v1/venues/public   → Público, venues activos
 *   GET  /api/v1/venues          → Auth, venues activos de la org
 *   GET  /api/v1/venues/all      → Auth, todos los venues de la org
 *   GET  /api/v1/venues/:id      → Por ID
 *   POST /api/v1/venues          → Crear
 *   PATCH /api/v1/venues/:id     → Actualizar
 *   DELETE /api/v1/venues/:id    → Eliminar
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

/** Venue retornado por la API NestJS */
export interface VenueFromApi {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number;
  imageUrl: string;
  active: boolean;
  createdAt: { _seconds: number; _nanoseconds: number };
  updatedAt: { _seconds: number; _nanoseconds: number };
}

/** Respuesta del servicio con array de venues */
export interface VenuesResponse {
  success: boolean;
  data?: VenueFromApi[];
  error?: string;
}

/** Respuesta del servicio con un venue individual */
export interface VenueResponse {
  success: boolean;
  data?: VenueFromApi;
  error?: string;
}

/** Datos para crear un venue */
export interface CreateVenueData {
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  imageUrl?: string;
}

/** Datos para actualizar un venue */
export interface UpdateVenueData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  imageUrl?: string;
  active?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Debes iniciar sesión para realizar esta operación.');
  }
  return user.getIdToken();
}

async function handleHttpError(response: Response): Promise<string> {
  if (response.status === 401) {
    return 'Tu sesión ha expirado. Inicia sesión nuevamente.';
  }
  if (response.status === 403) {
    return 'No tienes permisos para realizar esta operación.';
  }
  const body = await response.json().catch(() => ({}));
  return body?.message || body?.error || 'Error del servidor.';
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Obtiene todos los venues activos (público, sin auth).
 * GET /api/v1/venues/public
 */
export async function getPublicVenuesApi(): Promise<VenuesResponse> {
  try {
    const response = await fetch(`${API_URL}/venues/public`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await handleHttpError(response);
      return { success: false, error };
    }

    const body = await response.json();
    const raw: VenueFromApi[] = body?.data ?? body ?? [];
    return { success: true, data: Array.isArray(raw) ? raw : [] };
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
 * Obtiene los venues activos de la organización del usuario autenticado.
 * GET /api/v1/venues
 */
export async function getMyVenuesApi(): Promise<VenuesResponse> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/venues`, {
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
    const raw: VenueFromApi[] = body?.data ?? body ?? [];
    return { success: true, data: Array.isArray(raw) ? raw : [] };
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
 * Obtiene todos los venues (activos e inactivos) de la organización.
 * GET /api/v1/venues/all
 */
export async function getAllVenuesApi(): Promise<VenuesResponse> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/venues/all`, {
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
    const raw: VenueFromApi[] = body?.data ?? body ?? [];
    return { success: true, data: Array.isArray(raw) ? raw : [] };
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
 * Crea un nuevo venue.
 * POST /api/v1/venues
 */
export async function createVenueApi(
  data: CreateVenueData,
): Promise<VenueResponse> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/venues`, {
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
    const venue: VenueFromApi = body?.data ?? body;
    return venue?.id
      ? { success: true, data: venue }
      : { success: false, error: 'Error al crear el lugar.' };
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
 * Actualiza un venue existente.
 * PATCH /api/v1/venues/:id
 */
export async function updateVenueApi(
  id: string,
  data: UpdateVenueData,
): Promise<VenueResponse> {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_URL}/venues/${encodeURIComponent(id)}`,
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
 * Elimina un venue.
 * DELETE /api/v1/venues/:id
 */
export async function deleteVenueApi(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_URL}/venues/${encodeURIComponent(id)}`,
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
