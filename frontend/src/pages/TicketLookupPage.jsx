/**
 * TicketS - TicketLookupPage
 *
 * Página pública para recuperar entradas por correo electrónico.
 * No requiere autenticación.
 */

import { useState, useCallback } from 'react';
import { Search, Ticket, Calendar, MapPin, Loader2, ArrowLeft, AlertCircle, Mail } from 'lucide-react';
import { toDate } from '../utils/format.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function TicketLookupPage() {
  const [email, setEmail] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed) { setError('Ingresa tu correo electrónico.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError('Correo inválido.'); return; }

    setLoading(true);
    setError(null);
    setSearched(false);

    try {
      const res = await fetch(`${API_URL}/tickets/public?email=${encodeURIComponent(trimmed)}`);
      const body = await res.json();
      if (!res.ok) { setError(body?.message || body?.error || 'Error al buscar.'); setLoading(false); return; }
      const data = body?.data || body;
      setTickets(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <main className="min-h-screen bg-neutral-900 pt-24">
      <div className="section-container pb-16">
        <div className="mx-auto max-w-lg">
          <div className="card-base p-6 sm:p-8">
            {/* Header */}
            <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-muted">
              <Ticket className="h-6 w-6 text-brand-light" />
            </div>

            <h1 className="text-center text-xl font-bold text-white">Buscar mis entradas</h1>
            <p className="mt-1 text-center text-sm text-neutral-400">
              Ingresa el correo que usaste al comprar
            </p>

            {/* Form */}
            <div className="mt-6">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                  placeholder="tu@correo.com"
                  className="input-base pl-9"
                />
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="btn-primary mt-3 flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? 'Buscando...' : 'Buscar mis entradas'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Empty state */}
            {searched && tickets.length === 0 && !loading && (
              <div className="mt-6 text-center">
                <p className="text-sm text-neutral-400">No encontramos entradas asociadas a este correo.</p>
                <p className="mt-1 text-xs text-neutral-500">Verifica que ingresaste el mismo correo de la compra.</p>
              </div>
            )}

            {/* Results */}
            {tickets.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-light">
                  {tickets.length} {tickets.length === 1 ? 'entrada encontrada' : 'entradas encontradas'}
                </p>
                {tickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </div>

          {/* Back link */}
          <a
            href="/"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm text-neutral-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </a>
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// TicketCard
// ---------------------------------------------------------------------------

function TicketCard({ ticket }) {
  const [qrLoaded, setQrLoaded] = useState(false);
  const [qrError, setQrError] = useState(false);

  let formattedDate = '';
  try {
    const date = toDate(ticket.eventDate);
    formattedDate = date.toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    formattedDate = ticket.eventDate || '';
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.code)}`;

  return (
    <div className="card-base p-4 transition hover:border-white/[0.1]">
      <div className="flex items-start gap-4">
        {/* QR */}
        <div className="flex-shrink-0">
          {!qrError && (
            <img
              src={qrUrl}
              alt="QR"
              width={96}
              height={96}
              onLoad={() => setQrLoaded(true)}
              onError={() => setQrError(true)}
              className={`rounded-xl transition-opacity duration-300 ${qrLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ display: qrError ? 'none' : undefined }}
            />
          )}
          {qrError && (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-neutral-800">
              <span className="break-all px-1 text-center font-mono text-[8px] text-neutral-500">{ticket.code}</span>
            </div>
          )}
          {!qrLoaded && !qrError && (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-neutral-800">
              <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-base font-semibold tracking-tight text-white truncate">{ticket.eventTitle}</p>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-brand-light" />
            <span className="truncate">{formattedDate}</span>
          </div>

          {ticket.venueName && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-brand-light" />
              <span className="truncate">{ticket.venueName}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-0.5">
            <span className="rounded-lg border border-brand/20 bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-light">
              {ticket.ticketTypeName}
            </span>
            {ticket.status !== 'active' && (
              <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
                {ticket.status}
              </span>
            )}
          </div>

          <p className="font-mono text-[11px] text-neutral-500">{ticket.code}</p>
        </div>
      </div>
    </div>
  );
}
