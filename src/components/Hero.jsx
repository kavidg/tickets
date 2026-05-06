import { ArrowRight, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import Button from './Button.jsx';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#cffafe,transparent_34%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_42%,#ecfeff_100%)]">
      <div className="absolute right-0 top-10 h-56 w-56 rounded-full bg-lime-200/60 blur-3xl" />
      <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-cyan-300/40 blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="relative z-10 flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-800 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" /> Nuevas experiencias cada semana
          </div>
          <h1 className="max-w-3xl text-5xl font-black tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">
            Encuentra el próximo evento que sí vas a recordar.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Una tiquetera moderna para descubrir conciertos, workshops y experiencias premium con compra rápida, entradas claras y recomendaciones curadas.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="#events" variant="glow" className="gap-2">
              Explorar eventos <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#how-it-works" variant="secondary">Ver beneficios</Button>
          </div>
          <div className="mt-8 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-3">
            <span className="flex items-center gap-2"><Ticket className="h-4 w-4 text-cyan-700" /> Tickets instantáneos</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-700" /> Pago seguro</span>
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-cyan-700" /> Curaduría local</span>
          </div>
        </div>
        <div className="relative z-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-3 shadow-2xl shadow-slate-900/15">
            <img
              className="h-[28rem] w-full rounded-[1.5rem] object-cover"
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80"
              alt="Público disfrutando un evento en vivo con luces de escenario"
            />
            <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-slate-950/86 p-5 text-white backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Evento destacado</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">Neon Sessions Live</h2>
                  <p className="mt-1 text-sm text-slate-300">Sábado 16 mayo · Miami</p>
                </div>
                <span className="rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">Desde $38</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
