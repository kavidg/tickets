import { ArrowLeft, Calendar, MapPin, Share2, Users } from 'lucide-react';
import TicketOptions from '../components/TicketOptions.jsx';
import { events } from '../data/events.js';
import { formatDate, formatPrice } from '../utils.js';

export default function EventDetailPage({ eventId }) {
  const event = events.find((item) => item.id === eventId);

  if (!event) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-luxe-ember">404</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Evento no encontrado</h1>
        <p className="mt-4 text-red-100/60">El evento pudo cambiar de URL o ya no está disponible.</p>
        <a className="mt-8 inline-flex font-black text-luxe-ember hover:text-red-100" href="#/">Volver al inicio</a>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden bg-luxe-black">
      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-luxe-wine/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-luxe-ember/10 blur-3xl" />
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <a href="#/" className="inline-flex items-center gap-2 text-sm font-black text-red-100/60 transition hover:text-luxe-ember">
          <ArrowLeft className="h-4 w-4" /> Volver a eventos
        </a>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-3 shadow-deep-luxe backdrop-blur-xl">
            <img className="h-[24rem] w-full rounded-[1.5rem] object-cover brightness-75 contrast-110 saturate-[0.85] sm:h-[34rem]" src={event.image} alt={event.title} />
          </div>
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-deep-luxe backdrop-blur-2xl lg:sticky lg:top-28 lg:self-start">
            <div className="mb-5 flex items-center justify-between gap-4">
              <span className="rounded-full border border-luxe-ember/20 bg-luxe-wine/35 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-red-100">{event.category}</span>
              <button className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-red-100/55 transition hover:border-luxe-ember/40 hover:text-luxe-ember" aria-label="Compartir evento">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">{event.title}</h1>
            <p className="mt-5 text-lg leading-8 text-red-100/62">{event.description}</p>
            <div className="mt-6 grid gap-3 text-sm font-bold text-red-100/64">
              <p className="flex items-center gap-3 rounded-2xl border border-white/10 bg-luxe-black/45 p-4"><Calendar className="h-5 w-5 text-luxe-ember" /> {formatDate(event.date, { weekday: 'long', month: 'long' })}</p>
              <p className="flex items-center gap-3 rounded-2xl border border-white/10 bg-luxe-black/45 p-4"><MapPin className="h-5 w-5 text-luxe-ember" /> {event.location}</p>
              <p className="flex items-center gap-3 rounded-2xl border border-white/10 bg-luxe-black/45 p-4"><Users className="h-5 w-5 text-luxe-ember" /> Cupos limitados · compra anticipada recomendada</p>
            </div>
            <div className="mt-6 rounded-3xl border border-luxe-ember/25 bg-gradient-to-br from-luxe-wine/80 to-luxe-black p-5 text-white shadow-2xl shadow-luxe-ember/15">
              <p className="text-sm font-bold text-red-100/62">Entradas desde</p>
              <p className="text-4xl font-black text-red-50">{formatPrice(event.price)}</p>
            </div>
          </aside>
        </div>
      </section>
      <section className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-luxe-ember">Tipos de entradas</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Elige cómo quieres vivirlo</h2>
          <p className="mt-4 leading-7 text-red-100/60">
            Precios transparentes, beneficios visibles y un botón de compra destacado para acelerar la conversión sin perder confianza.
          </p>
        </div>
        <TicketOptions tickets={event.tickets} />
      </section>
    </main>
  );
}
