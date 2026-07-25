import { useState, useCallback } from 'react';
import { ArrowLeft, Calendar, MapPin, Share2, ShoppingCart, Users } from 'lucide-react';
import TicketSelector from '../features/tickets/components/TicketSelector';
import { usePublicEvent } from '../hooks/usePublicEvent';
import { useCategories } from '../hooks/useCategories';
import { formatDate, formatPrice } from '../utils/format.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDateValue(timestamp) {
  if (!timestamp) return new Date().toISOString();
  if (timestamp.toDate) return timestamp.toDate();
  if (typeof timestamp._seconds === 'number') {
    return new Date(timestamp._seconds * 1000);
  }
  return timestamp;
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <main className="relative min-h-screen bg-neutral-900">
      <div className="section-container animate-pulse py-8">
        <div className="h-4 w-32 skeleton" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-base overflow-hidden p-2">
            <div className="aspect-[4/3] skeleton rounded-xl lg:aspect-[16/11]" />
          </div>
          <div className="card-base p-6">
            <div className="h-5 w-20 skeleton rounded-full" />
            <div className="mt-4 h-8 w-3/4 skeleton" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full skeleton" />
              <div className="h-4 w-5/6 skeleton" />
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-12 w-full skeleton rounded-xl" />
              <div className="h-12 w-full skeleton rounded-xl" />
              <div className="h-12 w-full skeleton rounded-xl" />
            </div>
            <div className="mt-6 h-24 w-full skeleton rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}

function ErrorDisplay({ message }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-light">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
        Evento no encontrado
      </h1>
      <p className="mt-3 text-sm text-neutral-400">
        {message || 'El evento pudo cambiar de URL o ya no está disponible.'}
      </p>
      <a href="/" className="btn-primary mt-8 inline-flex">
        <ArrowLeft className="h-4 w-4" /> Volver al inicio
      </a>
    </main>
  );
}

// ---------------------------------------------------------------------------
// TicketSection
// ---------------------------------------------------------------------------

function TicketSection({ ticketTypes = [], onSelectionChange }) {
  const [selection, setSelection] = useState([]);

  const handleSelectionChange = useCallback(
    (sel) => {
      setSelection(sel);
      onSelectionChange?.(sel);
    },
    [onSelectionChange],
  );

  const totalItems = selection.reduce((sum, s) => sum + s.quantity, 0);
  const totalAmount = selection.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);

  if (ticketTypes.length === 0) {
    return (
      <div className="card-base flex flex-col items-center p-8 text-center">
        <p className="text-base font-semibold text-white">Entradas próximamente</p>
        <p className="mt-2 text-sm text-neutral-400">
          Los tipos de entrada estarán disponibles pronto. Vuelve más tarde.
        </p>
      </div>
    );
  }

  return (
    <>
      <TicketSelector
        ticketTypes={ticketTypes}
        onSelectionChange={handleSelectionChange}
      />

      {totalItems > 0 && (
        <div className="mt-4 animate-fade-in-up">
          <button
            onClick={() => {
              window.location.href = '/checkout';
            }}
            className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-base"
          >
            <ShoppingCart className="h-5 w-5" />
            Comprar {totalItems} {totalItems === 1 ? 'entrada' : 'entradas'} · {formatPrice(totalAmount)}
          </button>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// EventDetailPage
// ---------------------------------------------------------------------------

export default function EventDetailPage({ eventId }) {
  const { event: fbEvent, loading, error } = usePublicEvent(eventId);
  const { categoryNameById } = useCategories();
  const [ticketSelection, setTicketSelection] = useState([]);

  const handleSelectionChange = useCallback(
    (sel) => {
      setTicketSelection(sel);
      if (!fbEvent) return;
      sessionStorage.setItem(
        'checkout_selection',
        JSON.stringify({
          eventId: fbEvent.id,
          slug: fbEvent.slug,
          organizationId: fbEvent.organizationId,
          title: fbEvent.title,
          eventCity: fbEvent.city,
          items: sel.map((s) => ({
            ticketTypeId: s.ticketTypeId,
            quantity: s.quantity,
          })),
        }),
      );
    },
    [fbEvent],
  );

  if (loading) return <LoadingSkeleton />;
  if (error || !fbEvent) return <ErrorDisplay message={error} />;

  const ticketTypesFromApi = fbEvent.ticketTypes || [];
  const activeTypes = ticketTypesFromApi.filter((t) => t.status === 'active');
  const minPrice = activeTypes.length > 0
    ? Math.min(...activeTypes.map((t) => t.price))
    : 0;

  const event = {
    id: fbEvent.slug,
    image: fbEvent.imageUrl,
    category: categoryNameById[fbEvent.categoryId] || fbEvent.categoryId,
    title: fbEvent.title,
    description: fbEvent.description,
    date: toDateValue(fbEvent.startDate),
    location: [fbEvent.city, fbEvent.address].filter(Boolean).join(' · '),
    price: minPrice,
  };

  return (
    <main className="relative min-h-screen bg-neutral-900 pt-20">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-40 h-[400px] w-[400px] rounded-full bg-brand/8 blur-[100px]" />
        <div className="absolute -right-40 top-60 h-[300px] w-[300px] rounded-full bg-brand/5 blur-[80px]" />
      </div>

      <div className="relative section-container py-8">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a eventos
        </a>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: Image */}
          <div className="card-base overflow-hidden p-2">
            <img
              className="aspect-[4/3] w-full rounded-xl object-cover brightness-90 lg:aspect-[16/11]"
              src={event.image}
              alt={event.title}
            />
          </div>

          {/* Right: Info + Tickets */}
          <aside className="card-base p-6 lg:sticky lg:top-28 lg:self-start">
            {/* Category badge + Share */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="rounded-lg border border-brand/20 bg-brand-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-light">
                {event.category}
              </span>
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-neutral-800 text-neutral-400 transition hover:border-white/[0.12] hover:text-white"
                aria-label="Compartir evento"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {event.title}
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              {event.description}
            </p>

            {/* Event details */}
            <div className="mt-6 space-y-2.5 text-sm text-neutral-400">
              <div className="card-base flex items-center gap-3 p-3.5">
                <Calendar className="h-4 w-4 text-brand-light" />
                <span>{formatDate(event.date, { weekday: 'long', month: 'long' })}</span>
              </div>
              <div className="card-base flex items-center gap-3 p-3.5">
                <MapPin className="h-4 w-4 text-brand-light" />
                <span>{event.location}</span>
              </div>
              <div className="card-base flex items-center gap-3 p-3.5">
                <Users className="h-4 w-4 text-brand-light" />
                <span>Cupos limitados · compra anticipada recomendada</span>
              </div>
            </div>

            {/* Price highlight */}
            <div className="mt-6 rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/10 to-transparent p-5">
              <p className="text-xs font-medium text-neutral-400">Entradas desde</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {event.price > 0 ? formatPrice(event.price) : 'Próximamente'}
              </p>
            </div>
          </aside>
        </div>

        {/* Ticket types section */}
        <section className="mt-12 grid gap-8 pb-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-light">
              Tipos de entradas
            </p>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
              Elige cómo vivirlo
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              Precios transparentes, beneficios visibles y un proceso de compra rápido y seguro.
            </p>
          </div>
          <TicketSection
            ticketTypes={ticketTypesFromApi}
            onSelectionChange={handleSelectionChange}
          />
        </section>
      </div>
    </main>
  );
}
