import { useMemo, useState } from 'react';
import ConversionBand from '../components/ConversionBand.jsx';
import EventGrid from '../components/EventGrid.jsx';
import Filters from '../components/Filters.jsx';
import Hero from '../components/Hero.jsx';
import { events } from '../data/events.js';
import { isWithinDateFilter } from '../utils.js';

export default function HomePage() {
  const [category, setCategory] = useState('Todos');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesCategory = category === 'Todos' || event.category === category;
        return matchesCategory && isWithinDateFilter(event.date, dateFilter);
      }),
    [category, dateFilter],
  );

  return (
    <>
      <Hero />
      <main id="events" className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-luxe-wine/18 blur-3xl" />
        <div className="relative">
          <Filters
            category={category}
            dateFilter={dateFilter}
            onCategoryChange={setCategory}
            onDateFilterChange={setDateFilter}
          />
          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-luxe-ember">Agenda destacada</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Eventos con alta demanda</h2>
            </div>
            <p className="hidden rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-red-100/65 shadow-lg shadow-black/25 backdrop-blur-xl sm:block">
              {filteredEvents.length} disponibles
            </p>
          </div>
          <div className="mt-6">
            <EventGrid events={filteredEvents} />
          </div>
        </div>
      </main>
      <ConversionBand />
    </>
  );
}
