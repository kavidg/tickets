/**
 * TicketS - PurchaseSuccessPage
 *
 * Página posterior al redirect de Bold.
 * Lee params de URL y sessionStorage.
 */

import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Clock, Ticket, XCircle } from 'lucide-react';

function formatCOP(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

function getBoldParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    boldOrderId: params.get('bold-order-id'),
    boldStatus: params.get('bold-tx-status'),
  };
}

function getStatusConfig(boldStatus) {
  switch (boldStatus) {
    case 'approved':
      return {
        icon: CheckCircle,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/10',
        iconBorder: 'border-emerald-500/20',
        title: 'Pago confirmado',
        subtitle: 'Tu compra fue procesada exitosamente',
        statusLabel: 'Pagado',
        statusClass: 'text-emerald-400',
      };
    case 'rejected':
    case 'declined':
      return {
        icon: XCircle,
        iconColor: 'text-red-400',
        iconBg: 'bg-red-500/10',
        iconBorder: 'border-red-500/20',
        title: 'Pago rechazado',
        subtitle: 'El pago no pudo completarse',
        statusLabel: 'Rechazado',
        statusClass: 'text-red-400',
      };
    default:
      return {
        icon: Clock,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/10',
        iconBorder: 'border-amber-500/20',
        title: 'Compra creada',
        subtitle: 'Pendiente de confirmación de pago',
        statusLabel: 'Pendiente',
        statusClass: 'text-amber-400',
      };
  }
}

export default function PurchaseSuccessPage() {
  const [purchaseData, setPurchaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { boldOrderId, boldStatus } = getBoldParams();
  const cfg = getStatusConfig(boldStatus);
  const StatusIcon = cfg.icon;

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('last_purchase_data');
      if (stored) setPurchaseData(JSON.parse(stored));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return null;

  return (
    <main className="min-h-screen bg-neutral-900 pt-24">
      <div className="section-container pb-16">
        <div className="mx-auto max-w-lg">
          <div className="card-base p-6 sm:p-8">
            {/* Status icon */}
            <div className={`mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border ${cfg.iconBg} ${cfg.iconBorder}`}>
              <StatusIcon className={`h-8 w-8 ${cfg.iconColor}`} />
            </div>

            <h1 className="text-center text-xl font-bold text-white">{cfg.title}</h1>
            <p className={`mt-1 text-center text-sm ${cfg.statusClass}/80`}>{cfg.subtitle}</p>

            {/* Bold order info */}
            {boldOrderId && (
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-neutral-800/50 px-4 py-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">ID Bold</span>
                  <span className="font-mono text-xs text-white">{boldOrderId}</span>
                </div>
              </div>
            )}

            {/* Purchase data */}
            {purchaseData ? (
              <div className="mt-4 space-y-2.5 rounded-xl border border-white/[0.06] bg-neutral-800/50 px-4 py-3.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Evento</span>
                  <span className="font-medium text-white">{purchaseData.eventTitle || purchaseData.eventId || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Referencia</span>
                  <code className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-xs text-neutral-300">
                    {(purchaseData.reference || '').slice(0, 24) || '—'}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Estado</span>
                  <span className={`font-semibold uppercase ${cfg.statusClass}`}>
                    {purchaseData.status || 'pending'}
                  </span>
                </div>
                <hr className="border-white/[0.06]" />
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-white">{formatCOP(purchaseData.total)}</span>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-neutral-500">No se encontraron datos de la compra.</p>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/my-tickets"
                className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-base"
              >
                <Ticket className="h-4 w-4" />
                Ver mis entradas
              </a>
              <a
                href="/"
                className="btn-secondary flex w-full items-center justify-center gap-2 py-3"
              >
                Explorar más eventos <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
