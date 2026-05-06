import { BadgeCheck, Clock3, LockKeyhole } from 'lucide-react';

const benefits = [
  { icon: LockKeyhole, title: 'Checkout seguro', text: 'Compra en pocos pasos con confirmación inmediata.' },
  { icon: Clock3, title: 'Sin fricción', text: 'Entradas digitales listas para mostrar desde el móvil.' },
  { icon: BadgeCheck, title: 'Eventos verificados', text: 'Organizadores curados y experiencias con cupos reales.' },
];

export default function ConversionBand() {
  return (
    <section id="how-it-works" className="bg-slate-950 py-14 text-white">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        {benefits.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
            <Icon className="h-8 w-8 text-cyan-300" />
            <h3 className="mt-4 text-xl font-black">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
