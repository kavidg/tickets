import { ArrowLeft, Calendar, MapPin, Share2, Users } from 'lucide-react';
import TicketSelector from '../features/tickets/components/TicketSelector';
import { useEvent } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';
import { useTicketTypes } from '../hooks/useTicketTypes';
import { formatDate, formatPrice } from '../utils/format.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convierte un Timestamp de Firestore a un valor compatible con formatDate.
 */
function toDateValue(timestamp) {
  if (!timestamp) return new Date().toISOString();
  return timestamp.toDate ? timestamp.toDate() : timestamp;
}

// ---------------------------------------------------------------------------
// Subcomponentes de estado
// ---------------------------------------------------------------------------

/**
 * Estado de carga que mantiene el layout del detalle con shimmer.
 */
function LoadingSkeleton() {
  return (
    <main className="relative animate-pulse overflow-hidden bg-luxe-black">
      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-luxe-wine/25 blur-3xl" />
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-5 w-40 rounded bg-white/8" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-3 shadow-deep-luxe backdrop-blur-xl">
            <div className="h-[24rem] w-full rounded-[1.5rem] bg-white/8 sm:h-[34rem]" />
          </div>
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-deep-luxe backdrop-blur-2xl">
            <div className="mb-5 h-6 w-24 rounded-full bg-white/8" />
            <div className="mt-8 h-10 w-3/4 rounded bg-white/8" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full rounded bg-white/8" />
              <div className="h-4 w-5/6 rounded bg-white/8" />
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-14 w-full rounded-2xl bg-white/8" />
              <div className="h-14 w-full rounded-2xl bg-white/8" />
              <div className="h-14 w-full rounded-2xl bg-white/8" />
            </div>
            <div className="mt-6 h-24 w-full rounded-3xl bg-white/8" />
          </aside>
        </div>
      </section>
    </main>
  );
}

/**
 * Mensaje de error amigable.
 */
function ErrorDisplay({ message }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-luxe-ember">Error</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-white">
        Algo salió mal
      </h1>
      <p className="mt-4 text-red-100/60">{message}</p>
      <a
        className="mt-8 inline-flex items-center gap-2 font-black text-luxe-ember hover:text-red-100"
        href="#/"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al inicio
      </a>
    </main>
  );
}

// ---------------------------------------------------------------------------
// TicketSection (subcomponente para gestión de entradas)
// ---------------------------------------------------------------------------

/**
 * Renderiza la sección de tipos de entrada con sus estados.
 * Conecta useTicketTypes con TicketSelector.
 */
function TicketSection({ eventDocId }) {
  const { ticketTypes, loading, error, minPrice } = useTicketTypes(eventDocId);

  // Loading de entradas
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl"
          >
            <div className="h-5 w-24 rounded bg-white/8" />
            <div className="mt-3 h-4 w-3/4 rounded bg-white/8" />
            <div className="mt-4 h-9 w-32 rounded-xl bg-white/8" />
          </div>
        ))}
      </div>
    );
  }

  // Error cargando entradas
  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-red-500/30 bg-red-500/8 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-lg font-black text-red-300">Error al cargar entradas</p>
        <p className="mt-2 text-red-100/55">{error}</p>
      </div>
    );
  }

  // Sin entradas disponibles
  if (ticketTypes.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-luxe-ember/25 bg-white/[0.055] p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-lg font-black text-white">
          Entradas próximamente
        </p>
        <p className="mt-2 text-red-100/55">
          Los tipos de entrada y precios estarán disponibles pronto.
          Vuelve más tarde o regístrate para recibir notificaciones.
        </p>
      </div>
    );
  }

  // Con entradas activas — mostrar selector
  return <TicketSelector ticketTypes={ticketTypes} />;
}

// ---------------------------------------------------------------------------
// EventDetailPage
// ---------------------------------------------------------------------------

/**
 * Página de detalle de evento que consume datos desde Firestore
 * via useEvent(slug), useCategories() y useTicketTypes().
 */
