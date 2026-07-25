/**
 * TicketS - TicketTypeForm
 *
 * Formulario para crear o editar un tipo de entrada.
 * Sigue el diseño glassmorphism de la plataforma.
 *
 * @example
 * // Crear nuevo
 * <TicketTypeForm
 *   onSubmit={async (data) => { await createTicketType(data); }}
 *   saving={false}
 * />
 *
 * // Editar existente
 * <TicketTypeForm
 *   initialData={{ name: 'VIP', description: '...', price: 150000, quantity: 100 }}
 *   onSubmit={async (data) => { await updateTicketType(id, data); }}
 *   saving={false}
 * />
 */

import { useState, type FormEvent } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface TicketTypeFormData {
  name: string;
  description: string;
  price: number;
  quantity: number;
  salesStartDate: string;
  salesEndDate: string;
  active: boolean;
}

interface TicketTypeFormProps {
  /** Datos iniciales para edición */
  initialData?: Partial<TicketTypeFormData>;
  /** Función que se ejecuta al enviar el formulario */
  onSubmit: (data: TicketTypeFormData) => Promise<void>;
  /** Indica si se está guardando */
  saving: boolean;
  /** Función para cancelar / cerrar el formulario */
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Formulario para crear o editar un tipo de entrada.
 */
export default function TicketTypeForm({
  initialData,
  onSubmit,
  saving,
  onCancel,
}: TicketTypeFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '');
  const [salesStartDate, setSalesStartDate] = useState(initialData?.salesStartDate || '');
  const [salesEndDate, setSalesEndDate] = useState(initialData?.salesEndDate || '');
  const [active, setActive] = useState(initialData?.active !== false);
  const [error, setError] = useState('');

  // -----------------------------------------------------------------------
  // Validación
  // -----------------------------------------------------------------------

  function validate(): string | null {
    if (!name.trim()) return 'El nombre es obligatorio.';
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) return 'El precio debe ser mayor a 0.';
    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) return 'La cantidad debe ser mayor a 0.';

    if (salesStartDate && salesEndDate) {
      const start = new Date(salesStartDate);
      const end = new Date(salesEndDate);
      if (end <= start) return 'La fecha de fin de venta debe ser posterior a la de inicio.';
    }

    return null;
  }

  // -----------------------------------------------------------------------
  // Envío
  // -----------------------------------------------------------------------

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
      salesStartDate,
      salesEndDate,
      active,
    });
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 shadow-deep-luxe backdrop-blur-2xl"
      noValidate
    >
      <h3 className="text-lg font-black tracking-tight text-white">
        {initialData ? 'Editar tipo de entrada' : 'Nuevo tipo de entrada'}
      </h3>
      <p className="mt-1 text-sm text-red-100/50">
        {initialData
          ? 'Modifica los campos del tipo de entrada'
          : 'Agrega un nuevo tipo de entrada al evento'}
      </p>

      {/* Mensaje de error */}
      {error && (
        <div
          className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="mt-5 space-y-4">
        {/* Nombre */}
        <div>
          <label
            htmlFor="ticket-name"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60"
          >
            Nombre *
          </label>
          <input
            id="ticket-name"
            type="text"
            placeholder="General, VIP, Palco…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
          />
        </div>

        {/* Precio */}
        <div>
          <label
            htmlFor="ticket-price"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60"
          >
            Precio * (COP)
          </label>
          <input
            id="ticket-price"
            type="number"
            min="0"
            step="100"
            placeholder="50000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={saving}
            className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
          />
        </div>

        {/* Cantidad */}
        <div>
          <label
            htmlFor="ticket-qty"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60"
          >
            Cantidad disponible *
          </label>
          <input
            id="ticket-qty"
            type="number"
            min="1"
            step="1"
            placeholder="500"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={saving}
            className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
          />
        </div>

        {/* Descripción */}
        <div>
          <label
            htmlFor="ticket-desc"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60"
          >
            Descripción (opcional)
          </label>
          <textarea
            id="ticket-desc"
            rows={2}
            placeholder="Acceso preferencial, incluye bebida de bienvenida…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
            className="w-full resize-none rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
          />
        </div>

        {/* Fechas de venta */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="ticket-sales-start"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60"
            >
              Inicio venta
            </label>
            <input
              id="ticket-sales-start"
              type="datetime-local"
              value={salesStartDate}
              onChange={(e) => setSalesStartDate(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50 [color-scheme:dark]"
            />
          </div>
          <div>
            <label
              htmlFor="ticket-sales-end"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60"
            >
              Fin venta
            </label>
            <input
              id="ticket-sales-end"
              type="datetime-local"
              value={salesEndDate}
              onChange={(e) => setSalesEndDate(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Activo */}
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-3 transition hover:border-white/20">
          <div className="relative">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              disabled={saving}
              className="peer sr-only"
            />
            <div className="h-5 w-10 rounded-full border border-white/15 bg-luxe-black transition peer-checked:border-green-500/50 peer-checked:bg-green-500/30" />
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white/20 transition peer-checked:translate-x-5 peer-checked:bg-green-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {active ? 'Activo' : 'Inactivo'}
            </p>
            <p className="text-xs text-red-100/40">
              {active
                ? 'Disponible para la venta al público'
                : 'No se mostrará en la venta de entradas'}
            </p>
          </div>
        </label>
      </div>

      {/* Botones */}
      <div className="mt-6 flex items-center gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-red-100/60 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-white/20 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-2xl border border-luxe-ember/45 bg-gradient-to-r from-luxe-crimson to-luxe-ember px-4 py-2.5 text-sm font-bold text-white shadow-2xl shadow-luxe-ember/25 transition hover:from-luxe-wine hover:to-luxe-crimson disabled:opacity-50"
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Guardando…
            </span>
          ) : initialData ? (
            'Guardar cambios'
          ) : (
            'Crear entrada'
          )}
        </button>
      </div>
    </form>
  );
}
