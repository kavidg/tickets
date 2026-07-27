import { ShieldCheck, Sparkles, Ticket } from 'lucide-react';

/**
 * Full-screen hero section with minimalist design,
 * gradient background, and a floating featured event card.
 */
export default function Hero() {
  return (
    <section className="relative flex items-start justify-center overflow-hidden">
      {/* Subtle background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-40 -right-40 h-[300px] w-[300px] rounded-full bg-brand/[0.04] blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="bg-gradient-to-r from-[var(--hero-title-from)] via-[var(--hero-title-via)] to-brand-light bg-clip-text text-transparent">
              El próximo evento te espera....
            </span>
          </h2>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-neutral-500">
            <span className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-brand-light" />
              Tickets instantáneos
            </span>

            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-light" />
              Pago seguro
            </span>

            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-light" />
              Beneficios únicos
            </span>
          </div>
        </div>
      </div>

    </section>
  );
}
