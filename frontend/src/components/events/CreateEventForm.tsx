/**
 * TicketS - CreateEventForm
 *
 * Formulario de creación de eventos dividido en secciones:
 *   Información → título, descripción, categoría
 *   Lugar       → seleccionar venue existente o crear nuevo (modal)
 *   Fecha       → fecha, hora inicio, hora fin
 *   Imagen      → subir archivo a Firebase Storage
 *   Estado      → publicado / borrador
 *
 * Arquitectura:
 *   CreateEventForm → useCreateEvent → fetch (NestJS API) + Firebase Storage
 */

import { useState, type FormEvent, type JSX as ReactJSX } from 'react';
import { useCreateEvent } from '../../hooks/useCreateEvent';
import { useMyCategories } from '../../hooks/useCategories';
import { useMyVenues } from '../../hooks/useVenues';
import Button from '../ui/Button';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function CreateEventForm() {
  const {
    categories,
    loading: loadingCategories,
  } = useMyCategories();

  const {
    loading,
    error,
    creatingVenue,
    createEvent,
    createVenue,
    reset,
  } = useCreateEvent();

  const {
    venues: myVenues,
    loading: loadingMyVenues,
    reload: reloadMyVenues,
  } = useMyVenues();

  const venues = myVenues as Array<{
    id: string;
    name: string;
    city: string;
    address: string;
    capacity: number;
    state: string;
    country: string;
  }>;

  // -----------------------------------------------------------------------
  // Estado del formulario principal
  // -----------------------------------------------------------------------

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [venueId, setVenueId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [published, setPublished] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [eventCity, setEventCity] = useState('');
  const [eventAddress, setEventAddress] = useState('');

  // -----------------------------------------------------------------------
  // Errores por campo
  // -----------------------------------------------------------------------

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // -----------------------------------------------------------------------
  // Estado del modal de venue rápido
  // -----------------------------------------------------------------------

  const [showVenueModal, setShowVenueModal] = useState(false);
  const [modalVenueName, setModalVenueName] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueCapacity, setVenueCapacity] = useState('');
  const [venueError, setVenueError] = useState<string | null>(null);

  // -----------------------------------------------------------------------
  // Auto-completar ciudad y dirección al seleccionar venue
  // -----------------------------------------------------------------------

  function handleVenueSelect(id: string) {
    setVenueId(id);
    const selected = venues.find((v) => v.id === id);
    if (selected) {
      setEventCity(selected.city);
      setEventAddress(selected.address || '');
    }
  }

  // -----------------------------------------------------------------------
  // Validación
  // -----------------------------------------------------------------------

  function validate(): string | null {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'El título del evento es requerido.';
    } else if (title.trim().length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres.';
    }

    if (!description.trim()) {
      errors.description = 'La descripción es requerida.';
    } else if (description.trim().length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres.';
    }

    if (!categoryId) {
      errors.category = 'Selecciona una categoría.';
    }

    if (!venueId) {
      errors.venue = 'Selecciona un lugar.';
    }

    if (!startDate) {
      errors.startDate = 'Selecciona la fecha de inicio.';
    }

    if (!startTime) {
      errors.startTime = 'Ingresa la hora de inicio.';
    }

    if (!endDate) {
      errors.endDate = 'Selecciona la fecha de fin.';
    }

    if (!endTime) {
      errors.endTime = 'Ingresa la hora de fin.';
    }

    if (startDate && startTime && endDate && endTime) {
      const startDateTime = new Date(`${startDate}T${startTime}:00`);
      const endDateTime = new Date(`${endDate}T${endTime}:00`);

      if (endDateTime <= startDateTime) {
        errors.endTime = 'La fecha y hora de fin debe ser posterior a la de inicio.';
      }
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      errors.imageUrl = 'Ingresa una URL válida (https://...).';
    }

    setFieldErrors(errors);

    const firstError = Object.values(errors)[0];
    return firstError || null;
  }

  // -----------------------------------------------------------------------
  // Envío del formulario principal
  // -----------------------------------------------------------------------

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError(null);
    reset();

    const clientError = validate();
    if (clientError) {
      setValidationError(clientError);
      return;
    }

    const result = await createEvent({
      title: title.trim(),
      description: description.trim(),
      categoryId,
      venueId,
      city: eventCity,
      address: eventAddress,
      startDate,
      startTime,
      endDate,
      endTime,
      imageUrl,
      published,
    });

    if (result.success) {
      window.location.href = '/organizer/dashboard';
    }
  }

  // -----------------------------------------------------------------------
  // Crear venue rápido
  // -----------------------------------------------------------------------

  async function handleCreateVenue() {
    setVenueError(null);

    if (!modalVenueName.trim()) {
      setVenueError('El nombre del lugar es requerido.');
      return;
    }
    if (!venueCity.trim()) {
      setVenueError('La ciudad es requerida.');
      return;
    }

    const result = await createVenue({
      name: modalVenueName.trim(),
      city: venueCity.trim(),
      address: venueAddress.trim() || undefined,
      capacity: venueCapacity ? Number(venueCapacity) : undefined,
    });

    if (result.success && result.venue) {
      // Seleccionar el venue recién creado y auto-completar ciudad/dirección
      setVenueId(result.venue.id);
      setEventCity(result.venue.city || venueCity);
      setEventAddress(result.venue.address || venueAddress || '');
      // Recargar la lista de venues de useMyVenues
      reloadMyVenues();
      // Cerrar modal y limpiar
      setShowVenueModal(false);
      setModalVenueName('');
      setVenueCity('');
      setVenueAddress('');
      setVenueCapacity('');
    } else {
      setVenueError(result.error || 'Error al crear el lugar.');
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const displayError = validationError || error;

  /**
   * Clase base para inputs, con variante de error.
   */
  function inputCls(field: string, extra = ''): string {
    const hasError = fieldErrors[field];
    return [
      'w-full rounded-2xl border px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition',
      'focus:ring-2 disabled:opacity-50',
      hasError
        ? 'border-red-500/50 bg-red-500/10 focus:border-red-400 focus:ring-red-500/20'
        : 'border-white/10 bg-luxe-black/60 focus:border-luxe-ember/50 focus:ring-luxe-ember/15',
      extra,
    ].join(' ');
  }

  function labelCls(): string {
    return 'mb-2 block text-sm font-bold text-red-100/70';
  }

  function fieldError(field: string): ReactJSX.Element | null {
    if (!fieldErrors[field]) return null;
    return (
      <p className="mt-1.5 text-xs font-semibold text-red-400">
        {fieldErrors[field]}
      </p>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 shadow-deep-luxe backdrop-blur-2xl"
        noValidate
      >
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-luxe-ember/30 bg-gradient-to-br from-luxe-wine to-luxe-black shadow-lg shadow-luxe-ember/15">
            <span className="text-xl font-black text-white">+</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Crear evento
          </h2>
          <p className="mt-2 text-sm text-red-100/60">
            Completa los datos para publicar un nuevo evento
          </p>
        </div>

        {/* Mensaje de error */}
        {displayError && (
          <div
            className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
            role="alert"
          >
            {displayError}
          </div>
        )}

        {/* ================================================================= */}
        {/* SECCIÓN: Información */}
        {/* ================================================================= */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-black tracking-tight text-white">
            Información del evento
          </h3>            {/* Título */}
          <div className="mb-5">
            <label htmlFor="ev-title" className={labelCls()}>
              Título <span className="text-luxe-ember">*</span>
            </label>
            <input
              id="ev-title"
              type="text"
              placeholder="Ej: Neon Sessions 2026"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: '' }));
              }}
              disabled={loading}
              className={inputCls('title')}
            />
            {fieldError('title')}
          </div>

          {/* Descripción */}
          <div className="mb-5">
            <label htmlFor="ev-description" className={labelCls()}>
              Descripción <span className="text-luxe-ember">*</span>
            </label>
            <textarea
              id="ev-description"
              rows={4}
              placeholder="Describe tu evento..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: '' }));
              }}
              disabled={loading}
              className={inputCls('description', 'resize-none')}
            />
            {fieldError('description')}
          </div>

          {/* Categoría */}
          <div className="mb-5">
            <label htmlFor="ev-category" className={labelCls()}>
              Categoría <span className="text-luxe-ember">*</span>
            </label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-3">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span className="text-sm text-red-100/50">Cargando categorías…</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-3">
                <p className="text-sm text-red-100/50">
                  No hay categorías disponibles. Crea una categoría primero.
                </p>
              </div>
            ) : (
              <>
                <select
                  id="ev-category"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: '' }));
                  }}
                  disabled={loading}
                  className={inputCls('category')}
                >
                  <option value="" disabled>
                    Selecciona una categoría
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {fieldError('category')}
              </>
            )}
          </div>
        </div>

        <hr className="mb-8 border-white/5" />

        {/* ================================================================= */}
        {/* SECCIÓN: Lugar */}
        {/* ================================================================= */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-black tracking-tight text-white">
            Lugar <span className="text-luxe-ember">*</span>
          </h3>

          {loadingMyVenues ? (
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-3">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span className="text-sm text-red-100/50">Cargando lugares…</span>
            </div>
          ) : venues.length === 0 ? (
            <div className="mb-3 rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-3">
              <p className="mb-3 text-sm text-red-100/50">
                No hay lugares disponibles. Crea uno nuevo.
              </p>
            </div>
          ) : (
            <>
              <select
                id="ev-venue"
                value={venueId}
                onChange={(e) => {
                  handleVenueSelect(e.target.value);
                  if (fieldErrors.venue) setFieldErrors((prev) => ({ ...prev, venue: '' }));
                }}
                disabled={loading}
                className={inputCls('venue', 'mb-3')}
              >
                <option value="" disabled>
                  Selecciona un lugar
                </option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.city}
                  </option>
                ))}
              </select>
              {fieldError('venue')}
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setShowVenueModal(true);
              setVenueError(null);
            }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-luxe-ember transition hover:text-luxe-crimson disabled:opacity-50"
          >
            <span className="text-base leading-none">+</span>
            Nuevo lugar
          </button>
        </div>

        <hr className="mb-8 border-white/5" />

        {/* ================================================================= */}
        {/* SECCIÓN: Fecha y hora */}
        {/* ================================================================= */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-black tracking-tight text-white">
            Fecha y hora
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Inicio */}
            <div>
              <label htmlFor="ev-start-date" className={labelCls()}>
                Fecha inicio <span className="text-luxe-ember">*</span>
              </label>
              <input
                id="ev-start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (fieldErrors.startDate) setFieldErrors((prev) => ({ ...prev, startDate: '' }));
                }}
                disabled={loading}
                className={inputCls('startDate', '[color-scheme:dark]')}
              />
              {fieldError('startDate')}
            </div>

            <div>
              <label htmlFor="ev-start-time" className={labelCls()}>
                Hora inicio <span className="text-luxe-ember">*</span>
              </label>
              <input
                id="ev-start-time"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (fieldErrors.startTime) setFieldErrors((prev) => ({ ...prev, startTime: '' }));
                }}
                disabled={loading}
                className={inputCls('startTime', '[color-scheme:dark]')}
              />
              {fieldError('startTime')}
            </div>

            {/* Fin */}
            <div>
              <label htmlFor="ev-end-date" className={labelCls()}>
                Fecha fin <span className="text-luxe-ember">*</span>
              </label>
              <input
                id="ev-end-date"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (fieldErrors.endDate) setFieldErrors((prev) => ({ ...prev, endDate: '' }));
                }}
                disabled={loading}
                className={inputCls('endDate', '[color-scheme:dark]')}
              />
              {fieldError('endDate')}
            </div>

            <div>
              <label htmlFor="ev-end-time" className={labelCls()}>
                Hora fin <span className="text-luxe-ember">*</span>
              </label>
              <input
                id="ev-end-time"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (fieldErrors.endTime) setFieldErrors((prev) => ({ ...prev, endTime: '' }));
                }}
                disabled={loading}
                className={inputCls('endTime', '[color-scheme:dark]')}
              />
              {fieldError('endTime')}
            </div>
          </div>
        </div>

        <hr className="mb-8 border-white/5" />

        {/* ================================================================= */}
        {/* SECCIÓN: Imagen */}
        {/* ================================================================= */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-black tracking-tight text-white">
            Imagen del evento
          </h3>

          <div className="space-y-4">
            <input
              id="ev-image-url"
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImagePreviewError(false);
                if (fieldErrors.imageUrl) setFieldErrors((prev) => ({ ...prev, imageUrl: '' }));
              }}
              disabled={loading}
              className={inputCls('imageUrl')}
            />
            {fieldError('imageUrl')}

            {imageUrl && (
              <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-white/10 bg-luxe-black/80">
                {imagePreviewError ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm font-semibold text-red-400">
                      No se pudo cargar la imagen.
                    </p>
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt="Vista previa"
                    onError={() => setImagePreviewError(true)}
                    className="h-full w-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setImagePreviewError(false);
                  }}
                  disabled={loading}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-xs text-white transition hover:bg-black/80"
                  aria-label="Eliminar imagen"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <hr className="mb-8 border-white/5" />

        {/* ================================================================= */}
        {/* SECCIÓN: Estado */}
        {/* ================================================================= */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-black tracking-tight text-white">
            Estado
          </h3>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-3 transition hover:border-white/20">
            <div className="relative">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                disabled={loading}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full border border-white/15 bg-luxe-black transition peer-checked:border-luxe-ember/50 peer-checked:bg-luxe-ember/30" />
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white/20 transition peer-checked:translate-x-5 peer-checked:bg-luxe-ember" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {published ? 'Publicado' : 'Borrador'}
              </p>
              <p className="text-xs text-red-100/50">
                {published
                  ? 'El evento será visible para todos los usuarios.'
                  : 'Solo tú podrás ver el evento hasta que lo publiques.'}
              </p>
            </div>
          </label>
        </div>

        {/* ================================================================= */}
        {/* Botón de envío */}
        {/* ================================================================= */}
        <Button
          type="submit"
          variant="glow"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creando evento…
            </span>
          ) : (
            'Crear evento'
          )}
        </Button>
      </form>

      {/* ================================================================= */}
      {/* MODAL: Nuevo Venue */}
      {/* ================================================================= */}
      {showVenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-luxe-black/95 p-6 shadow-deep-luxe backdrop-blur-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-black tracking-tight text-white">
                Nuevo lugar
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowVenueModal(false);
                  setVenueError(null);
                }}
                className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 text-sm text-red-100/50 transition hover:border-white/20 hover:text-white"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Error del modal */}
            {venueError && (
              <div
                className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
                role="alert"
              >
                {venueError}
              </div>
            )}

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="modal-venue-name"
                  className="mb-1.5 block text-xs font-bold text-red-100/70"
                >
                  Nombre <span className="text-luxe-ember">*</span>
                </label>
                <input
                  id="modal-venue-name"
                  type="text"
                  placeholder="Ej: Centro de Eventos, Acopi"
                  value={modalVenueName}
                  onChange={(e) => setModalVenueName(e.target.value)}
                  disabled={creatingVenue}
                  className="w-full rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
                />
              </div>

              {/* Ciudad */}
              <div>
                <label
                  htmlFor="modal-venue-city"
                  className="mb-1.5 block text-xs font-bold text-red-100/70"
                >
                  Ciudad <span className="text-luxe-ember">*</span>
                </label>
                <input
                  id="modal-venue-city"
                  type="text"
                  placeholder="Cali"
                  value={venueCity}
                  onChange={(e) => setVenueCity(e.target.value)}
                  disabled={creatingVenue}
                  className="w-full rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
                />
              </div>

              {/* Dirección */}
              <div>
                <label
                  htmlFor="modal-venue-address"
                  className="mb-1.5 block text-xs font-bold text-red-100/70"
                >
                  Dirección
                </label>
                <input
                  id="modal-venue-address"
                  type="text"
                  placeholder="Calle 5 # 20-30"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  disabled={creatingVenue}
                  className="w-full rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
                />
              </div>

              {/* Capacidad */}
              <div>
                <label
                  htmlFor="modal-venue-capacity"
                  className="mb-1.5 block text-xs font-bold text-red-100/70"
                >
                  Capacidad
                </label>
                <input
                  id="modal-venue-capacity"
                  type="number"
                  min="0"
                  placeholder="5000"
                  value={venueCapacity}
                  onChange={(e) => setVenueCapacity(e.target.value)}
                  disabled={creatingVenue}
                  className="w-full rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowVenueModal(false);
                    setVenueError(null);
                  }}
                  disabled={creatingVenue}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-red-50 transition hover:border-white/20 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateVenue}
                  disabled={creatingVenue}
                  className="flex-1 rounded-2xl border border-luxe-ember/45 bg-gradient-to-r from-luxe-crimson to-luxe-ember px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-luxe-ember/20 transition hover:from-luxe-wine hover:to-luxe-crimmon disabled:opacity-50"
                >
                  {creatingVenue ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creando…
                    </span>
                  ) : (
                    'Crear lugar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
