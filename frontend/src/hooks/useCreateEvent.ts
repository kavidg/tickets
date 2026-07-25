/**
 * TicketS - useCreateEvent Hook
 *
 * Hook para crear eventos desde el panel del organizador.
 * Encapsula la subida de imágenes a Firebase Storage y la comunicación
 * con el backend NestJS.
 *
 * Endpoints consumidos:
 *   GET  /api/v1/categories         → categorías disponibles
 *   GET  /api/v1/venues/my          → venues del organizador
 *   POST /api/v1/venues             → crear nuevo venue
 *   POST /api/v1/events             → crear evento
 *
 * Arquitectura:
 *   Componente → useCreateEvent → fetch (NestJS API) + Firebase Storage → Firestore
 */

import { useState, useCallback, useEffect } from 'react';
import auth from '../firebase/auth';
import type { Venue } from '../types/venue';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Datos del formulario de creación de evento */
export interface CreateEventFormData {
  title: string;
  description: string;
  categoryId: string;
  venueId: string;
  city: string;
  address: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  imageUrl: string;
  published: boolean;
}

/** Datos para crear un venue rápido */
export interface QuickVenueData {
  name: string;
  city: string;
  address?: string;
  capacity?: number;
}

/** Estado del hook */
export interface CreateEventState {
  loading: boolean;
  error: string | null;
  success: boolean;
  venues: Venue[];
  loadingVenues: boolean;
  creatingVenue: boolean;
}

/** Respuesta del hook al crear evento */
export interface CreateEventResponse {
  success: boolean;
  error?: string;
  eventId?: string;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const API_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

/**
 * Obtiene el token JWT de Firebase Auth.
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

/**
 * Genera un slug a partir de un texto.
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook para la creación de eventos.
 *
 * Proporciona:
 *   - Carga de categorías y venues del usuario
 *   - Creación rápida de venues (modal)
 *   - Subida de imagen a Firebase Storage
 *   - Envío del evento al backend NestJS
 *
 * @example
 * const {
 *   loading, error,
 *   venues, loadingVenues, creatingVenue,
 *   createEvent, createVenue,
 * } = useCreateEvent();
 *
 * const result = await createEvent(formData);
 * if (result.success) window.location.href = '/organizer/dashboard';
 */
export function useCreateEvent() {
  const [state, setState] = useState<CreateEventState>({
    loading: false,
    error: null,
    success: false,
    venues: [],
    loadingVenues: true,
    creatingVenue: false,
  });

  // NOTA: Las categorías NO se cargan aquí. Se reutiliza el hook
  // useCategories() existente desde el componente CreateEventForm,
  // que consume category.service.ts → Firestore directamente.

  // -----------------------------------------------------------------------
  // Cargar venues del organizador desde la API
  // -----------------------------------------------------------------------

  const loadVenues = useCallback(async () => {
    setState((prev) => ({ ...prev, loadingVenues: true }));
    try {
      const token = await getAuthToken();
      if (!token) {
        setState((prev) => ({ ...prev, loadingVenues: false }));
        return;
      }

      const res = await fetch(`${API_URL}/venues/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const body = await res.json();
        const list: Venue[] = body?.data || body || [];
        setState((prev) => ({
          ...prev,
          venues: list,
          loadingVenues: false,
        }));
      } else {
        setState((prev) => ({ ...prev, loadingVenues: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, loadingVenues: false }));
    }
  }, []);

  // Cargar venues al montar
  // NOTA: No se reutiliza venue.service.ts porque ese servicio consulta
  // Firestore directamente y no incluye filtro por organización.
  // GET /api/v1/venues/my retorna solo los venues del organizador autenticado.
  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  // -----------------------------------------------------------------------
  // Crear venue rápido
  // -----------------------------------------------------------------------

  const createVenue = useCallback(
    async (data: QuickVenueData): Promise<{ success: boolean; venue?: Venue; error?: string }> => {
      setState((prev) => ({ ...prev, creatingVenue: true, error: null }));

      try {
        const token = await getAuthToken();
        if (!token) {
          setState((prev) => ({ ...prev, creatingVenue: false }));
          return { success: false, error: 'Debes iniciar sesión.' };
        }

        const res = await fetch(`${API_URL}/venues`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok) {
          const errorMsg =
            result?.message || result?.error || 'Error al crear el lugar.';
          setState((prev) => ({ ...prev, creatingVenue: false }));
          return { success: false, error: errorMsg };
        }

        const newVenue: Venue = result?.data || result;

        // Actualizar lista local de venues
        setState((prev) => ({
          ...prev,
          venues: [...prev.venues, newVenue],
          creatingVenue: false,
        }));

        return { success: true, venue: newVenue };
      } catch {
        setState((prev) => ({ ...prev, creatingVenue: false }));
        return {
          success: false,
          error: 'Error de conexión al crear el lugar.',
        };
      }
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Crear evento
  // -----------------------------------------------------------------------

  const createEvent = useCallback(
    async (data: CreateEventFormData): Promise<CreateEventResponse> => {
      setState((prev) => ({ ...prev, loading: true, error: null, success: false }));

      try {
        const token = await getAuthToken();
        if (!token) {
          setState((prev) => ({ ...prev, loading: false }));
          return { success: false, error: 'Debes iniciar sesión.' };
        }

        // 1. Armar fechas
        const startDateTime = new Date(`${data.startDate}T${data.startTime}:00`);
        const endDateTime = new Date(`${data.endDate}T${data.endTime}:00`);

        if (endDateTime <= startDateTime) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: 'La hora de fin debe ser posterior a la hora de inicio.',
          }));
          return {
            success: false,
            error: 'La hora de fin debe ser posterior a la hora de inicio.',
          };
        }

        // 2. Generar slug
        const slug = generateSlug(data.title);

        // 3. Enviar POST al backend
        const payload: Record<string, unknown> = {
          title: data.title.trim(),
          slug,
          description: data.description.trim(),
          city: data.city,
          address: data.address,
          imageUrl: data.imageUrl || '',
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          status: data.published ? 'published' : 'draft',
        };

        // Enviar categoryId
        if (data.categoryId) {
          payload.categoryId = data.categoryId;
        }

        // Enviar venueId
        if (data.venueId) {
          payload.venueId = data.venueId;
        }

        const res = await fetch(`${API_URL}/events`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (!res.ok) {
          const errorMsg =
            result?.message ||
            result?.error ||
            'Error al crear el evento. Verifica los datos.';
          setState((prev) => ({ ...prev, loading: false, error: errorMsg }));
          return { success: false, error: errorMsg };
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
          success: true,
        }));

        return {
          success: true,
          eventId: result?.data?.id || result?.id,
        };
      } catch (err) {
        const errorMsg =
          err instanceof TypeError
            ? 'No se pudo conectar con el servidor.'
            : 'Error inesperado al crear el evento.';
        setState((prev) => ({ ...prev, loading: false, error: errorMsg }));
        return { success: false, error: errorMsg };
      }
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Limpiar estado
  // -----------------------------------------------------------------------

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      loading: false,
      error: null,
      success: false,
    }));
  }, []);

  // -----------------------------------------------------------------------
  // Retorno
  // -----------------------------------------------------------------------

  return {
    ...state,
    createEvent,
    createVenue,
    loadVenues,
    reset,
  };
}
