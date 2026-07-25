import { Ticket } from 'lucide-react';

const footerLinks = [
  {
    title: 'Eventos',
    links: [
      { label: 'Explorar eventos', href: '/events' },
      { label: 'Cómo funciona', href: '/how-it-works' },
      { label: 'Buscar entradas', href: '/tickets/search' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { label: 'Ayuda', href: '/help' },
      { label: 'Contacto', href: '/contact' },
      { label: 'Términos', href: '/terms' },
    ],
  },
  {
    title: 'Compañía',
    links: [
      { label: 'Acerca de', href: '/about' },
      { label: 'Para organizadores', href: '/organizers' },
      { label: 'Prensa', href: '/press' },
    ],
  },
];

/**
 * Modern footer with navigation columns, brand info, and copyright.
 */
export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-xs font-black text-white shadow-glow">
                P
              </span>
              <span className="text-base font-bold tracking-tight text-white">
                PulsePass
              </span>
            </a>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
              La forma más sencilla de descubrir y comprar entradas para los mejores eventos. Conciertos, festivales, conferencias y más.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-300">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-neutral-400 transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} PulsePass. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <a href="/privacy" className="transition hover:text-neutral-300">Privacidad</a>
            <a href="/terms" className="transition hover:text-neutral-300">Términos</a>
            <a href="/legal" className="transition hover:text-neutral-300">Legal</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
