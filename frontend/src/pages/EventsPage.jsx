import { useState, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import EventGrid from '../features/events/components/EventGrid.jsx';
import Filters from '../features/events/components/Filters.jsx';
import { useEvents } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';
import { filterEvents, mapToCardEvents } from '../utils/events.js';
import { LoadingSkeleton, ErrorMessage } from '../components/events/EventStates.jsx';

// ---------------------------------------------------------------------------
// EventsPage
// ---------------------------------------------------------------------------

export default function EventsPage() {
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
    () => mapToCardEvents(filteredEvents, categoryNameById),
    [filteredEvents, categoryNameById],
  );

  const isLoading = loading || catLoading;
  const hasError = error || catError;

  return (
    <main className="section-container relative pt-28 pb-16 lg:pt-32 lg:pb-20">
      {/* Section header */}
      <div className="mb-8">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-light">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filtrar eventos
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Encuentra tu plan perfecto
        </h1>
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
      <div className="mt-8">
        {isLoading ? (
          <LoadingSkeleton />
        ) : hasError ? (
          <ErrorMessage message={error || catError} onRetry={reload} />
        ) : (
          <>
            <p className="mb-5 text-xs font-medium text-neutral-500">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
            </p>
            <EventGrid events={cardEvents} />
          </>
        )}
      </div>
    </main>
  );
}
