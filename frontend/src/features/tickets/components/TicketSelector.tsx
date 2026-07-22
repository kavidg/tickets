/**
 * TicketS - TicketSelector
 *
 * Componente interactivo para seleccionar cantidad de entradas por tipo.
 *
 * Responsabilidad:
 *   - Mostrar tipos de entrada activos (disponibles para la venta).
 *   - Permitir seleccionar cantidad respetando el stock disponible.
 *   - Calcular subtotal de la selección actual.
 *   - Emitir la selección mediante callback.
 *
 * Arquitectura:
 *   EventDetailPage → useTicketTypes(eventId) → TicketSelector → onSelectionChange
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { CheckCircle2, Minus, Plus, ShoppingCart } from 'lucide-react';

import type { TicketType } from '../../../types/ticketType';
import { formatPrice } from '../../../utils/format';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Item seleccionado emitido hacia el padre */
export interface TicketSelection {
  /** ID del tipo de entrada */
  ticketTypeId: string;
  /** Cantidad seleccionada */
  quantity: number;
  /** Precio unitario (para que el padre pueda calcular totals) */
  unitPrice: number;
}

/** Props del componente */
interface TicketSelectorProps {
  /** Tipos de entrada del evento (desde useTicketTypes) */
  ticketTypes: TicketType[];
  /** Callback que se dispara cada vez que cambia la selección */
  onSelectionChange?: (selection: TicketSelection[]) => void;
}

// (formatPrice se usa directamente desde utils/format)

// ---------------------------------------------------------------------------
// TicketSelector
// ---------------------------------------------------------------------------

/**
 * Selector interactivo de entradas.
 *
 * Muestra cada tipo de entrada activo con control de cantidad,
 * stock disponible, precio unitario y calcula el subtotal general.
 *
 * @example
 * <TicketSelector
 *   ticketTypes={ticketTypes}
 *   onSelectionChange={(sel) => console.log('Selección:', sel)}
 * />
 */
export default function TicketSelector({
  ticketTypes,
  onSelectionChange,
}: TicketSelectorProps) {
  // -----------------------------------------------------------------------
  // Estado: cantidades por tipo { [ticketTypeId]: cantidad }
  // -----------------------------------------------------------------------
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // -----------------------------------------------------------------------
  // Solo tipos activos
  // -----------------------------------------------------------------------
  const activeTypes = useMemo(
    () => ticketTypes.filter((t) => t.status === 'active'),
    [ticketTypes],
  );

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const updateQuantity = useCallback(
    (ticketTypeId: string, delta: number) => {
      setQuantities((prev) => {
        const current = prev[ticketTypeId] ?? 0;
        const next = Math.max(0, current + delta);
        const newQuantities = { ...prev, [ticketTypeId]: next };
        if (next === 0) delete newQuantities[ticketTypeId];
        return newQuantities;
      });
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Notificar al padre cuando cambien las cantidades
  // -----------------------------------------------------------------------

  useEffect(() => {
    const selection: TicketSelection[] = Object.entries(quantities)
      .map(([id, qty]) => {
        const ticket = ticketTypes.find((t) => t.id === id);
        return {
          ticketTypeId: id,
          quantity: qty,
          unitPrice: ticket?.price ?? 0,
        };
      });

    onSelectionChange?.(selection);
  }, [quantities, ticketTypes, onSelectionChange]);

  // -----------------------------------------------------------------------
  // Totales derivados
  // -----------------------------------------------------------------------

  const { subtotal, totalItems } = useMemo(() => {
    let sub = 0;
    let items = 0;
    for (const [id, qty] of Object.entries(quantities)) {
      const ticket = ticketTypes.find((t) => t.id === id);
      if (ticket) {
        sub += ticket.price * qty;
        items += qty;
      }
    }
    return { subtotal: sub, totalItems: items };
  }, [quantities, ticketTypes]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (activeTypes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Lista de tipos de entrada */}
      {activeTypes.map((ticket, index) => {
        const qty = quantities[ticket.id] ?? 0;
        const available = ticket.quantity - ticket.soldQuantity;
        const isMaxed = qty >= available;

        return (
          <div
            key={ticket.id}
            className={`rounded-[1.5rem] border p-5 shadow-2xl shadow-black/25 backdrop-blur-xl transition duration-200 ${
              qty > 0
                ? 'border-luxe-ember/35 bg-luxe-wine/30'
                : index === 1
                  ? 'border-luxe-ember/20 bg-white/[0.06]'
                  : 'border-white/10 bg-white/[0.055]'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-black text-white">{ticket.name}</p>
                {ticket.description && (
                  <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-red-100/60">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-luxe-ember" />
                    {ticket.description}
                  </p>
                )}
                <p className="mt-2 text-xs font-bold text-red-100/40">
                  {available} disponibles
                </p>
              </div>
              <p className="whitespace-nowrap text-2xl font-black text-white">
                {formatPrice(ticket.price)}
              </p>
            </div>

            {/* Control de cantidad */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={qty === 0}
                  onClick={() => updateQuantity(ticket.id, -1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-red-100/60 transition hover:border-luxe-ember/40 hover:text-luxe-ember disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Reducir cantidad"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="min-w-[2ch] text-center text-lg font-black text-white">
                  {qty}
                </span>

                <button
                  type="button"
                  disabled={isMaxed}
                  onClick={() => updateQuantity(ticket.id, 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-luxe-ember/30 bg-luxe-wine text-white transition hover:bg-luxe-crimson disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {qty > 0 && (
                <p className="text-sm font-bold text-luxe-ember">
                  {formatPrice(ticket.price * qty)}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Barra de resumen */}
      {totalItems > 0 && (
        <div className="sticky bottom-4 rounded-[1.5rem] border border-luxe-ember/35 bg-gradient-to-br from-luxe-wine/90 to-luxe-black/95 p-5 shadow-2xl shadow-luxe-ember/20 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-luxe-ember" />
              <p className="text-sm font-bold text-red-100/70">
                {totalItems} {totalItems === 1 ? 'entrada' : 'entradas'}
              </p>
            </div>
            <p className="text-2xl font-black text-white">
              {formatPrice(subtotal)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
