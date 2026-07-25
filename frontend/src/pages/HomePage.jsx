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
 * categoryIdByName resuelve el nombre del filtro al ID real de Firestore.
 */
function filterEvents(events, categoryFilter, dateFilter, categoryIdByName) {
  return events.filter((event) => {
    // Filtro por categoría — convierte el nombre del filtro al ID real
    if (categoryFilter !== 'Todos') {
      const targetId = categoryIdByName[categoryFilter];
      if (!targetId || event.categoryId !== targetId) return false;
    }

    // Filtro por fecha
    if (dateFilter !== 'all') {
      const now = new Date();
      const eventDate = toDate(event.startDate);
      const days =
        dateFilter === 'week' ? 7 : dateFilter === 'month' ? 31 : 90;
      const limit = new Date(now);
      limit.setDate(now.getDate() + days);

      if (eventDate < now || eventDate > limit) return false;
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// Subcomponentes de estado
// ---------------------------------------------------------------------------

/**
 * Esqueleto de carga con efecto shimmer que mantiene el diseño del grid.
 */
function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/35 backdrop-blur-xl"
        >
          <div className="h-56 w-full bg-white/5" />
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="h-5 w-20 rounded-full bg-white/8" />
              <div className="h-6 w-16 rounded bg-white/8" />
            </div>
            <div className="h-6 w-3/4 rounded bg-white/8" />
            <div className="space-y-2">
              <div className="h-4 w-1/2 rounded bg-white/8" />
              <div className="h-4 w-2/3 rounded bg-white/8" />
            </div>
            <div className="mt-5 h-11 w-full rounded-2xl bg-white/8" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Mensaje de error amigable con opción de reintentar.
 */
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-red-500/30 bg-red-500/8 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
      <p className="text-lg font-black text-red-300">
        No pudimos cargar los eventos
      </p>
      <p className="mt-2 text-red-100/55">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-luxe-ember/30 bg-luxe-wine px-5 py-3 text-sm font-bold text-white shadow-xl shadow-black/35 transition hover:bg-luxe-crimson hover:shadow-red-glow"
      >
        Reintentar
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HomePage
// ---------------------------------------------------------------------------

/**
 * Home page que consume eventos y categorías desde Firestore.
 * Composición: Hero, Filters, EventGrid, ConversionBand.
 */
export default function HomePage() {
  const { events, loading, error, reload } = useEvents();
  const {
    categoryNameById,
    categoryNames,
    loading: catLoading,
    error: catError,
  } = useCategories();

  // Estado de filtros (client-side)
  const [category, setCategory] = useState('Todos');
  const [dateFilter, setDateFilter] = useState('all');

  // Mapa reverso: nombre de categoría → ID de Firestore
  // Para que el filtro por nombre encuentre el ID correcto
  const categoryIdByName = useMemo(() => {
    const map = {};
    for (const [id, name] of Object.entries(categoryNameById)) {
      map[name] = id;
    }
    return map;
  }, [categoryNameById]);

  // Eventos filtrados (memorizado)
  const filteredEvents = useMemo(
    () => filterEvents(events, category, dateFilter, categoryIdByName),
    [events, category, dateFilter, categoryIdByName],
  );

  // Eventos convertidos al formato EventCard (con nombre de categoría resuelto)
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

  return (
    <>
      <Hero />
      <main
        id="events"
        className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      >
        <div className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-luxe-wine/18 blur-3xl" />
        <div className="relative">
          <Filters
            category={category}
            dateFilter={dateFilter}
            onCategoryChange={setCategory}
            onDateFilterChange={setDateFilter}
            categories={categoryNames.length > 1 ? categoryNames : undefined}
          />
          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-luxe-ember">
                Agenda destacada
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
                Eventos con alta demanda
              </h2>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    window.location.href = '/checkout';
                  }}
                  className="rounded-xl bg-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-emerald-600"
                >
                  🎟️ Comprar
                </button>
              </div>
            </div>
            {!loading && !catLoading && !error && !catError && (
              <p className="hidden rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-red-100/65 shadow-lg shadow-black/25 backdrop-blur-xl sm:block">
                {filteredEvents.length} disponibles
              </p>
            )}
          </div>
          <div className="mt-6">
            {loading || catLoading ? (
              <LoadingSkeleton />
            ) : error || catError ? (
              <ErrorMessage message={error || catError} onRetry={reload} />
            ) : (
              <EventGrid events={cardEvents} />
            )}
          </div>
        </div>
      </main>
      <ConversionBand />
    </>
  );
}
