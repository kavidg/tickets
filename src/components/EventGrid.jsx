import EventCard from './EventCard.jsx';

export default function EventGrid({ events }) {
  if (!events.length) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-lg font-black text-slate-950">No encontramos eventos con esos filtros.</p>
        <p className="mt-2 text-slate-500">Prueba otra categoría o amplía el rango de fechas.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
