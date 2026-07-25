import { CalendarX } from 'lucide-react';
import EventCard from './EventCard.jsx';

/**
 * Grid layout that renders EventCards or a modern empty state.
 */
export default function EventGrid({ events }) {
  if (!events.length) {
    return (
      <div className="card-base flex flex-col items-center justify-center p-12 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800">
          <CalendarX className="h-6 w-6 text-neutral-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">
          No encontramos eventos
        </h3>
        <p className="mt-2 max-w-sm text-sm text-neutral-400">
          No hay eventos disponibles con los filtros seleccionados. Prueba otra categoría o amplía el rango de fechas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
