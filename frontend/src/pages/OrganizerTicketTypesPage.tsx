/**
 * TicketS - OrganizerTicketTypesPage
 *
 * Página de administración de tipos de entrada de un evento.
 * Muestra la lista de tipos de entrada existentes y permite crear nuevos.
 *
 * Ruta: #/organizer/events/manage/:id/tickets
 *
 * @see useTicketTypesByEvent para el hook de datos.
 * @see TicketTypeForm para el formulario de creación.
 */

import { useState } from 'react';
import { useOrganizerEvent } from '../hooks/useOrganizerEvent';
import { useTicketTypesByEvent } from '../hooks/useTicketTypesByEvent';
import TicketTypeForm from '../components/tickets/TicketTypeForm';
import type { TicketTypeFormData } from '../components/tickets/TicketTypeForm';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formatea un número como moneda COP.
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Configuración visual de cada estado del tipo de entrada.
 */
const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  active: {
    label: 'A la venta',
    className: 'bg-green-500/15 text-green-300 border-green-500/25',
  },
  paused: {
    label: 'Pausada',
    className: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  },
  sold_out: {
    label: 'Agotada',
    className: 'bg-red-500/15 text-red-300 border-red-500/25',
  },
  closed: {
    label: 'Cerrada',
    className: 'bg-white/10 text-red-100/50 border-white/10',
  },
};

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------

/** Esqueleto de carga */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/35 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-28 rounded bg-white/8" />
              <div className="h-4 w-20 rounded bg-white/8" />
            </div>
            <div className="h-6 w-16 rounded bg-white/8" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

/**
 * Página de administración de tipos de entrada de un evento.
 */
