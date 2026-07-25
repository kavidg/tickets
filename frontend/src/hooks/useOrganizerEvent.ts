/**
 * TicketS - useOrganizerEvent Hook
 *
 * Hook personalizado para obtener un evento individual del organizador
 * por su ID desde la API NestJS.
 *
 * Arquitectura:
 *   Componente → useOrganizerEvent(id) → events.service.ts → API NestJS → Firestore
 *
 * @example
 * import { useOrganizerEvent } from '../hooks/useOrganizerEvent';
 *
 * function EventManager() {
 *   const { event, loading, error, notFound, reload } = useOrganizerEvent('abc123');
 *   if (loading) return <Spinner />;
 *   if (notFound) return <NotFound />;
 *   if (error) return <Error message={error} />;
 *   return <ManageView event={event} />;
 * }
 */

import { useState, useEffect, useCallback } from 'react';

import { getEventById } from '../services/events.service';
import type { EventFromApi } from '../services/events.service';

// ---------------------------------------------------------------------------
// Tipos del hook
// ---------------------------------------------------------------------------

/** Estado retornado por useOrganizerEvent() */
export interface UseOrganizerEventState {
  /** Evento encontrado o null si no se ha cargado / no existe */
  event: EventFromApi | null;
  /** Indica si la carga está en progreso */
  loading: boolean;
  /** Mensaje de error o null si no hay error */
  error: string | null;
  /** Indica si el evento no fue encontrado (404) */
  notFound: boolean;
  /** Recarga el evento manualmente */
  reload: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Obtiene un evento del organizador por su ID desde la API NestJS.
 *
 * Se ejecuta automáticamente al montar el componente y cada vez
 * que cambie el ID.
 *
 * @param id - ID del evento en Firestore (o undefined si no está disponible).
 * @returns Estado con event, loading, error, notFound y reload().
 *
 * @example
 * const { event, loading, notFound } = useOrganizerEvent('abc123');
 * if (notFound) return <p>Evento no encontrado</p>;
 * if (loading) return <Spinner />;
 * return <h1>{event?.title}</h1>;
 */
export function useOrganizerEvent(id: string | undefined): UseOrganizerEventState {
  const [event, setEvent] = useState<EventFromApi | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  let cancelled = false;

  const fetchEvent = useCallback(async () => {
    if (!id) {
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

    try {
      const response = await getEventById(id);

      if (cancelled) return;

      if (response.success && response.data) {
        setEvent(response.data);
        setNotFound(false);
      } else {
        setNotFound(true);
        setEvent(null);
        setError(response.error || 'Evento no encontrado.');
      }
    } catch (err) {
      if (cancelled) return;
      setError('Error inesperado al cargar el evento.');
      setEvent(null);
      setNotFound(false);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    cancelled = false;
    fetchEvent();

    return () => {
      cancelled = true;
    };
  }, [fetchEvent]);

  return { event, loading, error, notFound, reload: fetchEvent };
}
