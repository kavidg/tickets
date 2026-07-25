import { useState, useMemo } from 'react';
import ConversionBand from '../features/marketing/components/ConversionBand.jsx';
import EventGrid from '../features/events/components/EventGrid.jsx';
import Filters from '../features/events/components/Filters.jsx';
import Hero from '../features/marketing/components/Hero.jsx';
import { useEvents } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';
import { toDate } from '../utils/format.js';

/**
 * Filtra eventos por categoría y rango de fechas (client-side).
 */
function filterEvents(events, categoryFilter, dateFilter, categoryIdByName) {
  return events.filter((event) => {
    if (categoryFilter !== 'Todos') {
      const targetId = categoryIdByName[categoryFilter];
      if (!targetId || event.categoryId !== targetId) return false;
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const eventDate = toDate(event.startDate);
      const days = dateFilter === 'week' ? 7 : dateFilter === 'month' ? 31 : 90;
      const limit = new Date(now);
      limit.setDate(now.getDate() + days);
      if (eventDate < now || eventDate > limit) return false;
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// Skeleton Loaders
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="card-base overflow-hidden p-0">
          <div className="aspect-[16/9] skeleton" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-24 skeleton" />
            <div className="h-5 w-3/4 skeleton" />
            <div className="space-y-2">
              <div className="h-3 w-1/2 skeleton" />
              <div className="h-3 w-2/3 skeleton" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="h-5 w-16 skeleton" />
              <div className="h-8 w-24 skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="card-base flex flex-col items-center p-10 text-center">
      <h3 className="text-lg font-semibold text-white">Error al cargar eventos</h3>
      <p className="mt-2 text-sm text-neutral-400">{message}</p>
      <button onClick={onRetry} className="btn-primary mt-6">
        Reintentar
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HomePage
// ---------------------------------------------------------------------------

export default function HomePage() {
  const { events, loading, error, reload } = useEvents();
  const { categoryNameById, categoryNames, loading: catLoading, error: catError } = useCategories();

  const [category, setCategory] = useState('Todos');
  const [dateFilter, setDateFilter] = useState('all');

  const categoryIdByName = useMemo(() => {
    const map = {};
    for (const [id, name] of Object.entries(categoryNameById)) {
      map[name] = id;
    }
    return map;
  }, [categoryNameById]);

  const filteredEvents = useMemo(
    () => filterEvents(events, category, dateFilter, categoryIdByName),
    [events, category, dateFilter, categoryIdByName],
  );

  const cardEvents = useMemo(
    () =>
      filteredEvents.map((event) => ({
        id: event.slug,
        image: event.imageUrl,
        category: categoryNameById[event.categoryId] || event.categoryId,
        price: 0,
        title: event.title,
        date: toDate(event.startDate).toISOString(),
        location: [event.city, event.address].filter(Boolean).join(' · '),
      })),
    [filteredEvents, categoryNameById],
  );

  const isLoading = loading || catLoading;
  const hasError = error || catError;

  return (
    <>
      <Hero />
      <main id="events" className="section-container relative py-12 lg:py-16">
        {/* Section header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-light">
              Agenda destacada
            </p>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Eventos con alta demanda
            </h2>
          </div>
          {!isLoading && !hasError && (
            <p className="whitespace-nowrap rounded-lg border border-white/[0.06] bg-neutral-800 px-3.5 py-1.5 text-xs font-medium text-neutral-400">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'} disponibles
            </p>
          )}
        </div>

        {/* Filters */}
        <Filters
          category={category}
          dateFilter={dateFilter}
          onCategoryChange={setCategory}
          onDateFilterChange={setDateFilter}
          categories={categoryNames.length > 1 ? categoryNames : undefined}
        />

        {/* Events grid */}
        <div className="mt-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : hasError ? (
            <ErrorMessage message={error || catError} onRetry={reload} />
          ) : (
            <EventGrid events={cardEvents} />
          )}
        </div>
      </main>
      <ConversionBand />
    </>
  );
}
