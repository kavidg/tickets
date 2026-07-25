import { BadgeCheck, Clock3, LockKeyhole } from 'lucide-react';

const benefits = [
  {
    icon: LockKeyhole,
    title: 'Checkout seguro',
    text: 'Compra en pocos pasos con confirmación inmediata. Tu información está protegida en todo momento.',
  },
  {
    icon: Clock3,
    title: 'Sin fricción',
    text: 'Entradas digitales listas para mostrar desde tu móvil. Sin filas, sin papel, sin complicaciones.',
  },
  {
    icon: BadgeCheck,
    title: 'Eventos verificados',
    text: 'Organizadores garantizados y experiencias únicas. Cada evento pasa por un proceso de verificación.',
  },
];

/**
 * Conversion band highlighting key platform benefits
 * with modern card design.
 */
export default function ConversionBand() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-neutral-900 py-20">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div className="section-container relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-light">
            Beneficios
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Por qué elegir PulsePass
          </h2>
          <p className="mt-4 text-neutral-400">
            Una experiencia de compra diseñada para que disfrutes lo que realmente importa: el evento.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="card-base group p-6 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-muted text-brand-light transition group-hover:bg-brand/20 group-hover:text-brand-light">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
