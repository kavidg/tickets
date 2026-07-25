/**
 * TicketS - useOrganizationSetup Hook
 *
 * Hook para el flujo de onboarding de organización.
 * Encapsula las llamadas HTTP al backend NestJS para:
 *   - Verificar perfil del usuario autenticado
 *   - Consultar organización asociada
 *   - Crear organización + asociarla al perfil
 *
 * Arquitectura:
 *   Componente → useOrganizationSetup → fetch (NestJS API backend) → Firestore
 *
 * Endpoints consumidos:
 *   GET  /api/v1/profile              → perfil del usuario autenticado
 *   GET  /api/v1/profile/organization → organización asociada
 *   POST /api/v1/organizations/setup  → crear organización + asociar perfil
 */

import { useState, useCallback } from 'react';
import auth from '../firebase/auth';
import { createUserProfile } from '../services/user.service';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface SetupOrganizationData {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface OrganizationSetupState {
  /** Indica si hay una operación en curso */
  loading: boolean;
  /** Mensaje de error legible (o null si no hay error) */
  error: string | null;
  /** Indica si se está verificando la organización inicial */
  checkingOrganization: boolean;
  /** Indica si el usuario ya tiene organización */
  hasOrganization: boolean | null;
  /** Indica si el perfil fue creado automáticamente */
  profileCreated: boolean;
}

export interface SetupResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    slug: string;
  };
  error?: string;
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
 * Obtiene el token JWT de Firebase Auth para autenticar las llamadas al backend.
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

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook para el flujo de onboarding de organización.
 *
 * @returns Estado y funciones del onboarding.
 *
 * @example
 * const {
 *   loading, error,
 *   checkingOrganization, hasOrganization,
 *   createOrganization, checkOrganizationStatus,
 * } = useOrganizationSetup();
 *
 * const handleSubmit = async (data) => {
 *   const result = await createOrganization(data);
 *   if (result.success) {
 *     window.location.href = '/organizer/dashboard';
 *   }
 * };
 */
export function useOrganizationSetup() {
  const [state, setState] = useState<OrganizationSetupState>({
    loading: false,
    error: null,
    checkingOrganization: false,
    hasOrganization: null,
    profileCreated: false,
  });

  // -----------------------------------------------------------------------
  // Verificar organización del usuario
  // -----------------------------------------------------------------------

  /**
   * Verifica si el usuario autenticado ya tiene un perfil y una organización.
   *
   * Flujo:
   *   1. GET /profile → si 404, crear perfil automáticamente
   *   2. GET /profile/organization → si existe, hasOrganization = true
   *
   * @returns boolean indicando si el usuario tiene organización.
   */
  const checkOrganizationStatus = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, checkingOrganization: true, error: null }));

    try {
      const token = await getAuthToken();
      if (!token) {
        setState((prev) => ({
          ...prev,
          checkingOrganization: false,
          hasOrganization: false,
        }));
        return false;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // 1. Verificar perfil
      const profileRes = await fetch(`${API_URL}/profile`, { headers });

      if (profileRes.status === 404) {
        // Perfil no encontrado → crearlo automáticamente
        const currentUser = auth.currentUser;
        if (currentUser) {
          const profileResponse = await createUserProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || '',
          });

          if (profileResponse.success) {
            setState((prev) => ({ ...prev, profileCreated: true }));
          }
        }
      } else if (profileRes.status === 401) {
        // Token inválido — no bloquear
        setState((prev) => ({
          ...prev,
          checkingOrganization: false,
          hasOrganization: false,
        }));
        return false;
      }

      // 2. Verificar organización
      const orgRes = await fetch(`${API_URL}/profile/organization`, { headers });

      if (orgRes.ok) {
        const orgData = await orgRes.json();

        // La API responde con { success, data } gracias al ResponseInterceptor
        if (orgData?.data?.id) {
          setState((prev) => ({
            ...prev,
            checkingOrganization: false,
            hasOrganization: true,
          }));
          return true;
        }
      }

      // Sin organización
      setState((prev) => ({
        ...prev,
        checkingOrganization: false,
        hasOrganization: false,
      }));
      return false;
    } catch (err) {
      // Error de red o API caída — permitir acceso igual
      setState((prev) => ({
        ...prev,
        checkingOrganization: false,
        hasOrganization: null, // Desconocido
        error: null, // No mostrar error para no bloquear
      }));
      return false;
    }
  }, []);

  // -----------------------------------------------------------------------
  // Crear organización
  // -----------------------------------------------------------------------

  /**
   * Crea una organización y la asocia al perfil del usuario autenticado.
   *
   * @param data - Datos del formulario de onboarding.
   * @returns SetupResponse con resultado de la operación.
   */
  const createOrganization = useCallback(
    async (data: SetupOrganizationData): Promise<SetupResponse> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const token = await getAuthToken();
        if (!token) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: 'Debes iniciar sesión para crear una organización.',
          }));
          return {
            success: false,
            error: 'Debes iniciar sesión para crear una organización.',
          };
        }

        const response = await fetch(`${API_URL}/organizations/setup`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          const errorMsg =
            result?.message ||
            (typeof result?.error === 'string' ? result.error : null) ||
            result?.data?.error ||
            result?.error ||
            'Error al crear la organización.';

          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMsg,
          }));

          return { success: false, error: errorMsg };
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
          hasOrganization: true,
        }));

        return {
          success: true,
          data: result?.data || result,
        };
      } catch (err) {
        const errorMsg =
          err instanceof TypeError
            ? 'No se pudo conectar con el servidor. Verifica tu conexión.'
            : 'Error inesperado al crear la organización.';

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMsg,
        }));

        return { success: false, error: errorMsg };
      }
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Limpiar error
  // -----------------------------------------------------------------------

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // -----------------------------------------------------------------------
  // Retorno
  // -----------------------------------------------------------------------

  return {
    ...state,
    createOrganization,
    checkOrganizationStatus,
    clearError,
  };
}
