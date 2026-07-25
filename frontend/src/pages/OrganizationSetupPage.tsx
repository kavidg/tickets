/**
 * TicketS - OrganizationSetupPage
 *
 * Página de onboarding para crear la primera organización.
 * Renderiza el formulario de configuración.
 *
 * Protegida: solo usuarios autenticados sin organización pueden verla.
 *
 * @see OrganizationSetupForm para el formulario de creación.
 */

import OrganizationSetupForm from '../components/onboarding/OrganizationSetupForm';

/**
 * Página de configuración inicial de organización.
 *
 * @example
 * // En el router:
 * <ProtectedRoute>
 *   <OrganizationSetupPage />
 * </ProtectedRoute>
 */
export default function OrganizationSetupPage() {
  return (
    <main className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-12">
      {/* Fondos decorativos */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-luxe-wine/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-luxe-ember/10 blur-3xl" />

      <div className="relative w-full max-w-lg">
        <OrganizationSetupForm />
      </div>
    </main>
  );
}
