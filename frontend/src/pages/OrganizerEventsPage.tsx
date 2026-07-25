/**
 * TicketS - OrganizerEventsPage
 *
 * Página de listado de eventos del organizador.
 * Consume la API NestJS (GET /api/v1/events/my) a través del hook
 * useOrganizerEvents().
 *
 * Estados manejados:
 *   - Loading: spinner animado
 *   - Error:   mensaje amigable con reintento
 *   - Vacío:   mensaje + botón para crear primer evento
 *   - Datos:   grid de tarjetas de eventos
 *
 * @see useOrganizerEvents para el hook de datos.
 * @see OrganizerDashboardPage para el panel principal.
 */

import { useOrganizerEvents } from '../hooks/useEvents';
import Button from '../components/ui/Button';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convierte un timestamp de Firestore Admin ({ _seconds }) a objeto Date.
 */
function toDate(ts: { _seconds: number } | undefined): Date | null {
  if (!ts || typeof ts._seconds !== 'number') return null;
  return new Date(ts._seconds * 1000);
}

/**
 * Formatea una fecha para mostrar (ej: "15 de marzo, 2026").
 */
function formatDate(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Etiquetas y colores para cada estado del evento.
 */
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: {
    label: 'Borrador',
    className: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  },
  published: {
    label: 'Publicado',
    className: 'bg-green-500/15 text-green-300 border-green-500/25',
  },
  finished: {
    label: 'Finalizado',
    className: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-500/15 text-red-300 border-red-500/25',
  },
};

// ---------------------------------------------------------------------------
// Subcomponentes de estado
// ---------------------------------------------------------------------------

/** Esqueleto de carga con efecto shimmer */
function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/35 backdrop-blur-xl"
        >
          <div className="h-44 w-full bg-white/5" />
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="h-5 w-20 rounded-full bg-white/8" />
              <div className="h-6 w-16 rounded bg-white/8" />
            </div>
            <div className="h-6 w-3/4 rounded bg-white/8" />
            <div className="space-y-2">
              <div className="h-4 w-1/2 rounded bg-white/8" />
              <div className="h-4 w-2/3 rounded bg-white/8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mensaje de error con opción de reintentar */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-red-500/30 bg-red-500/8 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
      <p className="text-lg font-black text-red-300">No pudimos cargar tus eventos</p>
      <p className="mt-2 text-red-100/55">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-brand/30 bg-brand-muted px-5 py-3 text-sm font-bold text-white shadow-xl shadow-black/35 transition hover:bg-brand hover:shadow-glow"
      >
        Reintentar
      </button>
    </div>
  );
}

/** Estado vacío: sin eventos creados */
function EmptyState() {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] p-12 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
        <span className="text-2xl">🎫</span>
      </div>
      <p className="text-xl font-black text-white">Aún no tienes eventos creados</p>
      <p className="mt-2 text-sm text-red-100/50">
        Crea tu primer evento y comienza a vender entradas.
      </p>
      <div className="mt-6">
        <Button href="/organizer/events/create" variant="glow">
          + Crear evento
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

/**
 * Página de listado de eventos del organizador.
 */
export default function OrganizerEventsPage() {
  const { events, loading, error, reload } = useOrganizerEvents();

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-12">
      {/* Fondos decorativos */}
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-brand-muted/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative">
        {/* Encabezado */}
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-brand">
            Organizador
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Mis eventos</h1>
          <p className="mt-2 text-red-100/60">Administra tus eventos creados</p>
        </div>

        {/* Barra de acciones */}
        <div className="mb-8 flex items-center justify-between gap-4">
          {!loading && !error && events.length > 0 && (
            <p className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-red-100/65 shadow-lg shadow-black/25 backdrop-blur-xl">
              {events.length} {events.length === 1 ? 'evento' : 'eventos'}
            </p>
          )}
          <div className="ml-auto">
            <Button href="/organizer/events/create" variant="glow">
              + Crear evento
            </Button>
          </div>
        </div>

        {/* Contenido según estado */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;
              const startDate = toDate(event.startDate);

              return (
                <div
                  key={event.id}
                  className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/35 backdrop-blur-xl transition hover:border-brand/30"
                >
                  {/* Imagen */}
                  <div className="relative h-44 w-full overflow-hidden bg-neutral-900/80">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-4xl opacity-30">🎪</span>
                      </div>
                    )}
                    {/* Badge de estado */}
                    <span
                      className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-xs font-bold shadow-lg shadow-black/30 ${statusCfg.className}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Información */}
                  <div className="p-5">
                    <h3 className="text-lg font-black tracking-tight text-white">
                      {event.title}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-sm text-red-100/60">
                      {event.city && (
                        <p className="flex items-center gap-2">
                          <span className="opacity-50">📍</span>
                          {event.city}
                        </p>
                      )}
                      {startDate && (
                        <p className="flex items-center gap-2">
                          <span className="opacity-50">📅</span>
                          {formatDate(startDate)}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="mt-5 flex items-center gap-3">
                      <a
                        href={`/event/${event.slug}`}
                        className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-red-100/70 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-brand/40 hover:text-brand"
                      >
                        Ver
                      </a>
                      <a
                        href={`/organizer/events/manage/${event.id}`}
                        className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-red-100/70 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-brand/40 hover:text-brand"
                      >
                        Gestionar
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
