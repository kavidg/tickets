import { Calendar, MapPin } from 'lucide-react';
import { formatDate, formatPrice } from '../utils.js';
import Button from './Button.jsx';

export default function EventCard({ event }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-950/10">
      <a href={`#/event/${event.id}`} className="block overflow-hidden">
        <img className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" src={event.image} alt={event.title} />
      </a>
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{event.category}</span>
          <span className="text-lg font-black text-slate-950">{formatPrice(event.price)}</span>
        </div>
        <h3 className="text-xl font-black tracking-tight text-slate-950">{event.title}</h3>
        <div className="mt-4 space-y-2 text-sm font-semibold text-slate-500">
          <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-cyan-700" /> {formatDate(event.date)}</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-700" /> {event.location}</p>
        </div>
        <Button href={`#/event/${event.id}`} className="mt-5 w-full">Ver entradas</Button>
      </div>
    </article>
  );
}
