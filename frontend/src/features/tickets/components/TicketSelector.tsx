/**
 * TicketS - TicketSelector
 *
 * Componente interactivo para seleccionar cantidad de entradas por tipo.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { CheckCircle2, Minus, Plus, ShoppingCart } from 'lucide-react';

import type { TicketType } from '../../../types/ticketType';
import { formatPrice } from '../../../utils/format';

export interface TicketSelection {
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
}

interface TicketSelectorProps {
  ticketTypes: TicketType[];
  onSelectionChange?: (selection: TicketSelection[]) => void;
}

export default function TicketSelector({ ticketTypes, onSelectionChange }: TicketSelectorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const activeTypes = useMemo(
    () => ticketTypes.filter((t) => t.status === 'active'),
    [ticketTypes],
  );

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

  useEffect(() => {
    const selection: TicketSelection[] = Object.entries(quantities).map(([id, qty]) => {
      const ticket = ticketTypes.find((t) => t.id === id);
      return { ticketTypeId: id, quantity: qty, unitPrice: ticket?.price ?? 0 };
    });
    onSelectionChange?.(selection);
  }, [quantities, ticketTypes, onSelectionChange]);

  const { subtotal, totalItems } = useMemo(() => {
    let sub = 0;
    let items = 0;
    for (const [id, qty] of Object.entries(quantities)) {
      const ticket = ticketTypes.find((t) => t.id === id);
      if (ticket) { sub += ticket.price * qty; items += qty; }
    }
    return { subtotal: sub, totalItems: items };
  }, [quantities, ticketTypes]);

  if (activeTypes.length === 0) return null;

  return (
    <div className="space-y-3">
      {activeTypes.map((ticket) => {
        const qty = quantities[ticket.id] ?? 0;
        const available = ticket.quantity - ticket.soldQuantity;
        const isMaxed = qty >= available;
        const isSelected = qty > 0;

        return (
          <div
            key={ticket.id}
            className={`card-base p-4 sm:p-5 transition-all duration-200 ${
              isSelected ? 'border-brand/30 bg-brand/5' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-white">{ticket.name}</p>
                {ticket.description && (
                  <p className="mt-1.5 flex items-start gap-1.5 text-xs text-neutral-400">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-light" />
                    {ticket.description}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-neutral-500">
                  {available} {available === 1 ? 'disponible' : 'disponibles'}
                </p>
              </div>
              <p className="whitespace-nowrap text-xl font-bold text-white">
                {formatPrice(ticket.price)}
              </p>
            </div>

            {/* Quantity control */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={qty === 0}
                  onClick={() => updateQuantity(ticket.id, -1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-neutral-800 text-neutral-400 transition hover:border-brand/30 hover:text-brand-light disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Reducir"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[2ch] text-center text-base font-semibold text-white">{qty}</span>
                <button
                  type="button"
                  disabled={isMaxed}
                  onClick={() => updateQuantity(ticket.id, 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand/30 bg-brand/20 text-brand-light transition hover:bg-brand/30 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Aumentar"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {qty > 0 && (
                <p className="text-sm font-semibold text-brand-light">{formatPrice(ticket.price * qty)}</p>
              )}
            </div>
          </div>
        );
      })}

      {/* Summary bar */}
      {totalItems > 0 && (
        <div className="sticky bottom-4 card-base border-brand/20 bg-neutral-850/95 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <ShoppingCart className="h-4 w-4 text-brand-light" />
              <span className="text-neutral-300">
                {totalItems} {totalItems === 1 ? 'entrada' : 'entradas'}
              </span>
            </div>
            <p className="text-xl font-bold text-white">{formatPrice(subtotal)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
