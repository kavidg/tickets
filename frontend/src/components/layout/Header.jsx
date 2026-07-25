import { useState, useEffect } from 'react';
import { LogOut, Menu, Ticket, User, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Modern sticky header with transparent-to-blur transition on scroll.
 * Includes hamburger menu for mobile navigation.
 */
export default function Header() {
  const { user, loading, authenticated, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track scroll position for blur effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    const response = await logout();
    if (response.success) {
      window.location.href = '/';
    }
    setLoggingOut(false);
  }

  const navLinks = [
    { href: '/events', label: 'Eventos' },
    { href: '/organizer/dashboard', label: 'Organizador' },
    { href: '/tickets/search', label: 'Mis entradas' },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-neutral-900/80 shadow-lg shadow-black/20 backdrop-blur-2xl'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="group flex items-center gap-2.5" aria-label="PulsePass inicio">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-sm font-black text-white shadow-glow transition group-hover:shadow-glow-lg">
            P
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            PulsePass
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/[0.05] hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : authenticated && user ? (
            <>
              <a
                href="/my-tickets"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-neutral-800/50 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-white/[0.15] hover:text-white"
              >
                <Ticket className="h-4 w-4" />
                <span>Mis tickets</span>
              </a>
              <a
                href="/my-profile"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-neutral-800/50 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-white/[0.15] hover:text-white"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{user.displayName || user.email}</span>
              </a>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-neutral-800/30 px-3 py-2 text-sm font-medium text-neutral-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="rounded-xl border border-white/[0.08] bg-neutral-800/50 px-5 py-2 text-sm font-semibold text-neutral-200 shadow-sm transition hover:border-white/20 hover:bg-neutral-700 hover:text-white"
            >
              Ingresar
            </a>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-xl border border-white/[0.08] bg-neutral-800/50 p-2.5 text-neutral-300 transition hover:text-white md:hidden"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="animate-fade-in-down border-t border-white/[0.06] bg-neutral-900/95 backdrop-blur-2xl md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-white/[0.06] my-3" />
            {authenticated && user ? (
              <>
                <a
                  href="/my-tickets"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Ticket className="h-4 w-4" />
                  Mis tickets
                </a>
                <a
                  href="/my-profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <User className="h-4 w-4" />
                  {user.displayName || user.email}
                </a>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? 'Cerrando...' : 'Cerrar sesión'}
                </button>
              </>
            ) : (
              <a
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                Ingresar
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
