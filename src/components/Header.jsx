import Button from './Button.jsx';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-luxe-black/80 shadow-lg shadow-black/35 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#/" className="group flex items-center gap-3" aria-label="PulsePass inicio">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-luxe-ember/30 bg-gradient-to-br from-luxe-wine to-luxe-black text-lg font-black text-red-50 shadow-lg shadow-luxe-ember/20">
            P
          </span>
          <div>
            <p className="text-base font-black tracking-tight text-white">PulsePass</p>
            <p className="hidden text-xs font-semibold uppercase tracking-[0.28em] text-red-100/45 sm:block">Los mejores eventos a tu mano</p>
          </div>
        </a>
        <div className="hidden items-center gap-8 text-sm font-semibold text-red-100/65 md:flex">
          <a className="transition hover:text-luxe-ember" href="#events">Eventos</a>
          <a className="transition hover:text-luxe-ember" href="#how-it-works">Cómo funciona</a>
          <a className="transition hover:text-luxe-ember" href="#/">Organizadores</a>
        </div>
        <Button href="#events" variant="secondary" className="hidden sm:inline-flex">Explorar</Button>
      </nav>
    </header>
  );
}
