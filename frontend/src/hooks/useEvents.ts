/**
 * TicketS - useEvents Hook
 *
 * Hook personalizado para consumir eventos desde Firestore a través de
 * event.service.ts. Los componentes NO deben importar event.service.ts
 * directamente.
 *
 * Arquitectura:
 *   Componente → useEvents() → event.service.ts → firestore.ts → Firestore
 *
 * Proporciona:
 *   - useEvents()    → obtener eventos públicos con estados loading/error
 *   - useEvent(slug) → obtener un evento individual por slug
 *
 * @example
 * import { useEvents, useEvent } from '../hooks/useEvents';
 *
 * function EventList() {
 *   const { events, loading, error } = useEvents();
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error} />;
 *   return events.map(event => <EventCard key={event.id} event={event} />);
 * }
 *
 * function EventPage() {
 *   const { event, loading, error, notFound } = useEvent('neon-sessions');
 *   if (loading) return <Spinner />;
 *   if (notFound) return <NotFound />;
 *   return <EventDetail event={event} />;
 * }
 */

import { useState, useEffect, useCallback } from 'react';

import {
  getPublicEvents,
  getEventBySlug,
} from '../services/event.service';

import { getMyEvents, timestampToDate } from '../services/events.service';
import type { EventFromApi } from '../services/events.service';

import type { Event } from '../types/event';

// ---------------------------------------------------------------------------
// Tipos del hook
// ---------------------------------------------------------------------------

/** Estado retornado por useEvents() */
export interface UseEventsState {
  /** Lista de eventos públicos (vacío si loading o error) */
  events: Event[];
  /** Indica si la carga está en progreso */
  loading: boolean;
  /** Mensaje de error o null si no hay error */
  error: string | null;
  /** Recarga los eventos manualmente */
  reload: () => void;
}

/** Estado retornado por useEvent(slug) */
export interface UseEventState {
  /** Evento encontrado o null si no se ha cargado / no existe */
  event: Event | null;
  /** Indica si la carga está en progreso */
  loading: boolean;
  /** Mensaje de error o null si no hay error */
  error: string | null;
  /** Indica si el evento no fue encontrado (404) */
  notFound: boolean;
}

// ---------------------------------------------------------------------------
// useEvents
// ---------------------------------------------------------------------------

/**
 * Obtiene la lista de eventos públicos desde Firestore.
 *
 * Se ejecuta automáticamente al montar el componente.
 * Proporciona un método `reload()` para refrescar la lista manualmente.
 *
 * @param maxResults - Límite opcional de resultados.
 * @returns Estado con events[], loading, error y reload().
 *
 * @example
 * const { events, loading, error } = useEvents();
 * const { events: latest } = useEvents(6);
 */
export function useEvents(maxResults?: number): UseEventsState {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Flag para evitar actualizar estado si el componente se desmonta
  let cancelled = false;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPublicEvents(maxResults);

      if (cancelled) return;

      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        setError(response.error || 'Error al cargar eventos.');
        setEvents([]);
      }
    } catch (err) {
      if (cancelled) return;
      setError('Error inesperado al cargar eventos.');
      setEvents([]);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }, [maxResults]);

  useEffect(() => {
    cancelled = false;
    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [fetchEvents]);

  return { events, loading, error, reload: fetchEvents };
}

// ---------------------------------------------------------------------------
// useEvent
// ---------------------------------------------------------------------------

/**
 * Obtiene un evento individual por su slug desde Firestore.
 *
 * Se ejecuta automáticamente al montar el componente y cada vez
 * que cambie el slug.
 *
 * @param slug - Slug único del evento.
 * @returns Estado con event, loading, error y notFound.
 *
 * @example
 * const { event, loading, notFound } = useEvent('neon-sessions');
 *
 * if (notFound) return <p>Evento no encontrado</p>;
 * if (loading) return <Spinner />;
 * return <h1>{event?.title}</h1>;
 */
export function useEvent(slug: string | undefined): UseEventState {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  // Flag para evitar actualizar estado si el componente se desmonta
  let cancelled = false;

  useEffect(() => {
    cancelled = false;

    if (!slug) {
      setLoading(false);
      setNotFound(true);
      setEvent(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);
    setEvent(null);

    const fetchEvent = async () => {
      try {
        const response = await getEventBySlug(slug!);

        if (cancelled) return;

        if (response.success && response.data) {
          setEvent(response.data);
          setNotFound(false);
        } else if (response.code === 'not-found') {
          setEvent(null);
          setNotFound(true);
          setError(null);
        } else {
          setError(response.error || 'Error al cargar el evento.');
          setEvent(null);
        }
      } catch (err) {
        if (cancelled) return;
        setError('Error inesperado al cargar el evento.');
        setEvent(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchEvent();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { event, loading, error, notFound };
}

// ---------------------------------------------------------------------------
// useOrganizerEvents
// ---------------------------------------------------------------------------

/** Estado retornado por useOrganizerEvents() */
export interface UseOrganizerEventsState {
  /** Lista de eventos del organizador */
  events: EventFromApi[];
  /** Indica si la carga está en progreso */
  loading: boolean;
  /** Mensaje de error o null si no hay error */
  error: string | null;
  /** Recarga los eventos manualmente */
  reload: () => void;
}

/**
 * Obtiene los eventos del organizador autenticado desde la API NestJS.
 *
 * Se ejecuta automáticamente al montar el componente.
 * Proporciona un método `reload()` para refrescar la lista manualmente,
 * útil después de crear o eliminar un evento.
 *
 * @returns Estado con events[], loading, error y reload().
 *
 * @example
 * const { events, loading, error, reload } = useOrganizerEvents();
 *
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage message={error} />;
 * if (events.length === 0) return <EmptyState onCreate={...} />;
 * return <EventList events={events} />;
 */
export function useOrganizerEvents(): UseOrganizerEventsState {
  const [events, setEvents] = useState<EventFromApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  let cancelled = false;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMyEvents();

      if (cancelled) return;

      if (response.success) {
        setEvents(response.data ?? []);
      } else {
        setError(response.error || 'Error al cargar tus eventos.');
        setEvents([]);
      }
    } catch (err) {
      if (cancelled) return;
      setError('Error inesperado al cargar tus eventos.');
      setEvents([]);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    cancelled = false;
    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [fetchEvents]);

  return { events, loading, error, reload: fetchEvents };
}
