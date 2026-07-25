/**
 * TicketS - useVenues Hook
 *
 * Hook personalizado para consumir venues desde la API NestJS.
 *
 * Proporciona:
 *   - useVenues()       → hook público (todos los venues activos)
 *   - useMyVenues()     → auth, venues activos de la organización
 *   - useAdminVenues()  → auth, CRUD completo de venues de la organización
 */

import { useState, useEffect, useCallback } from 'react';

import {
  getPublicVenuesApi,
  getMyVenuesApi,
  getAllVenuesApi,
  createVenueApi,
  updateVenueApi,
  deleteVenueApi,
} from '../services/venue.service';

import type {
  VenueFromApi,
  CreateVenueData,
  UpdateVenueData,
} from '../services/venue.service';

// ---------------------------------------------------------------------------
// Tipos del hook público
// ---------------------------------------------------------------------------

export interface UseVenuesState {
  venues: VenueFromApi[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

// ---------------------------------------------------------------------------
// Tipos del hook admin
// ---------------------------------------------------------------------------

export interface UseAdminVenuesState {
  venues: VenueFromApi[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  reload: () => void;
  createVenue: (data: CreateVenueData) => Promise<boolean>;
  updateVenue: (id: string, data: UpdateVenueData) => Promise<boolean>;
  deleteVenue: (id: string) => Promise<boolean>;
}

// ---------------------------------------------------------------------------
// useVenues (público)
// ---------------------------------------------------------------------------

/**
 * Obtiene todos los venues activos desde el endpoint público.
 */
export function useVenues(): UseVenuesState {
  const [venues, setVenues] = useState<VenueFromApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  let cancelled = false;

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPublicVenuesApi();
      if (cancelled) return;
      if (response.success && response.data) {
        setVenues(response.data);
      } else {
        setError(response.error || 'Error al cargar lugares.');
        setVenues([]);
      }
    } catch {
      if (cancelled) return;
      setError('Error inesperado al cargar lugares.');
      setVenues([]);
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cancelled = false;
    fetchVenues();
    return () => { cancelled = true; };
  }, [fetchVenues]);

  return { venues, loading, error, reload: fetchVenues };
}

// ---------------------------------------------------------------------------
// useMyVenues (auth, activos de la org)
// ---------------------------------------------------------------------------

/**
 * Obtiene los venues activos de la organización del usuario autenticado.
 */
export function useMyVenues(): UseVenuesState {
  const [venues, setVenues] = useState<VenueFromApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  let cancelled = false;

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMyVenuesApi();

      console.log('[useMyVenues] API response:', JSON.stringify({
        success: response.success,
        count: response.data?.length ?? 0,
        error: response.error,
        firstItem: response.data?.[0] ? { id: response.data[0].id, name: response.data[0].name, orgId: response.data[0].organizationId, active: response.data[0].active } : null,
      }));

      if (cancelled) return;
      if (response.success) {
        setVenues(response.data ?? []);
      } else {
        setError(response.error || 'Error al cargar lugares.');
        setVenues([]);
      }
    } catch {
      if (cancelled) return;
      setError('Error inesperado al cargar lugares.');
      setVenues([]);
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cancelled = false;
    fetchVenues();
    return () => { cancelled = true; };
  }, [fetchVenues]);

  return { venues, loading, error, reload: fetchVenues };
}

// ---------------------------------------------------------------------------
// useAdminVenues (auth, CRUD completo)
// ---------------------------------------------------------------------------

/**
 * Hook de administración de venues con CRUD completo.
 */
export function useAdminVenues(): UseAdminVenuesState {
  const [venues, setVenues] = useState<VenueFromApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  let cancelled = false;

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAllVenuesApi();
      if (cancelled) return;
      if (response.success) {
        setVenues(response.data ?? []);
      } else {
        setError(response.error || 'Error al cargar lugares.');
        setVenues([]);
      }
    } catch {
      if (cancelled) return;
      setError('Error inesperado al cargar lugares.');
      setVenues([]);
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cancelled = false;
    fetchVenues();
    return () => { cancelled = true; };
  }, [fetchVenues]);

  const createVenue = useCallback(async (data: CreateVenueData): Promise<boolean> => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await createVenueApi(data);
      if (cancelled) return false;
      if (response.success && response.data) {
        setVenues((prev) => [...prev, response.data!]);
        setSuccessMessage('Lugar creado correctamente.');
        return true;
      } else {
        setError(response.error || 'Error al crear el lugar.');
        return false;
      }
    } catch {
      if (cancelled) return false;
      setError('Error inesperado al crear el lugar.');
      return false;
    } finally {
      if (!cancelled) setSaving(false);
    }
  }, []);

  const updateVenue = useCallback(async (id: string, data: UpdateVenueData): Promise<boolean> => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await updateVenueApi(id, data);
      if (cancelled) return false;
      if (response.success && response.data) {
        setVenues((prev) => prev.map((v) => (v.id === id ? response.data! : v)));
        setSuccessMessage('Lugar actualizado correctamente.');
        return true;
      } else {
        setError(response.error || 'Error al actualizar el lugar.');
        return false;
      }
    } catch {
      if (cancelled) return false;
      setError('Error inesperado al actualizar el lugar.');
      return false;
    } finally {
      if (!cancelled) setSaving(false);
    }
  }, []);

  const deleteVenue = useCallback(async (id: string): Promise<boolean> => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await deleteVenueApi(id);
      if (cancelled) return false;
      if (response.success) {
        setVenues((prev) => prev.filter((v) => v.id !== id));
        setSuccessMessage('Lugar eliminado correctamente.');
        return true;
      } else {
        setError(response.error || 'Error al eliminar el lugar.');
        return false;
      }
    } catch {
      if (cancelled) return false;
      setError('Error inesperado al eliminar el lugar.');
      return false;
    } finally {
      if (!cancelled) setSaving(false);
    }
  }, []);

  return {
    venues,
    loading,
    saving,
    error,
    successMessage,
    reload: fetchVenues,
    createVenue,
    updateVenue,
    deleteVenue,
  };
}
