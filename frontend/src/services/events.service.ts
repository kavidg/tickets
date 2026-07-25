/**
 * TicketS - Events Service (API)
 *
 * Capa de servicios que encapsula la comunicación con la API NestJS
 * para la gestión de eventos del organizador.
 *
 * Arquitectura:
 *   Componente → Hook → Service (este archivo) → API NestJS → Firestore
 *
 * A diferencia de event.service.ts (Firestore SDK directo), este servicio
 * consume exclusivamente la API REST del backend, validando autenticación
 * mediante Firebase Auth tokens.
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

/** Respuesta del servicio con array de eventos */
export interface MyEventsResponse {
  success: boolean;
  data?: EventFromApi[];
  error?: string;
}

/** Respuesta del servicio con un solo evento */
export interface EventByIdResponse {
  success: boolean;
  data?: EventFromApi;
  error?: string;
}


/**
 * Tipo Evento retornado por la API NestJS.
 * NOTA: Los Timestamps llegan como objetos { _seconds, _nanoseconds }
 * desde Firestore vía admin SDK.
 */
export interface EventFromApi {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  organizationId: string;
  venueId?: string;
  organizerId: string;
  imageUrl: string;
  city: string;
  address: string;
  startDate: { _seconds: number; _nanoseconds: number };
  endDate: { _seconds: number; _nanoseconds: number };
  status: 'draft' | 'published' | 'finished' | 'cancelled';
  createdAt: { _seconds: number; _nanoseconds: number };
  updatedAt: { _seconds: number; _nanoseconds: number };
}

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

/**
 * Obtiene el token JWT del usuario autenticado.
 * Lanza error si no hay sesión activa.
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Debes iniciar sesión para realizar esta operación.');
  }
  return user.getIdToken();
}

/**
 * Convierte un timestamp con _seconds a objeto Date.
 */
function timestampToDate(ts: { _seconds: number }): Date {
  return new Date(ts._seconds * 1000);
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Obtiene los eventos del organizador autenticado desde la API NestJS.
 *
 * Endpoint: GET /api/v1/events/my
 *
 * @returns Lista de eventos del organizador.
 *
 * @example
 * const { success, data: events } = await getMyEvents();
 * if (success) {
 *   events.forEach(e => console.log(e.title));
 * }
 */
export async function getMyEvents(): Promise<MyEventsResponse> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/events/my`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
        };
      }

      if (response.status === 404) {
        return { success: true, data: [] };
      }

      const body = await response.json().catch(() => ({}));
      return {
        success: false,
        error: body?.message || body?.error || 'Error al obtener los eventos.',
      };
    }

    const body = await response.json();

    // La API envuelve la respuesta en { success, data }
    const rawEvents: EventFromApi[] = body?.data ?? body ?? [];

    if (!Array.isArray(rawEvents)) {
      return { success: true, data: [] };
    }

    return { success: true, data: rawEvents };
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

// ---------------------------------------------------------------------------
// Re-exportaciones útiles
// ---------------------------------------------------------------------------

/**
 * Obtiene un evento individual por su ID desde la API NestJS.
 *
 * Endpoint: GET /api/v1/events/:id
 *
 * @param id - ID del evento en Firestore.
 * @returns El evento encontrado o error.
 *
 * @example
 * const { success, data: event } = await getEventById('abc123');
 * if (success) {
 *   console.log(event.title);
 * }
 */
export async function getEventById(id: string): Promise<EventByIdResponse> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/events/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: 'Evento no encontrado.',
        };
      }

      const body = await response.json().catch(() => ({}));
      return {
        success: false,
        error: body?.message || body?.error || 'Error al obtener el evento.',
      };
    }

    const body = await response.json();

    // La API envuelve la respuesta en { success, data }
    const event: EventFromApi = body?.data ?? body;

    if (!event || !event.id) {
      return {
        success: false,
        error: 'Evento no encontrado.',
      };
    }

    return { success: true, data: event };
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

// ---------------------------------------------------------------------------
// Re-exportaciones útiles
// ---------------------------------------------------------------------------

export { timestampToDate };

