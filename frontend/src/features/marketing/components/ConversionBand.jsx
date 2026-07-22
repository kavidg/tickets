import { BadgeCheck, Clock3, LockKeyhole } from 'lucide-react';

const benefits = [
  { icon: LockKeyhole, title: 'Checkout seguro', text: 'Compra en pocos pasos con confirmación inmediata.' },
  { icon: Clock3, title: 'Sin fricción', text: 'Entradas digitales listas para mostrar desde el móvil.' },
  { icon: BadgeCheck, title: 'Eventos verificados', text: 'Organizadores garantizados y experiencias unicas.' },
];

/**
 * Conversion band highlighting key platform benefits
 * (secure checkout, frictionless experience, verified events).
 */
export default function ConversionBand() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-luxe-black py-14 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-luxe-ember/50 to-transparent" />
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-luxe-ember/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        {benefits.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/35 backdrop-blur-xl">
            <Icon className="h-8 w-8 text-luxe-ember" />
            <h3 className="mt-4 text-xl font-black">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-red-100/58">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
