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
      <main id="events" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Filters
          category={category}
          dateFilter={dateFilter}
          onCategoryChange={setCategory}
          onDateFilterChange={setDateFilter}
        />
        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-700">Agenda destacada</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Eventos con alta demanda</h2>
          </div>
          <p className="hidden rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 sm:block">
            {filteredEvents.length} disponibles
          </p>
        </div>
        <div className="mt-6">
          <EventGrid events={filteredEvents} />
        </div>
      </main>
      <ConversionBand />
    </>
  );
}