export default function EventDetailPage({ eventId }) {
  const { event: fbEvent, loading, error, notFound } = useEvent(eventId);
  const { categoryNameById } = useCategories();

  // --- Loading ---
  if (loading) {
    return <LoadingSkeleton />;
  }

  // --- Error inesperado ---
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  // --- No encontrado ---
  if (notFound || !fbEvent) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-luxe-ember">
          404
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">
          Evento no encontrado
        </h1>
        <p className="mt-4 text-red-100/60">
          El evento pudo cambiar de URL o ya no está disponible.
        </p>
        <a
          className="mt-8 inline-flex font-black text-luxe-ember hover:text-red-100"
          href="#/"
        >
          Volver al inicio
        </a>
      </main>
    );
  }

  // --- Evento cargado — resolver datos para el template ---
  const event = {
    id: fbEvent.slug,
    image: fbEvent.imageUrl,
    category: categoryNameById[fbEvent.categoryId] || fbEvent.categoryId,
    title: fbEvent.title,
    description: fbEvent.description,
    date: toDateValue(fbEvent.startDate),
    location: [fbEvent.city, fbEvent.address].filter(Boolean).join(' · '),
    price: 0,
  };

  return (
    <main className="relative overflow-hidden bg-luxe-black">
      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-luxe-wine/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-luxe-ember/10 blur-3xl" />
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <a
          href="#events"
          className="inline-flex items-center gap-2 text-sm font-black text-red-100/60 transition hover:text-luxe-ember"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a eventos
        </a>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-3 shadow-deep-luxe backdrop-blur-xl">
            <img
              className="h-[24rem] w-full rounded-[1.5rem] object-cover brightness-75 contrast-110 saturate-[0.85] sm:h-[34rem]"
              src={event.image}
              alt={event.title}
            />
          </div>
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-deep-luxe backdrop-blur-2xl lg:sticky lg:top-28 lg:self-start">
            <div className="mb-5 flex items-center justify-between gap-4">
              <span className="rounded-full border border-luxe-ember/20 bg-luxe-wine/35 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-red-100">
                {event.category}
              </span>
              <button
                className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-red-100/55 transition hover:border-luxe-ember/40 hover:text-luxe-ember"
                aria-label="Compartir evento"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              {event.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-red-100/62">
              {event.description}
            </p>
            <div className="mt-6 grid gap-3 text-sm font-bold text-red-100/64">
              <p className="flex items-center gap-3 rounded-2xl border border-white/10 bg-luxe-black/45 p-4">
                <Calendar className="h-5 w-5 text-luxe-ember" />{' '}
                {formatDate(event.date, { weekday: 'long', month: 'long' })}
              </p>
              <p className="flex items-center gap-3 rounded-2xl border border-white/10 bg-luxe-black/45 p-4">
                <MapPin className="h-5 w-5 text-luxe-ember" /> {event.location}
              </p>
              <p className="flex items-center gap-3 rounded-2xl border border-white/10 bg-luxe-black/45 p-4">
                <Users className="h-5 w-5 text-luxe-ember" />{' '}
                Cupos limitados · compra anticipada recomendada
              </p>
            </div>
            <div className="mt-6 rounded-3xl border border-luxe-ember/25 bg-gradient-to-br from-luxe-wine/80 to-luxe-black p-5 text-white shadow-2xl shadow-luxe-ember/15">
              <p className="text-sm font-bold text-red-100/62">Entradas desde</p>
              <p className="text-4xl font-black text-red-50">
                {event.price > 0 ? formatPrice(event.price) : 'Próximamente'}
              </p>
            </div>
          </aside>
        </div>
      </section>
      <section className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-luxe-ember">
            Tipos de entradas
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
            Elige cómo quieres vivirlo
          </h2>
          <p className="mt-4 leading-7 text-red-100/60">
            Precios transparentes, beneficios visibles y un botón de compra
            destacado para acelerar la conversión sin perder confianza.
          </p>
        </div>
        <TicketSection eventDocId={fbEvent.id} />
      </section>
    </main>
  );
}

