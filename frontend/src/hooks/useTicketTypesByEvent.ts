/**
 * TicketS - useTicketTypesByEvent Hook
 *
 * Hook personalizado para administrar tipos de entrada de un evento
 * a través de la API NestJS.
 *
 * Arquitectura:
 *   Componente → useTicketTypesByEvent() → ticketTypeApi.service.ts → API NestJS → Firestore
 *
 * Proporciona:
 *   - ticketTypes, loading, error, reload
 *   - createTicketType(data)
 *   - updateTicketType(id, data)
 *   - deleteTicketType(id)
 */

import { useState, useEffect, useCallback } from 'react';

import {
  getTicketTypesByEventApi,
  createTicketTypeApi,
  updateTicketTypeApi,
  deleteTicketTypeApi,
} from '../services/ticketType.service';

import type { TicketTypeFromApi } from '../services/ticketType.service';

// ---------------------------------------------------------------------------
// Tipos del hook
// ---------------------------------------------------------------------------

/** Estado retornado por useTicketTypesByEvent() */
export interface UseTicketTypesByEventState {
  /** Lista de tipos de entrada del evento */
  ticketTypes: TicketTypeFromApi[];
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
  /** Crea un nuevo tipo de entrada */
  createTicketType: (data: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    organizationId: string;
    salesStartDate?: string;
    salesEndDate?: string;
  }) => Promise<boolean>;
  /** Actualiza un tipo de entrada existente */
  updateTicketType: (
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      quantity?: number;
      status?: string;
      salesStartDate?: string;
      salesEndDate?: string;
    },
  ) => Promise<boolean>;
  /** Elimina un tipo de entrada */
  deleteTicketType: (id: string) => Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook para administrar tipos de entrada de un evento mediante la API NestJS.
 *
 * @param eventId - ID del evento en Firestore.
 * @returns Estado con ticketTypes[], loading, saving, error, successMessage,
 *          reload(), createTicketType(), updateTicketType(), deleteTicketType().
 */
export function useTicketTypesByEvent(
  eventId: string | undefined,
): UseTicketTypesByEventState {
  const [ticketTypes, setTicketTypes] = useState<TicketTypeFromApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  let cancelled = false;

  // -----------------------------------------------------------------------
  // Cargar tipos de entrada
  // -----------------------------------------------------------------------
  const fetchTicketTypes = useCallback(async () => {
    if (!eventId) {
      setTicketTypes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getTicketTypesByEventApi(eventId);

      if (cancelled) return;

      if (response.success) {
        setTicketTypes(response.data ?? []);
      } else {
        setError(response.error || 'Error al cargar tipos de entrada.');
        setTicketTypes([]);
      }
    } catch {
      if (cancelled) return;
      setError('Error inesperado al cargar tipos de entrada.');
      setTicketTypes([]);
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    cancelled = false;
    fetchTicketTypes();
    return () => {
      cancelled = true;
    };
  }, [fetchTicketTypes]);

  // -----------------------------------------------------------------------
  // Crear tipo de entrada
  // -----------------------------------------------------------------------
  const createTicketType = useCallback(
    async (data: {
      name: string;
      description: string;
      price: number;
      quantity: number;
      organizationId: string;
      salesStartDate?: string;
      salesEndDate?: string;
    }): Promise<boolean> => {
      if (!eventId) return false;

      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await createTicketTypeApi({
          ...data,
          eventId,
        });

        if (cancelled) return false;

        if (response.success && response.data) {
          setTicketTypes((prev) => [...prev, response.data!]);
          setSuccessMessage('Tipo de entrada creado correctamente.');
          return true;
        } else {
          setError(response.error || 'Error al crear tipo de entrada.');
          return false;
        }
      } catch {
        if (cancelled) return false;
        setError('Error inesperado al crear tipo de entrada.');
        return false;
      } finally {
        if (!cancelled) setSaving(false);
      }
    },
    [eventId],
  );

  // -----------------------------------------------------------------------
  // Actualizar tipo de entrada
  // -----------------------------------------------------------------------
  const updateTicketType = useCallback(
    async (
      id: string,
      data: {
        name?: string;
        description?: string;
        price?: number;
        quantity?: number;
        status?: string;
        salesStartDate?: string;
        salesEndDate?: string;
      },
    ): Promise<boolean> => {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await updateTicketTypeApi(id, data);

        if (cancelled) return false;

        if (response.success && response.data) {
          setTicketTypes((prev) =>
            prev.map((t) => (t.id === id ? response.data! : t)),
          );
          setSuccessMessage('Tipo de entrada actualizado correctamente.');
          return true;
        } else {
          setError(response.error || 'Error al actualizar tipo de entrada.');
          return false;
        }
      } catch {
        if (cancelled) return false;
        setError('Error inesperado al actualizar tipo de entrada.');
        return false;
      } finally {
        if (!cancelled) setSaving(false);
      }
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Eliminar tipo de entrada
  // -----------------------------------------------------------------------
  const deleteTicketType = useCallback(
    async (id: string): Promise<boolean> => {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await deleteTicketTypeApi(id);

        if (cancelled) return false;

        if (response.success) {
          setTicketTypes((prev) => prev.filter((t) => t.id !== id));
          setSuccessMessage('Tipo de entrada eliminado correctamente.');
          return true;
        } else {
          setError(response.error || 'Error al eliminar tipo de entrada.');
          return false;
        }
      } catch {
        if (cancelled) return false;
        setError('Error inesperado al eliminar tipo de entrada.');
        return false;
      } finally {
        if (!cancelled) setSaving(false);
      }
    },
    [],
  );

  return {
    ticketTypes,
    loading,
    saving,
    error,
    successMessage,
    reload: fetchTicketTypes,
    createTicketType,
    updateTicketType,
    deleteTicketType,
  };
}
