/**
 * TicketS - ProtectedRoute
 *
 * Componente wrapper que protege rutas privadas verificando el estado
 * de autenticación antes de renderizar el contenido.
 *
 * Flujo:
 *   1. Mientras se valida la sesión inicial → muestra indicador de carga.
 *   2. Si no hay sesión activa → redirige a la pantalla de login.
 *   3. Si hay sesión activa →
 *      a. GET /api/v1/profile → si 404, POST /api/v1/profile
 *      b. GET /api/v1/profile/organization → si existe, ready; si no, needs_setup
 *   4. Renderiza los componentes hijos.
 *
 * El perfil se consulta primero. Solo si responde 404 se crea.
 * Nunca se intenta crear un perfil que ya existe.
 * No hay retries ni timeouts de seguridad.
 *
 * Uso:
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 */

import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import auth from '../firebase/auth';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const API_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface ProtectedRouteProps {
  /** Contenido que se renderiza si el usuario está autenticado */
  children: ReactNode;
  /**
   * Lista de roles permitidos (futuro).
   */
  allowedRoles?: string[];
  /**
   * Ruta a la que redirigir si el usuario no está autenticado.
   * @default '/login'
   */
  redirectTo?: string;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { loading, authenticated } = useAuth();

  // Estado del onboarding: 'idle' | 'checking' | 'needs_setup' | 'ready'
  const [onboardingStatus, setOnboardingStatus] = useState<
    'idle' | 'checking' | 'needs_setup' | 'ready'
  >('idle');
  const checkedRef = useRef(false);

  // -----------------------------------------------------------------------
  // Redirección si no está autenticado
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!loading && !authenticated) {
      window.location.href = redirectTo;
    }
  }, [loading, authenticated, redirectTo]);

  // -----------------------------------------------------------------------
  // Verificar perfil y organización (una sola vez por sesión)
  // -----------------------------------------------------------------------
  // -----------------------------------------------------------------------
  // Verificar perfil y organización (una sola vez por sesión)
  // -----------------------------------------------------------------------
  // Nota: NO se usa la bandera `cancelled` para evitar que el componente
  // quede atascado en 'checking' si el efecto se re-ejecuta mientras
  // checkOnboarding() está en medio de una operación asíncrona.
  // React maneja correctamente los setState en componentes desmontados.
  useEffect(() => {
    if (!authenticated || checkedRef.current) return;
    checkedRef.current = true;

    async function checkOnboarding() {
      console.log('[ProtectedRoute] START');
      setOnboardingStatus('checking');

      try {
        // auth.currentUser ya está disponible porque authenticated === true
        const user = auth.currentUser;
        if (!user) {
          console.log('[ProtectedRoute] No currentUser — forcing ready');
          setOnboardingStatus('ready');
          return;
        }

        const token = await user.getIdToken();
        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // 1. Verificar perfil en el backend
        console.log('[ProtectedRoute] GET PROFILE');
        const profileRes = await fetch(`${API_URL}/profile`, { headers });
        console.log('[ProtectedRoute] PROFILE RESPONSE:', profileRes.status);

        if (profileRes.status === 404) {
          // Perfil no existe → crearlo automáticamente
          console.log('[ProtectedRoute] Profile 404 — creating');
          await fetch(`${API_URL}/profile`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              displayName: user.displayName || user.email?.split('@')[0] || '',
            }),
          });
          console.log('[ProtectedRoute] Profile created');
        } else if (!profileRes.ok) {
          // Error inesperado de API — permitir acceso igual
          console.log('[ProtectedRoute] Profile error — forcing ready');
          setOnboardingStatus('ready');
          return;
        }

        // 2. Verificar organización
        console.log('[ProtectedRoute] CHECK ORGANIZATION');
        const orgRes = await fetch(`${API_URL}/profile/organization`, { headers });
        console.log('[ProtectedRoute] ORGANIZATION RESPONSE:', orgRes.status);

        if (orgRes.ok) {
          const orgBody = await orgRes.json();
          console.log('[ProtectedRoute] ORG BODY:', JSON.stringify(orgBody));
          if (orgBody?.data?.id) {
            console.log('[ProtectedRoute] SETTING READY — organization found');
            setOnboardingStatus('ready');
            return;
          }
        }

        // Sin organización → necesita setup
        console.log('[ProtectedRoute] SETTING STATUS: needs_setup');
        setOnboardingStatus('needs_setup');
      } catch (err) {
        console.log('[ProtectedRoute] ERROR — forcing ready:', err);
        setOnboardingStatus('ready');
      }
    }

    checkOnboarding();
  }, [authenticated]);

  // -----------------------------------------------------------------------
  // 1. Estado de carga: mientras AuthContext valida o verificamos onboarding
  // -----------------------------------------------------------------------
  if (loading || onboardingStatus === 'checking') {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-luxe-ember/30 border-t-luxe-ember"
            role="status"
            aria-label="Verificando sesión"
          />
          <p className="mt-4 text-sm font-semibold text-red-100/50">
            {onboardingStatus === 'checking'
              ? 'Verificando tu organización…'
              : 'Verificando sesión…'}
          </p>
        </div>
      </main>
    );
  }

  // -----------------------------------------------------------------------
  // 2. No autenticado: no renderizar nada (el useEffect redirige)
  // -----------------------------------------------------------------------
  if (!authenticated) {
    return null;
  }

  // -----------------------------------------------------------------------
  // 3. Necesita setup: redirigir al onboarding o renderizar setup page
  // -----------------------------------------------------------------------
  if (onboardingStatus === 'needs_setup') {
    if (window.location.pathname === '/organization/setup') {
      return <>{children}</>;
    }
    window.location.href = '/organization/setup';
    return null;
  }

  // -----------------------------------------------------------------------
  // 4. Validación de roles (futuro)
  // -----------------------------------------------------------------------
  if (allowedRoles && allowedRoles.length > 0) {
    // TODO: Implementar validación de roles cuando el sistema de roles esté listo.
  }

  // -----------------------------------------------------------------------
  // 5. Autenticado, con organización: renderizar
  // -----------------------------------------------------------------------
  return <>{children}</>;
}
