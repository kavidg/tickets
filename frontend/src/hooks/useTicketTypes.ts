/**
 * TicketS - useTicketTypes Hook
 *
 * Hook personalizado para consumir tipos de entrada desde Firestore a través de
 * ticketType.service.ts. Los componentes NO deben importar ticketType.service.ts
 * directamente.
 *
 * Arquitectura:
 *   Componente → useTicketTypes(eventId) → ticketType.service.ts → firestore.ts → Firestore
 *
 * Proporciona:
 *   - useTicketTypes(eventId) → obtener tipos de entrada de un evento
 *
 * @example
 * import { useTicketTypes } from '../hooks/useTicketTypes';
 *
 * function TicketSection({ eventId }) {
 *   const { ticketTypes, loading, error } = useTicketTypes(eventId);
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error} />;
 *
 *   return ticketTypes.map(t => (
 *     <div key={t.id}>{t.name} — {t.price}</div>
 *   ));
 * }
 */

import { useState, useEffect, useCallback } from 'react';

import { getTicketTypesByEvent } from '../services/ticketType.service';

import type { TicketType } from '../types/ticketType';
import type { EventResponse } from '../types/event';

// ---------------------------------------------------------------------------
// Tipos del hook
// ---------------------------------------------------------------------------

/** Estado retornado por useTicketTypes() */
export interface UseTicketTypesState {
  /** Lista de tipos de entrada del evento (vacío si loading o error) */
  ticketTypes: TicketType[];
  /** Indica si la carga está en progreso */
  loading: boolean;
  /** Mensaje de error o null si no hay error */
  error: string | null;
  /** Recarga los tipos de entrada manualmente */
  reload: () => void;
  /** Precio mínimo entre todos los tipos de entrada (útil para mostrar "Desde $X") */
  minPrice: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Calcula el precio mínimo entre los tipos de entrada activos.
 * Retorna 0 si no hay tipos de entrada.
 */
function calculateMinPrice(types: TicketType[]): number {
  const activeTypes = types.filter((t) => t.status === 'active');
  if (activeTypes.length === 0) return 0;
  return Math.min(...activeTypes.map((t) => t.price));
}

// ---------------------------------------------------------------------------
// useTicketTypes
// ---------------------------------------------------------------------------

/**
 * Obtiene los tipos de entrada de un evento desde Firestore.
 *
 * Se ejecuta automáticamente al montar el componente y cada vez
 * que cambie el eventId.
 * Proporciona un método `reload()` para refrescar la lista manualmente.
 *
 * @param eventId - ID del evento en Firestore.
 * @returns Estado con ticketTypes[], loading, error, reload() y minPrice.
 *
 * @example
 * const { ticketTypes, loading, error, minPrice } = useTicketTypes(eventId);
 *
 * if (loading) return <Skeleton />;
 * if (error) return <Error message={error} />;
 *
 * // Precio mínimo
 * <p>Desde ${minPrice}</p>
 *
 * // Lista de tipos
 * ticketTypes.map(t => <TicketCard key={t.id} type={t} />);
 */
export function useTicketTypes(eventId: string | undefined): UseTicketTypesState {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Flag para evitar actualizar estado si el componente se desmonta
  let cancelled = false;

  const fetchTicketTypes = useCallback(async () => {
    if (!eventId) {
      setTicketTypes([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: EventResponse<TicketType[]> = await getTicketTypesByEvent(eventId);

      if (cancelled) return;

      if (response.success && response.data) {
        setTicketTypes(response.data);
      } else {
        setError(response.error || 'Error al cargar tipos de entrada.');
        setTicketTypes([]);
      }
    } catch (err) {
      if (cancelled) return;
      setError('Error inesperado al cargar tipos de entrada.');
      setTicketTypes([]);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }, [eventId]);

  useEffect(() => {
    cancelled = false;
    fetchTicketTypes();

    return () => {
      cancelled = true;
    };
  }, [fetchTicketTypes]);

  // Precio mínimo derivado
  const minPrice = calculateMinPrice(ticketTypes);

  return { ticketTypes, loading, error, reload: fetchTicketTypes, minPrice };
}
