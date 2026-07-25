import { Calendar, MapPin } from 'lucide-react';
import { formatDate, formatPrice } from '../../../utils/format.js';
import Button from '../../../components/ui/Button.jsx';

/**
 * Card that displays a single event's summary with image, category, price,
 * date, location, and a CTA button to view tickets.
 */
export default function EventCard({ event }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/35 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-luxe-ember/30 hover:shadow-red-glow">
      <a href={`/event/${event.id}`} className="block overflow-hidden">
        <img className="h-56 w-full object-cover brightness-75 contrast-110 saturate-[0.85] transition duration-500 group-hover:scale-105 group-hover:brightness-90" src={event.image} alt={event.title} />
      </a>
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full border border-luxe-ember/20 bg-luxe-wine/35 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-red-100">{event.category}</span>
          <span className="text-lg font-black text-white">{formatPrice(event.price)}</span>
        </div>
        <h3 className="text-xl font-black tracking-tight text-white">{event.title}</h3>
        <div className="mt-4 space-y-2 text-sm font-semibold text-red-100/55">
          <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-luxe-ember" /> {formatDate(event.date)}</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-luxe-ember" /> {event.location}</p>
        </div>
        <Button href={`/event/${event.id}`} className="mt-5 w-full">Ver entradas</Button>
      </div>
    </article>
  );
}
