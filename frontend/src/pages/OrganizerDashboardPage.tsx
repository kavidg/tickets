/**
 * TicketS - OrganizerDashboardPage
 *
 * Panel principal del organizador.
 * Protegida: requiere autenticación (futuro: role organizer).
 */

import Button from '../components/ui/Button';

/**
 * Panel principal del organizador.
 */
export default function OrganizerDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="text-3xl font-black tracking-tight text-white">
        Panel del organizador
      </h1>
      <p className="mt-3 text-red-100/60">
        Administra tus eventos, entradas y reportes de ventas.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4">
        <Button
          href="/organizer/events"
          variant="secondary"
          className="min-w-[240px]"
        >
          Mis eventos
        </Button>
        <Button
          href="/organizer/events/create"
          variant="glow"
          className="min-w-[240px]"
        >
          + Crear evento
        </Button>
        <Button
          href="/organizer/venues"
          variant="secondary"
          className="min-w-[240px]"
        >
          Mis lugares
        </Button>
      </div>
    </main>
  );
}
