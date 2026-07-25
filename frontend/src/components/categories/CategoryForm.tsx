/**
 * TicketS - CategoryForm
 *
 * Formulario para crear o editar una categoría.
 * Sigue el diseño glassmorphism de la plataforma.
 *
 * @example
 * // Crear nuevo
 * <CategoryForm
 *   onSubmit={async (data) => { await createCategory(data); }}
 *   saving={false}
 * />
 *
 * // Editar existente
 * <CategoryForm
 *   initialData={{ name: 'Música', slug: 'musica', description: 'Eventos musicales' }}
 *   onSubmit={async (data) => { await updateCategory(id, data); }}
 *   saving={false}
 * />
 */

import { useState, type FormEvent } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

interface CategoryFormProps {
  /** Datos iniciales para edición */
  initialData?: Partial<CategoryFormData>;
  /** Función que se ejecuta al enviar el formulario */
  onSubmit: (data: CategoryFormData) => Promise<void>;
  /** Indica si se está guardando */
  saving: boolean;
  /** Función para cancelar / cerrar el formulario */
  onCancel?: () => void;
}

/**
 * Genera un slug a partir de un nombre.
 * Ejemplo: "Música Electrónica" → "musica-electronica"
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Formulario para crear o editar una categoría.
 */
export default function CategoryForm({
  initialData,
  onSubmit,
  saving,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug);
  const [error, setError] = useState('');

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  function handleNameChange(value: string) {
    setName(value);
    if (autoSlug) {
      setSlug(slugify(value));
    }
  }

  // -----------------------------------------------------------------------
  // Validación
  // -----------------------------------------------------------------------

  function validate(): string | null {
    if (!name.trim()) return 'El nombre es obligatorio.';
    if (!slug.trim()) return 'El slug es obligatorio.';
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return 'El slug solo puede contener minúsculas, números y guiones.';
    }
    if (description.length > 500) {
      return 'La descripción no puede exceder 500 caracteres.';
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
      slug: slug.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
    });
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 shadow-card backdrop-blur-2xl"
      noValidate
    >
      <h3 className="text-lg font-black tracking-tight text-white">
        {initialData ? 'Editar categoría' : 'Nueva categoría'}
      </h3>
      <p className="mt-1 text-sm text-neutral-400">
        {initialData
          ? 'Modifica los campos de la categoría'
          : 'Agrega una nueva categoría de eventos'}
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
            htmlFor="cat-name"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400"
          >
            Nombre *
          </label>
          <input
            id="cat-name"
            type="text"
            placeholder="Conciertos, Teatro, Deportes…"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            disabled={saving}
            className="w-full rounded-xl border border-white/10 bg-neutral-800/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
          />
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="cat-slug"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400"
          >
            Slug * (URL amigable)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="cat-slug"
              type="text"
              placeholder="conciertos"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              disabled={saving}
              className="flex-1 rounded-xl border border-white/10 bg-neutral-800/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
            />
            {!initialData && (
              <button
                type="button"
                onClick={() => {
                  setSlug(slugify(name));
                  setAutoSlug(true);
                }}
                disabled={saving}
                className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-xs font-bold text-neutral-400 transition hover:border-brand/30 hover:text-brand-light disabled:opacity-50"
                title="Auto-generar slug desde el nombre"
              >
                Auto
              </button>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label
            htmlFor="cat-desc"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400"
          >
            Descripción (opcional)
          </label>
          <textarea
            id="cat-desc"
            rows={2}
            placeholder="Eventos musicales, conciertos y festivales…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
            maxLength={500}
            className="w-full resize-none rounded-xl border border-white/10 bg-neutral-800/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
          />
          <p className="mt-1 text-right text-xs text-neutral-500">
            {description.length}/500
          </p>
        </div>

        {/* URL de imagen */}
        <div>
          <label
            htmlFor="cat-image"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400"
          >
            URL de imagen (opcional)
          </label>
          <input
            id="cat-image"
            type="url"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={saving}
            className="w-full rounded-xl border border-white/10 bg-neutral-800/60 px-4 py-2.5 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="mt-6 flex items-center gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-neutral-400 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-white/20 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-2xl border border-brand/45 bg-gradient-to-r bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-2xl shadow-button transition hover:bg-brand-light disabled:opacity-50"
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Guardando…
            </span>
          ) : initialData ? (
            'Guardar cambios'
          ) : (
            'Crear categoría'
          )}
        </button>
      </div>
    </form>
  );
}
