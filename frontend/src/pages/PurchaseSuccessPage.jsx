/**
 * TicketS - PurchaseSuccessPage
 *
 * Página posterior al redirect de Bold.
 *
 * Bold redirige a /purchase/success?bold-order-id=xxx&bold-tx-status=approved
 *
 * Lee parámetros de la URL (para BrowserRouter) y datos complementarios
 * desde sessionStorage (establecidos por CheckoutPage).
 *
 * Formato esperado en last_purchase_data:
 *   { purchaseId, eventId, reference, total, status: "pending" }
 *
 * Formato esperado en query params (desde Bold):
 *   ?bold-order-id=CNPCGSPS2WBA8&bold-tx-status=approved
 */

import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Clock, Ticket, XCircle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCOP(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Lee los parámetros de Bold desde window.location.search.
 * Con BrowserRouter, Bold redirige con query params estándar:
 *   ?bold-order-id=xxx&bold-tx-status=approved
 */
function getBoldParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    boldOrderId: params.get('bold-order-id'),
    boldStatus: params.get('bold-tx-status'),
  };
}

/**
 * Determina la configuración visual según el estado devuelto por Bold.
 */
function getStatusConfig(boldStatus) {
  switch (boldStatus) {
    case 'approved':
      return {
        icon: CheckCircle,
        iconBg: 'border-emerald-500/30 bg-gradient-to-br from-emerald-700 to-luxe-black shadow-emerald-500/15',
        iconColor: 'text-emerald-400',
        title: 'Pago confirmado',
        subtitle: 'Tu compra fue procesada exitosamente',
        statusLabel: 'Pagado',
        statusClass: 'text-emerald-400',
      };
    case 'rejected':
    case 'declined':
      return {
        icon: XCircle,
        iconBg: 'border-red-500/30 bg-gradient-to-br from-red-700 to-luxe-black shadow-red-500/15',
        iconColor: 'text-red-400',
        title: 'Pago rechazado',
        subtitle: 'El pago no pudo completarse. Intenta de nuevo.',
        statusLabel: 'Rechazado',
        statusClass: 'text-red-400',
      };
    default:
      return {
        icon: Clock,
        iconBg: 'border-amber-500/30 bg-gradient-to-br from-amber-600/40 to-amber-800/20 shadow-amber-500/15',
        iconColor: 'text-amber-400',
        title: 'Compra creada correctamente',
        subtitle: 'Pendiente de confirmación de pago',
        statusLabel: 'Pendiente',
        statusClass: 'text-amber-400',
      };
  }
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function PurchaseSuccessPage() {
  const [purchaseData, setPurchaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Leer parámetros de Bold desde la URL (redirect desde Bold)
  const { boldOrderId, boldStatus } = getBoldParams();
  const cfg = getStatusConfig(boldStatus);
  const StatusIcon = cfg.icon;

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('last_purchase_data');
      if (stored) {
        setPurchaseData(JSON.parse(stored));
      }
    } catch {
      // Ignorar errores de parseo
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return null;

  return (
    <main className="relative mx-auto max-w-2xl px-4 py-12">
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-luxe-wine/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-luxe-ember/10 blur-3xl" />

      <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 shadow-deep-luxe backdrop-blur-2xl">
        <div className={`mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border ${cfg.iconBg} shadow-lg`}>
          <StatusIcon className={`h-10 w-10 ${cfg.iconColor}`} />
        </div>

        <h1 className="text-center text-3xl font-black tracking-tight text-white">
          {cfg.title}
        </h1>
        <p className={`mt-2 text-center text-sm font-semibold ${cfg.statusClass}/80`}>
          {cfg.subtitle}
        </p>

        {/* Parámetros de Bold (cuando hay redirect) */}
        {boldOrderId && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-luxe-black/60 px-5 py-3">
            <div className="flex justify-between text-sm">
              <span className="text-red-100/50">ID Bold</span>
              <span className="font-mono text-xs text-white">
                {boldOrderId}
              </span>
            </div>
          </div>
        )}

        {/* Datos de la compra */}
        {purchaseData ? (
          <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-luxe-black/60 px-5 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-red-100/50">Evento</span>
              <span className="font-bold text-white">
                {purchaseData.eventTitle || purchaseData.eventId || '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-100/50">Referencia</span>
              <span className="font-mono text-xs text-white">
                {(purchaseData.reference || '').slice(0, 24) || '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-100/50">Estado</span>
              <span className={`font-bold uppercase ${cfg.statusClass}`}>
                {purchaseData.status || 'pending'}
              </span>
            </div>
            <hr className="border-white/10" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-white">Total</span>
              <span className="font-black text-white">
                {formatCOP(purchaseData.total)}
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-red-100/50">
            No se encontraron datos de la compra.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <a
            href="/my-tickets"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-luxe-ember/45 bg-gradient-to-r from-luxe-crimson to-luxe-ember px-6 py-4 text-base font-black text-white shadow-2xl shadow-luxe-ember/25 transition hover:-translate-y-0.5 hover:from-luxe-wine hover:to-luxe-crimson"
          >
            <Ticket className="h-5 w-5" />
            Ver mis entradas
          </a>

          <a
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-3 text-sm font-bold text-red-100/60 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-white/20 hover:text-white"
          >
            Explorar más eventos <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </main>
  );
}
