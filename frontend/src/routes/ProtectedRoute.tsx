/**
 * TicketS - ProtectedRoute
 *
 * Componente wrapper que protege rutas privadas verificando el estado
 * de autenticación antes de renderizar el contenido.
 *
 * Flujo:
 *   1. Mientras se valida la sesión inicial → muestra indicador de carga.
 *   2. Si no hay sesión activa → redirige a la pantalla de login.
 *   3. Si hay sesión activa → renderiza los componentes hijos.
 *
 * Uso:
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 *
 * Preparado para soportar validación por roles en el futuro
 * mediante la prop opcional `allowedRoles`.
 */

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface ProtectedRouteProps {
  /** Contenido que se renderiza si el usuario está autenticado */
  children: ReactNode;
  /**
   * Lista de roles permitidos (futuro).
   * Cuando se implemente el sistema de roles, si se especifica,
   * solo los usuarios con uno de estos roles podrán acceder.
   *
   * @example
   * <ProtectedRoute allowedRoles={['admin', 'organizer']}>
   *   <AdminPanel />
   * </ProtectedRoute>
   */
  allowedRoles?: string[];
  /**
   * Ruta a la que redirigir si el usuario no está autenticado.
   * @default '#/login'
   */
  redirectTo?: string;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Componente que protege rutas privadas verificando autenticación.
 *
 * @example
 * // Protección básica
 * <ProtectedRoute>
 *   <MiPerfil />
 * </ProtectedRoute>
 *
 * @example
 * // Con redirección personalizada
 * <ProtectedRoute redirectTo="#/acceso-restringido">
 *   <Configuracion />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '#/login',
}: ProtectedRouteProps) {
  const { loading, authenticated } = useAuth();

  // -----------------------------------------------------------------------
  // Redirección si no está autenticado
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!loading && !authenticated) {
      window.location.hash = redirectTo;
    }
  }, [loading, authenticated, redirectTo]);

  // -----------------------------------------------------------------------
  // 1. Estado de carga: mostramos un spinner mientras se valida la sesión
  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          {/* Spinner animado */}
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-luxe-ember/30 border-t-luxe-ember"
            role="status"
            aria-label="Verificando sesión"
          />
          <p className="mt-4 text-sm font-semibold text-red-100/50">
            Verificando sesión…
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
  // 3. Validación de roles (futuro)
  // -----------------------------------------------------------------------
  if (allowedRoles && allowedRoles.length > 0) {
    // TODO: Implementar validación de roles cuando el sistema de roles esté listo.
    // El AuthUser deberá incluir un campo `role` que se comparará con allowedRoles.
    // Ejemplo:
    //   if (!user.role || !allowedRoles.includes(user.role)) {
    //     window.location.hash = '#/unauthorized';
    //     return null;
    //   }
    //
    // Por ahora, los roles no están implementados, así que permitimos el acceso.
  }

  // -----------------------------------------------------------------------
  // 4. Autenticado (y con rol válido en el futuro): renderizar contenido
  // -----------------------------------------------------------------------
  return <>{children}</>;
}
