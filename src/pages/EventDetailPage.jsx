import { ArrowLeft, Calendar, MapPin, Share2, Users } from 'lucide-react';
import TicketOptions from '../components/TicketOptions.jsx';
import { events } from '../data/events.js';
import { formatDate, formatPrice } from '../utils.js';

export default function EventDetailPage({ eventId }) {
  const event = events.find((item) => item.id === eventId);

  if (!event) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-700">404</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Evento no encontrado</h1>
        <p className="mt-4 text-slate-600">El evento pudo cambiar de URL o ya no está disponible.</p>
        <a className="mt-8 inline-flex font-black text-cyan-700" href="#/">Volver al inicio</a>
      </main>
    );
  }

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <a href="#/" className="inline-flex items-center gap-2 text-sm font-black text-slate-600 hover:text-cyan-700">
          <ArrowLeft className="h-4 w-4" /> Volver a eventos
        </a>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white bg-white p-3 shadow-2xl shadow-slate-900/10">
            <img className="h-[24rem] w-full rounded-[1.5rem] object-cover sm:h-[34rem]" src={event.image} alt={event.title} />
          </div>
          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 lg:sticky lg:top-28 lg:self-start">
            <div className="mb-5 flex items-center justify-between gap-4">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{event.category}</span>
              <button className="rounded-full border border-slate-200 p-3 text-slate-500 transition hover:border-cyan-300 hover:text-cyan-700" aria-label="Compartir evento">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">{event.title}</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">{event.description}</p>
            <div className="mt-6 grid gap-3 text-sm font-bold text-slate-600">
              <p className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><Calendar className="h-5 w-5 text-cyan-700" /> {formatDate(event.date, { weekday: 'long', month: 'long' })}</p>
              <p className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><MapPin className="h-5 w-5 text-cyan-700" /> {event.location}</p>
              <p className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><Users className="h-5 w-5 text-cyan-700" /> Cupos limitados · compra anticipada recomendada</p>
            </div>
            <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-bold text-slate-300">Entradas desde</p>
              <p className="text-4xl font-black text-cyan-300">{formatPrice(event.price)}</p>
            </div>
          </aside>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-700">Tipos de entradas</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Elige cómo quieres vivirlo</h2>
          <p className="mt-4 leading-7 text-slate-600">
            Precios transparentes, beneficios visibles y un botón de compra destacado para acelerar la conversión sin perder confianza.
          </p>
        </div>
        <TicketOptions tickets={event.tickets} />
      </section>
    </main>
  );
}
