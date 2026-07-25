/**
 * TicketS - TicketLookupPage
 *
 * Página pública para recuperar entradas por correo electrónico.
 * No requiere autenticación.
 *
 * Flujo:
 *   1. Usuario ingresa su correo.
 *   2. GET /api/v1/tickets/public?email=email
 *   3. Muestra las entradas encontradas con QR.
 */

import { useState, useCallback } from 'react';
import { Search, Ticket, Calendar, MapPin, Loader2, ArrowLeft, AlertCircle, Mail } from 'lucide-react';
import { toDate } from '../utils/format.js';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function TicketLookupPage() {
  const [email, setEmail] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------------------------------------------------------
  // Búsqueda
  // -----------------------------------------------------------------------

  const handleSearch = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Ingresa tu correo electrónico.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(false);

    try {
      const res = await fetch(
        `${API_URL}/tickets/public?email=${encodeURIComponent(trimmed)}`,
      );
      const body = await res.json();

      if (!res.ok) {
        setError(body?.message || body?.error || 'Error al buscar entradas.');
        setLoading(false);
        return;
      }

      const data = body?.data || body;
      setTickets(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch {
      setError('No se pudo conectar con el servidor. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <main className="relative mx-auto max-w-3xl px-4 py-12">
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-luxe-wine/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-luxe-ember/10 blur-3xl" />

      <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 shadow-deep-luxe backdrop-blur-2xl">
        {/* Header */}
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-luxe-ember/30 bg-gradient-to-br from-luxe-wine to-luxe-black shadow-lg shadow-luxe-ember/15">
          <Ticket className="h-7 w-7 text-white" />
        </div>

        <h1 className="text-center text-2xl font-black tracking-tight text-white">
          Buscar mis entradas
        </h1>
        <p className="mt-2 text-center text-sm text-red-100/60">
          Ingresa el correo que usaste al comprar para ver tus entradas
        </p>

        {/* Formulario */}
        <div className="mt-6">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-red-100/30" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              placeholder="tu@correo.com"
              className="w-full rounded-xl border border-white/10 bg-luxe-black/60 py-3 pl-11 pr-4 text-sm text-white placeholder-red-100/30 shadow-lg backdrop-blur-xl transition focus:border-luxe-ember/50 focus:outline-none focus:ring-2 focus:ring-luxe-ember/20"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-luxe-ember/45 bg-gradient-to-r from-luxe-crimson to-luxe-ember px-6 py-4 text-base font-black text-white shadow-2xl shadow-luxe-ember/25 transition hover:-translate-y-0.5 hover:from-luxe-wine hover:to-luxe-crimson disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
            {loading ? 'Buscando…' : 'Buscar mis entradas'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sin resultados */}
        {searched && tickets.length === 0 && !loading && (
          <div className="mt-6 text-center">
            <p className="text-sm font-semibold text-red-100/50">
              No encontramos entradas asociadas a este correo.
            </p>
            <p className="mt-2 text-xs text-red-100/30">
              Verifica que ingresaste el mismo correo que usaste al comprar.
            </p>
          </div>
        )}

        {/* Resultados */}
        {tickets.length > 0 && (
          <div className="mt-6 space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-luxe-ember">
              {tickets.length} {tickets.length === 1 ? 'entrada encontrada' : 'entradas encontradas'}
            </p>

            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

      {/* Volver al inicio */}
      <a
        href="/"
        className="relative mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-red-100/50 transition hover:text-luxe-ember"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al inicio
      </a>
    </main>
  );
}

// ---------------------------------------------------------------------------
// TicketCard
// ---------------------------------------------------------------------------

function TicketCard({ ticket }) {
  const [qrLoaded, setQrLoaded] = useState(false);
  const [qrError, setQrError] = useState(false);

  // Formatear fecha
  let formattedDate = '';
  try {
    const date = toDate(ticket.eventDate);
    formattedDate = date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    formattedDate = ticket.eventDate || '';
  }

  // Código QR desde el código del ticket
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.code)}`;

  return (
    <div className="rounded-2xl border border-white/10 bg-luxe-black/60 p-5 shadow-lg backdrop-blur-xl transition hover:border-white/20">
      <div className="flex items-start gap-4">
        {/* QR */}
        <div className="flex-shrink-0">
          {!qrError && (
            <img
              src={qrUrl}
              alt="QR"
              width={100}
              height={100}
              onLoad={() => setQrLoaded(true)}
              onError={() => setQrError(true)}
              className={`rounded-xl transition-opacity duration-300 ${qrLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ display: qrError ? 'none' : undefined }}
            />
          )}
          {qrError && (
            <div className="flex h-[100px] w-[100px] items-center justify-center rounded-xl bg-white/5">
              <span className="text-[8px] font-mono text-white/40 break-all px-1 text-center">
                {ticket.code}
              </span>
            </div>
          )}
          {!qrLoaded && !qrError && (
            <div className="flex h-[100px] w-[100px] items-center justify-center rounded-xl bg-white/5">
              <Loader2 className="h-5 w-5 animate-spin text-white/30" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-lg font-black tracking-tight text-white truncate">
            {ticket.eventTitle}
          </p>

          <div className="flex items-center gap-2 text-xs text-red-100/50">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>

          {ticket.venueName && (
            <div className="flex items-center gap-2 text-xs text-red-100/50">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{ticket.venueName}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <span className="rounded-lg border border-luxe-ember/20 bg-luxe-ember/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-luxe-ember">
              {ticket.ticketTypeName}
            </span>
            {ticket.status !== 'active' && (
              <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
                {ticket.status}
              </span>
            )}
          </div>

          <p className="font-mono text-xs text-white/60">
            {ticket.code}
          </p>
        </div>
      </div>
    </div>
  );
}
