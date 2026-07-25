/**
 * TicketS - OrganizationSetupForm
 *
 * Formulario de onboarding para crear la primera organización.
 * El usuario ingresa nombre, slug, descripción e imagen opcional.
 *
 * Arquitectura:
 *   OrganizationSetupForm → useOrganizationSetup → fetch (NestJS API) → Firestore
 *
 * Flujo:
 *   1. Usuario completa el formulario
 *   2. Se valida en cliente
 *   3. Se envía POST /api/v1/organizations/setup
 *   4. En éxito → redirige al dashboard del organizador
 *   5. En error → muestra mensaje amigable
 */

import { useState, type FormEvent } from 'react';
import { useOrganizationSetup } from '../../hooks/useOrganizationSetup';
import Button from '../ui/Button';

// ---------------------------------------------------------------------------
// Validación de slug en cliente
// ---------------------------------------------------------------------------

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Normaliza un texto a formato slug (ej: "Mi Empresa" → "mi-empresa").
 */
function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // eliminar tildes
    .replace(/[^a-z0-9]+/g, '-') // espacios y especiales → guion
    .replace(/^-+|-+$/g, ''); // guiones al inicio/final
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Formulario de configuración inicial de organización.
 *
 * @example
 * <OrganizationSetupForm />
 */
export default function OrganizationSetupForm() {
  const { loading, error, createOrganization, clearError } =
    useOrganizationSetup();

  // Estado del formulario
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Errores de validación local
  const [validationError, setValidationError] = useState<string | null>(null);

  // -----------------------------------------------------------------------
  // Generar slug automático desde el nombre
  // -----------------------------------------------------------------------

  function handleNameChange(value: string) {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(normalizeSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setSlug(normalizeSlug(value));
  }

  // -----------------------------------------------------------------------
  // Validación
  // -----------------------------------------------------------------------

  function validate(): string | null {
    if (!name.trim()) return 'El nombre de la organización es requerido.';
    if (name.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    if (!slug.trim()) return 'El slug es requerido.';
    if (slug.trim().length < 3) return 'El slug debe tener al menos 3 caracteres.';
    if (!SLUG_REGEX.test(slug.trim())) {
      return 'El slug solo puede contener letras minúsculas, números y guiones.';
    }
    if (description && description.length > 500) {
      return 'La descripción no puede exceder 500 caracteres.';
    }
    return null;
  }

  // -----------------------------------------------------------------------
  // Envío
  // -----------------------------------------------------------------------

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const clientError = validate();
    if (clientError) {
      setValidationError(clientError);
      return;
    }

    const result = await createOrganization({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
    });

    if (result.success) {
      window.location.href = '/organizer/dashboard';
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const displayError = validationError || error;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 shadow-deep-luxe backdrop-blur-2xl"
      noValidate
    >
      {/* Encabezado */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-luxe-ember/30 bg-gradient-to-br from-luxe-wine to-luxe-black shadow-lg shadow-luxe-ember/15">
          <span className="text-xl font-black text-white">O</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">
          Configura tu organización
        </h2>
        <p className="mt-2 text-sm text-red-100/60">
          Crea tu organización para comenzar a vender entradas
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

      {/* Campo: Nombre */}
      <div className="mb-5">
        <label
          htmlFor="org-name"
          className="mb-2 block text-sm font-bold text-red-100/70"
        >
          Nombre de la organización <span className="text-luxe-ember">*</span>
        </label>
        <input
          id="org-name"
          type="text"
          autoComplete="organization"
          placeholder="Ej: Festivales SAS"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          disabled={loading}
          className="w-full rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
        />
      </div>

      {/* Campo: Slug */}
      <div className="mb-5">
        <label
          htmlFor="org-slug"
          className="mb-2 block text-sm font-bold text-red-100/70"
        >
          Slug <span className="text-luxe-ember">*</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-red-100/40">/</span>
          <input
            id="org-slug"
            type="text"
            autoComplete="off"
            placeholder="festivales-sas"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            disabled={loading}
            className="w-full rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
          />
        </div>
        <p className="mt-1 text-xs text-red-100/40">
          Se genera automáticamente desde el nombre. Puedes editarlo.
        </p>
      </div>

      {/* Campo: Descripción */}
      <div className="mb-5">
        <label
          htmlFor="org-description"
          className="mb-2 block text-sm font-bold text-red-100/70"
        >
          Descripción
        </label>
        <textarea
          id="org-description"
          rows={3}
          placeholder="Breve descripción de tu organización..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          maxLength={500}
          className="w-full resize-none rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
        />
        <p className="mt-1 text-right text-xs text-red-100/40">
          {description.length}/500
        </p>
      </div>

      {/* Campo: Imagen (URL) */}
      <div className="mb-6">
        <label
          htmlFor="org-image"
          className="mb-2 block text-sm font-bold text-red-100/70"
        >
          URL del logo
        </label>
        <input
          id="org-image"
          type="url"
          autoComplete="off"
          placeholder="https://ejemplo.com/logo.png"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          disabled={loading}
          className="w-full rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
        />
      </div>

      {/* Botón de envío */}
      <Button
        type="submit"
        variant="glow"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Creando organización…
          </span>
        ) : (
          'Crear organización'
        )}
      </Button>
    </form>
  );
}
