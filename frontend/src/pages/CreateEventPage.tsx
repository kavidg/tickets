/**
 * TicketS - CreateEventPage
 *
 * Página de creación de eventos para el organizador.
 * Renderiza el formulario completo con secciones de información,
 * lugar, fecha, imagen y estado.
 *
 * Protegida: solo usuarios autenticados con organización.
 *
 * @see CreateEventForm para el formulario de creación.
 */

import CreateEventForm from '../components/events/CreateEventForm';

/**
 * Página de creación de eventos.
 *
 * @example
 * // En el router:
 * <ProtectedRoute>
 *   <CreateEventPage />
 * </ProtectedRoute>
 */
export default function CreateEventPage() {
  return (
    <main className="relative mx-auto max-w-2xl px-4 py-12">
      {/* Fondos decorativos */}
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-luxe-wine/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-luxe-ember/10 blur-3xl" />

      <div className="relative">
        <CreateEventForm />
      </div>
    </main>
  );
}
