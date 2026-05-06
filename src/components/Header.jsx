import Button from './Button.jsx';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-slate-50/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#/" className="group flex items-center gap-3" aria-label="PulsePass inicio">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-cyan-300 shadow-lg shadow-cyan-900/20">
            P
          </span>
          <div>
            <p className="text-base font-black tracking-tight text-slate-950">PulsePass</p>
            <p className="hidden text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 sm:block">Eventos curados</p>
          </div>
        </a>
        <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
          <a className="hover:text-cyan-700" href="#events">Eventos</a>
          <a className="hover:text-cyan-700" href="#how-it-works">Cómo funciona</a>
          <a className="hover:text-cyan-700" href="#/">Organizadores</a>
        </div>
        <Button href="#events" variant="secondary" className="hidden sm:inline-flex">Explorar</Button>
      </nav>
    </header>
  );
}
