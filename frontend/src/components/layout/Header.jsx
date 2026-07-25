import { useState } from 'react';
import { LogOut, Ticket, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button.jsx';

/**
 * Sticky site header with logo, navigation links, CTA button,
 * and user authentication controls.
 */
export default function Header() {
  const { user, loading, authenticated, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  /**
   * Cierra la sesión y redirige al Home.
   */
  async function handleLogout() {
    setLoggingOut(true);
    const response = await logout();
    if (response.success) {
      window.location.href = '/';
    }
    setLoggingOut(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-luxe-black/80 shadow-lg shadow-black/35 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="/" className="group flex items-center gap-3" aria-label="PulsePass inicio">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-luxe-ember/30 bg-gradient-to-br from-luxe-wine to-luxe-black text-lg font-black text-red-50 shadow-lg shadow-luxe-ember/20">
            P
          </span>
          <div>
            <p className="text-base font-black tracking-tight text-white">PulsePass</p>
            <p className="hidden text-xs font-semibold uppercase tracking-[0.28em] text-red-100/45 sm:block">Los mejores eventos a tu mano</p>
          </div>
        </a>
        <div className="hidden items-center gap-8 text-sm font-semibold text-red-100/65 md:flex">
          <a className="transition hover:text-luxe-ember" href="/events">Eventos</a>
          <a className="transition hover:text-luxe-ember" href="/how-it-works">Cómo funciona</a>
          <a className="transition hover:text-luxe-ember" href="/">Organizadores</a>
        </div>
        <div className="flex items-center gap-3">
          {loading ? null : authenticated && user ? (
            <>
              <a
                href="/my-profile"
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-red-100/70 transition hover:border-luxe-ember/40 hover:text-luxe-ember sm:inline-flex"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{user.displayName || user.email}</span>
              </a>
              <a
                href="/my-tickets"
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-red-100/70 transition hover:border-luxe-ember/40 hover:text-luxe-ember sm:inline-flex"
              >
                <Ticket className="h-4 w-4" />
                <span>Mis tickets</span>
              </a>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-red-100/50 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {loggingOut ? 'Cerrando…' : 'Salir'}
                </span>
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-red-100/70 transition hover:border-luxe-ember/40 hover:text-luxe-ember sm:inline-flex"
              >
                Iniciar sesión
              </a>
              <Button href="/register" variant="glow" className="hidden sm:inline-flex">
                Registrarse
              </Button>
              <Button href="/events" variant="secondary" className="hidden sm:inline-flex">
                Explorar
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
