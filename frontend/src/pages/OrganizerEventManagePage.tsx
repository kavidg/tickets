/**
 * TicketS - OrganizerEventManagePage
 *
 * Página de administración de un evento individual.
 * Muestra la información básica del evento y las acciones de gestión disponibles.
 *
 * Ruta: #/organizer/events/manage/:id
 *
 * @see useOrganizerEvent para el hook de datos.
 * @see EventManageActions para el panel de acciones.
 */

import { useOrganizerEvent } from '../hooks/useOrganizerEvent';
import EventManageActions from '../components/events/EventManageActions';

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
 * Formatea una fecha para mostrar.
 */
function formatDate(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Configuración visual de cada estado del evento.
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
// Estados
// ---------------------------------------------------------------------------

/** Indicador de carga */
function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-luxe-ember/30 border-t-luxe-ember"
        role="status"
        aria-label="Cargando evento"
      />
    </div>
  );
}

/** Evento no encontrado */
function NotFoundState() {
  return (
    <div className="mx-auto max-w-lg rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
      <p className="text-xl font-black text-white">Evento no encontrado</p>
      <p className="mt-2 text-sm text-red-100/50">
        El evento que buscas no existe o no tienes acceso a él.
      </p>
      <a
        href="/organizer/events"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-luxe-ember/30 bg-luxe-wine px-5 py-3 text-sm font-bold text-white shadow-xl shadow-black/35 transition hover:bg-luxe-crimson"
      >
        ← Volver a mis eventos
      </a>
    </div>
  );
}

/** Error al cargar */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-[1.75rem] border border-dashed border-red-500/30 bg-red-500/8 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
      <p className="text-lg font-black text-red-300">Error al cargar el evento</p>
      <p className="mt-2 text-sm text-red-100/55">{message}</p>
      <a
        href="/organizer/events"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-luxe-ember/30 bg-luxe-wine px-5 py-3 text-sm font-bold text-white shadow-xl shadow-black/35 transition hover:bg-luxe-crimson"
      >
        ← Volver a mis eventos
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

/**
 * Página de administración de un evento.
 * Extrae el ID del evento del pathname y lo pasa al hook useOrganizerEvent.
 */
export default function OrganizerEventManagePage() {
  // Extraer el ID del evento desde el pathname: /organizer/events/manage/<id>
  const match = window.location.pathname.match(
    /^\/organizer\/events\/manage\/(.+)$/,
  );
  const eventId = match ? decodeURIComponent(match[1]) : undefined;

  const { event, loading, error, notFound, reload } =
    useOrganizerEvent(eventId);

  // -----------------------------------------------------------------------
  // Estados de carga / error / no encontrado
  // -----------------------------------------------------------------------
  if (!eventId || notFound) return <NotFoundState />;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!event) return <NotFoundState />;

  const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;
  const startDate = toDate(event.startDate);
  const endDate = toDate(event.endDate);

  // -----------------------------------------------------------------------
  // Render principal
  // -----------------------------------------------------------------------
  return (
    <main className="relative mx-auto max-w-5xl px-4 py-12">
      {/* Fondos decorativos */}
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-luxe-wine/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-luxe-ember/10 blur-3xl" />

      <div className="relative">
        {/* Navegación superior */}
        <a
          href="/organizer/events"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-red-100/50 transition hover:text-luxe-ember"
        >
          ← Mis eventos
        </a>

        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-luxe-ember">
              Gestión de evento
            </p>
            <span
              className={`rounded-full border px-3 py-0.5 text-xs font-bold ${statusCfg.className}`}
            >
              {statusCfg.label}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            {event.title}
          </h1>
          <p className="mt-2 text-red-100/60">
            {event.city}
            {event.city && event.address ? ' · ' : ''}
            {event.address || ''}
          </p>
        </div>

        {/* Hero / Imagen + Info */}
        <div className="mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/35 backdrop-blur-xl">
          <div className="grid gap-6 md:grid-cols-5">
            {/* Imagen */}
            <div className="relative h-48 overflow-hidden md:col-span-2 md:h-full md:min-h-[240px]">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-luxe-black/60">
                  <span className="text-5xl opacity-20">🎪</span>
                </div>
              )}
            </div>

            {/* Detalles */}
            <div className="flex flex-col justify-center gap-4 p-6 md:col-span-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-100/40">
                    Fecha de inicio
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {formatDate(startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-100/40">
                    Fecha de fin
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {formatDate(endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-100/40">
                    Ciudad
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {event.city || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-100/40">
                    Dirección
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {event.address || '—'}
                  </p>
                </div>
              </div>

              {event.description && (
                <div className="border-t border-white/5 pt-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-100/40">
                    Descripción
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-red-100/70 line-clamp-3">
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel de acciones */}
        <section>
          <div className="mb-6">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-luxe-ember">
              Acciones
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
              Administrar evento
            </h2>
            <p className="mt-1 text-sm text-red-100/60">
              Selecciona una acción para gestionar este evento
            </p>
          </div>
          <EventManageActions eventId={event.id} eventSlug={event.slug} />
        </section>
      </div>
    </main>
  );
}
