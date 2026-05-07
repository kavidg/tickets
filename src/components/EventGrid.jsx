import EventCard from './EventCard.jsx';

export default function EventGrid({ events }) {
  if (!events.length) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-luxe-ember/25 bg-white/[0.055] p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-lg font-black text-white">No encontramos eventos con esos filtros.</p>
        <p className="mt-2 text-red-100/55">Prueba otra categoría o amplía el rango de fechas.</p>
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
