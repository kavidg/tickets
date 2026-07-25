/**
 * TicketS - usePublicEvent Hook
 *
 * Hook personalizado para consumir un evento público desde la API NestJS.
 *
 * Arquitectura:
 *   Componente → usePublicEvent(slug) → API NestJS → Firestore
 *
 * Proporciona:
 *   - usePublicEvent(slug) → obtener evento público con sus ticket types
 *
 * A diferencia de useEvent(slug) que usa Firestore SDK directo,
 * este hook consume exclusivamente el endpoint público del backend.
 *
 * @example
 * import { usePublicEvent } from '../hooks/usePublicEvent';
 *
 * function EventPage() {
 *   const { event, loading, error } = usePublicEvent('neon-sessions');
 *
 *   if (loading) return <Skeleton />;
 *   if (error) return <Error message={error} />;
 *
 *   return (
 *     <>
 *       <h1>{event.title}</h1>
 *       {event.ticketTypes.map(t => <p>{t.name} — ${t.price}</p>)}
 *     </>
 *   );
 * }
 */

import { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const API_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Tipo de entrada desde la API pública */
export interface PublicTicketType {
  id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  soldQuantity: number;
  currency: string;
  status: string;
  available: number;
}

/** Timestamp desde Firestore vía API ({ _seconds, _nanoseconds }) */
interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

/** Evento público retornado por la API */
export interface PublicEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  city: string;
  address: string;
  startDate: FirestoreTimestamp;
  endDate: FirestoreTimestamp;
  categoryId: string;
  organizerId: string;
  organizationId: string;
  ticketTypes: PublicTicketType[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Respuesta del endpoint público */
interface PublicEventResponse {
  success: boolean;
  data?: PublicEvent;
  error?: string;
}

/** Estado retornado por usePublicEvent() */
export interface UsePublicEventState {
  /** Evento encontrado o null si no se ha cargado / no existe */
  event: PublicEvent | null;
  /** Indica si la carga está en progreso */
  loading: boolean;
  /** Mensaje de error o null si no hay error */
  error: string | null;
  /** Recarga el evento manualmente */
  reload: () => void;
}

// ---------------------------------------------------------------------------
// usePublicEvent
// ---------------------------------------------------------------------------

/**
 * Obtiene un evento público por su slug desde la API NestJS.
 *
 * Se ejecuta automáticamente al montar el componente y cada vez
 * que cambie el slug.
 *
 * El endpoint solo retorna eventos con status 'published'.
 * Incluye los tipos de entrada (ticket types) asociados.
 *
 * @param slug - Slug único del evento.
 * @returns Estado con event, loading, error y reload().
 *
 * @example
 * const { event, loading, error } = usePublicEvent('neon-sessions');
 *
 * if (loading) return <Skeleton />;
 * if (error) return <Error message={error} />;
 *
 * // Acceder a datos del evento
 * console.log(event.title);
 *
 * // Acceder a tipos de entrada
 * event.ticketTypes.forEach(t => console.log(t.name, t.price));
 */
export function usePublicEvent(slug: string | undefined): UsePublicEventState {
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Flag para evitar actualizar estado si el componente se desmonta
  let cancelled = false;

  const fetchEvent = useCallback(async () => {
    if (!slug) {
      setEvent(null);
      setError('Evento no encontrado.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setEvent(null);

    try {
      const response = await fetch(
        `${API_URL}/events/public/${encodeURIComponent(slug)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (cancelled) return;

      if (response.status === 404) {
        setEvent(null);
        setError('El evento no existe o no está disponible.');
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(
          body?.message || body?.error || 'Error al cargar el evento.',
        );
        return;
      }

      const body = await response.json() as PublicEventResponse;
      const eventData: PublicEvent | undefined = body?.data;

      if (!eventData || !eventData.id) {
        setError('El evento no existe o no está disponible.');
        return;
      }

      setEvent(eventData);
      setError(null);
    } catch (err) {
      if (cancelled) return;
      setError('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    cancelled = false;
    fetchEvent();
    return () => {
      cancelled = true;
    };
  }, [fetchEvent]);

  return { event, loading, error, reload: fetchEvent };
}
