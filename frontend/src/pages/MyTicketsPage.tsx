/**
 * TicketS - MyTicketsPage
 *
 * Página de entradas adquiridas por el usuario.
 * Muestra los tickets agrupados por evento, con código QR y descarga PDF.
 *
 * Ruta: #/my-tickets (protegida)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  Download,
  Loader2,
  QrCode,
  Ticket as TicketIcon,
} from 'lucide-react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import auth from '../firebase/auth';
import { getUserTickets } from '../services/ticket.service';
import type { Ticket } from '../types/ticket';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formatea un timestamp de Firestore a fecha legible.
 */
function formatDate(ts: { _seconds?: number; toDate?: () => Date } | undefined): string {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date((ts as { _seconds: number })._seconds * 1000);
  return d.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Genera QR como data URL desde un texto.
 */
async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });
  } catch {
    return '';
  }
}

/**
 * Genera y descarga un PDF con el ticket.
 */
async function downloadTicketPdf(
  ticket: Ticket,
  eventTitle: string,
  eventDate: string,
  eventLocation: string,
): Promise<void> {
  const qrDataUrl = await generateQrDataUrl(ticket.code || ticket.id);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [100, 160], // Ticket size: 100mm x 160mm
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Fondo
  doc.setFillColor(10, 10, 30);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Borde ember
  doc.setDrawColor(230, 87, 47);
  doc.setLineWidth(0.8);
  doc.rect(3, 3, pageW - 6, pageH - 6);

  // Título
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(eventTitle, pageW / 2, 14, { align: 'center' });

  // Línea separadora
  doc.setDrawColor(230, 87, 47);
  doc.setLineWidth(0.3);
  doc.line(10, 18, pageW - 10, 18);

  // QR
  if (qrDataUrl) {
    const qrSize = 50;
    const qrX = (pageW - qrSize) / 2;
    doc.addImage(qrDataUrl, 'PNG', qrX, 23, qrSize, qrSize);
  }

  // Código del ticket
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 210);
  doc.text(ticket.code || ticket.id.slice(0, 16), pageW / 2, 79, {
    align: 'center',
  });

  // Info
  doc.setFontSize(6.5);
  doc.setTextColor(180, 180, 190);
  doc.text(`Fecha: ${eventDate}`, pageW / 2, 86, { align: 'center' });
  doc.text(eventLocation, pageW / 2, 91, { align: 'center' });

  doc.save(`ticket-${ticket.code || ticket.id.slice(0, 8)}.pdf`);
}

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20">
      <div className="animate-pulse space-y-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6"
          >
            <div className="mb-4 h-6 w-48 rounded bg-white/8" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="h-40 rounded-xl bg-white/8" />
              <div className="h-40 rounded-xl bg-white/8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] p-12 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
        <TicketIcon className="h-8 w-8 text-red-100/40" />
      </div>
      <p className="text-xl font-black text-white">Aún no tienes entradas</p>
      <p className="mt-2 text-sm text-red-100/50">
        Cuando compres entradas para un evento, aparecerán aquí.
      </p>
      <a
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-brand/45 bg-gradient-to-r from-brand to-brand px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-brand/25 transition hover:from-brand-muted hover:to-brand"
      >
        Explorar eventos <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});
  const [downloading, setDownloading] = useState<string | null>(null);

  // -----------------------------------------------------------------------
  // Cargar tickets
  // -----------------------------------------------------------------------

  const fetchTickets = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await getUserTickets(user.uid);
      if (response.success && response.data) {
        setTickets(response.data);
      } else {
        setError(response.error || 'Error al cargar tus entradas.');
      }
    } catch {
      setError('Error inesperado al cargar las entradas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // -----------------------------------------------------------------------
  // Generar QR cuando cambien los tickets
  // -----------------------------------------------------------------------

  useEffect(() => {
    tickets.forEach(async (ticket) => {
      const code = ticket.code || ticket.id;
      if (!qrUrls[code]) {
        const url = await generateQrDataUrl(code);
        setQrUrls((prev) => ({ ...prev, [code]: url }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets]);

  // -----------------------------------------------------------------------
  // Agrupar tickets por evento
  // -----------------------------------------------------------------------

  const groups = tickets.reduce<Record<string, Ticket[]>>((acc, ticket) => {
    const key = ticket.eventId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ticket);
    return acc;
  }, {});

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="relative mx-auto max-w-4xl px-4 py-12">
      {/* Fondos decorativos */}
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-brand-muted/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative">
        {/* Encabezado */}
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-brand">
            Boletas
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
            Mis entradas
          </h1>
          <p className="mt-2 text-red-100/60">
            {tickets.length} entrada{tickets.length !== 1 ? 's' : ''} adquirida
            {tickets.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Contenido */}
        {tickets.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {Object.entries(groups).map(([eventId, eventTickets]) => {
              const first = eventTickets[0];
              const eventDate = formatDate(
                first.createdAt as unknown as {
                  _seconds?: number;
                  toDate?: () => Date;
                },
              );

              return (
                <div
                  key={eventId}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/35 backdrop-blur-xl"
                >
                  {/* Info del grupo */}
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-100/40">
                      Evento
                    </p>
                    <p className="text-lg font-black text-white">
                      {eventId.slice(0, 12)}…
                    </p>
                    <p className="text-xs text-red-100/50">Comprado el {eventDate}</p>
                  </div>

                  {/* Tickets */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {eventTickets.map((ticket) => {
                      const code = ticket.code || ticket.id;
                      const qrUrl = qrUrls[code];
                      const statusCfg =
                        ticket.status === 'used'
                          ? { label: 'Usada', cls: 'bg-blue-500/15 text-blue-300 border-blue-500/25' }
                          : ticket.status === 'cancelled'
                            ? { label: 'Cancelada', cls: 'bg-red-500/15 text-red-300 border-red-500/25' }
                            : { label: 'Activa', cls: 'bg-green-500/15 text-green-300 border-green-500/25' };

                      return (
                        <div
                          key={ticket.id}
                          className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 transition hover:border-brand/30"
                        >
                          {/* Header del ticket */}
                          <div className="mb-3 flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <QrCode className="h-4 w-4 text-brand" />
                              <span className="text-xs font-bold text-red-100/50">
                                {code.slice(0, 12)}…
                              </span>
                            </div>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusCfg.cls}`}
                            >
                              {statusCfg.label}
                            </span>
                          </div>

                          {/* QR */}
                          {qrUrl ? (
                            <div className="mb-3 flex justify-center">
                              <img
                                src={qrUrl}
                                alt={`QR ${code}`}
                                className="h-28 w-28 rounded-lg bg-white p-1"
                              />
                            </div>
                          ) : (
                            <div className="mb-3 flex h-28 w-full items-center justify-center rounded-lg bg-white/5">
                              <Loader2 className="h-6 w-6 animate-spin text-red-100/30" />
                            </div>
                          )}

                          {/* Código completo */}
                          <p className="mb-3 truncate text-center font-mono text-[10px] text-red-100/40">
                            {code}
                          </p>

                          {/* Acciones */}
                          {ticket.status === 'active' && (
                            <button
                              onClick={async () => {
                                setDownloading(ticket.id);
                                try {
                                  await downloadTicketPdf(
                                    ticket,
                                    `Evento ${eventId.slice(0, 12)}…`,
                                    eventDate,
                                    '',
                                  );
                                } finally {
                                  setDownloading(null);
                                }
                              }}
                              disabled={downloading === ticket.id}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand-muted/30 px-3 py-2 text-xs font-bold text-brand transition hover:bg-brand-muted/60 disabled:opacity-50"
                            >
                              {downloading === ticket.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Download className="h-3.5 w-3.5" />
                              )}
                              Descargar PDF
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
