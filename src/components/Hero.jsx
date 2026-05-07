import { ArrowRight, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import Button from './Button.jsx';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(193,18,31,0.24),transparent_34%),radial-gradient(circle_at_80%_12%,rgba(91,10,10,0.38),transparent_30%),linear-gradient(135deg,#050505_0%,#160606_46%,#050505_100%)]">
      <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-luxe-ember/18 blur-3xl" />
      <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-luxe-crimson/25 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-luxe-wine/20 blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="relative z-10 flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-luxe-ember/25 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-red-100 shadow-lg shadow-black/30 backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-luxe-ember" /> Nuevas experiencias cada semana
          </div>
          <h1 className="max-w-3xl text-5xl font-black tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
            Encuentra el próximo evento que sí vas a recordar.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-red-100/68">
            Una tiquetera moderna para descubrir conciertos y experiencias premium con compra rápida, entradas claras y beneficios.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="#events" variant="glow" className="gap-2">
              Explorar eventos <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#how-it-works" variant="secondary">Ver beneficios</Button>
          </div>
          <div className="mt-8 grid gap-3 text-sm font-semibold text-red-100/60 sm:grid-cols-3">
            <span className="flex items-center gap-2"><Ticket className="h-4 w-4 text-luxe-ember" /> Tickets instantáneos</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-luxe-ember" /> Pago seguro</span>
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-luxe-ember" /> Beneficios unicos</span>
          </div>
        </div>
        <div className="relative z-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] p-3 shadow-deep-luxe backdrop-blur-xl">
            <img
              className="h-[28rem] w-full rounded-[1.5rem] object-cover brightness-75 contrast-110 saturate-[0.9]"
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80"
              alt="Público disfrutando un evento en vivo con luces de escenario"
            />
            <div className="absolute inset-3 rounded-[1.5rem] bg-gradient-to-t from-luxe-black/55 via-transparent to-luxe-wine/10" />
            <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/10 bg-luxe-black/78 p-5 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-luxe-ember">Evento destacado</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">Hugel Sessions Live</h2>
                  <p className="mt-1 text-sm text-red-100/62">Sábado 16 mayo · Cali</p>
                </div>
                <span className="rounded-2xl border border-luxe-ember/30 bg-luxe-ember/90 px-4 py-2 text-sm font-black text-white shadow-lg shadow-luxe-ember/25">Desde $60.000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
