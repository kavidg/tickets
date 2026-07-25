import { ArrowRight, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import Button from '../../../components/ui/Button.jsx';

/**
 * Full-screen hero section with minimalist design,
 * gradient background, and a floating featured event card.
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-neutral-900">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-brand/8 blur-[100px]" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[600px] -translate-x-1/2 bg-gradient-to-r from-transparent via-brand/5 to-transparent blur-[80px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-32">
        {/* Left: Text content */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-light" />
            Nuevas experiencias cada semana
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            El próximo evento{' '}
            <span className="bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">
              inolvidable
            </span>{' '}
            te espera.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-neutral-400">
            Descubre conciertos, festivales y experiencias únicas. Compra tus entradas de forma segura y vive momentos que recordarás siempre.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/events" variant="primary" size="lg" className="gap-2">
              Explorar eventos <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/how-it-works" variant="secondary" size="lg">
              Cómo funciona
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid gap-2 text-sm text-neutral-500 sm:grid-cols-3 sm:gap-4">
            <span className="flex items-center justify-center gap-2 lg:justify-start">
              <Ticket className="h-4 w-4 text-brand-light" /> Tickets instantáneos
            </span>
            <span className="flex items-center justify-center gap-2 lg:justify-start">
              <ShieldCheck className="h-4 w-4 text-brand-light" /> Pago seguro
            </span>
            <span className="flex items-center justify-center gap-2 lg:justify-start">
              <Sparkles className="h-4 w-4 text-brand-light" /> Beneficios únicos
            </span>
          </div>
        </div>

        {/* Right: Featured event card */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md animate-fade-in-up">
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-neutral-800/60 p-2 shadow-2xl backdrop-blur-sm">
              <img
                className="h-[26rem] w-full rounded-2xl object-cover brightness-75"
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"
                alt="Público disfrutando un evento en vivo"
              />
              <div className="absolute inset-2 rounded-2xl bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/[0.08] bg-neutral-900/80 p-4 shadow-xl backdrop-blur-xl">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-light">
                  Evento destacado
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Hugel Sessions Live</h3>
                    <p className="mt-0.5 text-xs text-neutral-400">Sábado 16 mayo · Cali</p>
                  </div>
                  <span className="whitespace-nowrap rounded-lg bg-brand/20 px-3 py-1.5 text-xs font-bold text-brand-light">
                    Desde $60.000
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="h-8 w-5 rounded-full border border-white/[0.15]" />
      </div>
    </section>
  );
}