export default function OrganizerTicketTypesPage() {
  // Extraer eventId del pathname: /organizer/events/manage/<id>/tickets
  const match = window.location.pathname.match(
    /^\/organizer\/events\/manage\/([^/]+)\/tickets$/,
  );
  const eventId = match ? decodeURIComponent(match[1]) : undefined;

  const { event: organizerEvent } = useOrganizerEvent(eventId);

  const {
    ticketTypes,
    loading,
    saving,
    error,
    successMessage,
    reload,
    createTicketType,
    updateTicketType,
    deleteTicketType,
  } = useTicketTypesByEvent(eventId);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  async function handleCreate(data: TicketTypeFormData) {
    const ok = await createTicketType({
      name: data.name,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
      organizationId: organizerEvent?.organizationId || '',
      salesStartDate: data.salesStartDate || undefined,
      salesEndDate: data.salesEndDate || undefined,
    });
    if (ok) setShowForm(false);
  }

  async function handleUpdate(data: TicketTypeFormData) {
    if (!editingId) return;
    const ok = await updateTicketType(editingId, {
      name: data.name,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
      status: data.active ? 'active' : 'paused',
      salesStartDate: data.salesStartDate || undefined,
      salesEndDate: data.salesEndDate || undefined,
    });
    if (ok) setEditingId(null);
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <main className="relative mx-auto max-w-4xl px-4 py-12">
      {/* Fondos decorativos */}
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-brand-muted/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative">
        {/* Navegación superior */}
        <a
          href={`/organizer/events/manage/${eventId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-red-100/50 transition hover:text-brand"
        >
          ← Gestión del evento
        </a>

        {/* Encabezado */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand">
              Boletas
            </p>
            {organizerEvent && (
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-red-100/40">
                {organizerEvent.title}
              </p>
            )}
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
              Tipos de entrada
            </h1>
            <p className="mt-2 text-red-100/60">
              Administra los tipos de entrada, precios y disponibilidad
            </p>
          </div>
          {!showForm && !editingId && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-brand/45 bg-gradient-to-r from-brand to-brand px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-brand/25 transition hover:from-brand-muted hover:to-brand"
            >
              + Nueva entrada
            </button>
          )}
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div
            className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-300"
            role="status"
          >
            {successMessage}
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div
            className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Formulario de creación */}
        {showForm && (
          <div className="mb-8">
            <TicketTypeForm
              onSubmit={handleCreate}
              saving={saving}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Formulario de edición */}
        {editingId && (() => {
          const editingTicket = ticketTypes.find((t) => t.id === editingId);
          if (!editingTicket) return null;

          function toLocalDateTime(ts: { _seconds: number; _nanoseconds: number } | undefined): string {
            if (!ts) return '';
            const d = new Date(ts._seconds * 1000);
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          }

          return (
            <div className="mb-8">
              <TicketTypeForm
                initialData={{
                  name: editingTicket.name,
                  description: editingTicket.description || '',
                  price: editingTicket.price,
                  quantity: editingTicket.quantity,
                  salesStartDate: toLocalDateTime(editingTicket.salesStartDate),
                  salesEndDate: toLocalDateTime(editingTicket.salesEndDate),
                  active: editingTicket.status === 'active',
                }}
                onSubmit={handleUpdate}
                saving={saving}
                onCancel={() => setEditingId(null)}
              />
            </div>
          );
        })()}

        {/* Contenido */}
        {loading ? (
          <LoadingSkeleton />
        ) : ticketTypes.length === 0 && !showForm ? (
          /* Sin boletas */
          <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] p-12 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <span className="text-2xl">🎟️</span>
            </div>
            <p className="text-xl font-black text-white">
              Aún no hay tipos de entrada
            </p>
            <p className="mt-2 text-sm text-red-100/50">
              Crea el primer tipo de entrada para comenzar a vender.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-brand/45 bg-gradient-to-r from-brand to-brand px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-brand/25 transition hover:from-brand-muted hover:to-brand"
            >
              + Crear entrada
            </button>
          </div>
        ) : (
          /* Lista de tipos de entrada */
          <div className="space-y-4">
            {ticketTypes.map((ticket) => {
              const statusCfg =
                STATUS_CONFIG[ticket.status] || STATUS_CONFIG.closed;
              const soldPercent =
                ticket.quantity > 0
                  ? Math.round((ticket.soldQuantity / ticket.quantity) * 100)
                  : 0;

              return (
                <div
                  key={ticket.id}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/35 backdrop-blur-xl transition hover:border-brand/30"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black text-white">
                          {ticket.name}
                        </h3>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusCfg.className}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      {ticket.description && (
                        <p className="mt-1 text-sm text-red-100/50 line-clamp-1">
                          {ticket.description}
                        </p>
                      )}
                    </div>

                    {/* Precio */}
                    <div className="text-right">
                      <p className="text-2xl font-black text-white">
                        {formatCurrency(ticket.price)}
                      </p>
                    </div>
                  </div>

                  {/* Barra de progreso de ventas */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-red-100/50">
                      <span>
                        {ticket.soldQuantity} vendida
                        {ticket.soldQuantity !== 1 ? 's' : ''}
                      </span>
                      <span>
                        {ticket.quantity - ticket.soldQuantity} disponible
                        {ticket.quantity - ticket.soldQuantity !== 1
                          ? 's'
                          : ''}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          soldPercent >= 90
                            ? 'bg-red-400'
                            : soldPercent >= 60
                              ? 'bg-yellow-400'
                              : 'bg-green-400'
                        }`}
                        style={{ width: `${Math.min(soldPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => setEditingId(ticket.id)}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-bold text-red-100/60 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-brand/40 hover:text-brand disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            `¿Eliminar "${ticket.name}"? Esta acción no se puede deshacer.`,
                          )
                        ) {
                          await deleteTicketType(ticket.id);
                        }
                      }}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-2 text-xs font-bold text-red-300/70 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Conteo */}
            <p className="pt-2 text-center text-xs text-red-100/40">
              {ticketTypes.length} tipo{ticketTypes.length !== 1 ? 's' : ''} de
              entrada registrado{ticketTypes.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
