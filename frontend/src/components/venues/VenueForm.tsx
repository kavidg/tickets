/**
 * TicketS - VenueForm
 *
 * Formulario para crear o editar un lugar (venue).
 * Sigue el diseño glassmorphism de la plataforma.
 */

import { useState, type FormEvent } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface VenueFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  capacity: string;
  imageUrl: string;
}

interface VenueFormProps {
  initialData?: Partial<VenueFormData>;
  onSubmit: (data: VenueFormData) => Promise<void>;
  saving: boolean;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function VenueForm({
  initialData,
  onSubmit,
  saving,
  onCancel,
}: VenueFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [state, setState] = useState(initialData?.state || '');
  const [country, setCountry] = useState(initialData?.country || '');
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || '');
  const [latitude, setLatitude] = useState(initialData?.latitude || '');
  const [longitude, setLongitude] = useState(initialData?.longitude || '');
  const [capacity, setCapacity] = useState(initialData?.capacity || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [error, setError] = useState('');

  // -----------------------------------------------------------------------
  // Validación
  // -----------------------------------------------------------------------

  function validate(): string | null {
    if (!name.trim()) return 'El nombre es obligatorio.';
    if (!city.trim()) return 'La ciudad es obligatoria.';
    const capNum = parseInt(capacity, 10);
    if (capacity && (isNaN(capNum) || capNum < 1)) return 'La capacidad debe ser un número positivo.';
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
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      postalCode: postalCode.trim(),
      latitude: latitude.trim(),
      longitude: longitude.trim(),
      capacity: capacity.trim(),
      imageUrl: imageUrl.trim(),
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
        {initialData ? 'Editar lugar' : 'Nuevo lugar'}
      </h3>
      <p className="mt-1 text-sm text-red-100/50">
        {initialData
          ? 'Modifica los campos del lugar'
          : 'Agrega un nuevo lugar para tus eventos'}
      </p>

      {error && (
        <div
          className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="mt-5 space-y-4">
        {/* Nombre y Ciudad */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="venue-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60">
              Nombre *
            </label>
            <input
              id="venue-name" type="text" placeholder="Centro de Eventos, Acopi"
              value={name} onChange={(e) => setName(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="venue-city" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60">
              Ciudad *
            </label>
            <input
              id="venue-city" type="text" placeholder="Cali"
              value={city} onChange={(e) => setCity(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label htmlFor="venue-address" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60">
            Dirección
          </label>
          <input
            id="venue-address" type="text" placeholder="Calle 5 # 20-30"
            value={address} onChange={(e) => setAddress(e.target.value)}
            disabled={saving}
            className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
          />
        </div>

        {/* Estado, País, Código Postal */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="venue-state" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60">
              Estado / Dpto.
            </label>
            <input
              id="venue-state" type="text" placeholder="Valle del Cauca"
              value={state} onChange={(e) => setState(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="venue-country" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60">
              País
            </label>
            <input
              id="venue-country" type="text" placeholder="Colombia"
              value={country} onChange={(e) => setCountry(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="venue-postal" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60">
              Código Postal
            </label>
            <input
              id="venue-postal" type="text" placeholder="760001"
              value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Capacidad y coordenadas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="venue-capacity" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60">
              Capacidad
            </label>
            <input
              id="venue-capacity" type="number" min="0" placeholder="5000"
              value={capacity} onChange={(e) => setCapacity(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="venue-lat" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60">
              Latitud
            </label>
            <input
              id="venue-lat" type="text" placeholder="3.4516"
              value={latitude} onChange={(e) => setLatitude(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="venue-lng" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60">
              Longitud
            </label>
            <input
              id="venue-lng" type="text" placeholder="-76.5325"
              value={longitude} onChange={(e) => setLongitude(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Descripción e imagen */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="venue-desc" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60">
              Descripción
            </label>
            <textarea
              id="venue-desc" rows={2} placeholder="Descripción del lugar…"
              value={description} onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              className="w-full resize-none rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="venue-image" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-100/60">
              URL de imagen
            </label>
            <input
              id="venue-image" type="url" placeholder="https://ejemplo.com/lugar.jpg"
              value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="mt-6 flex items-center gap-3">
        {onCancel && (
          <button
            type="button" onClick={onCancel} disabled={saving}
            className="flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-red-100/60 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-white/20 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit" disabled={saving}
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
            'Crear lugar'
          )}
        </button>
      </div>
    </form>
  );
}
