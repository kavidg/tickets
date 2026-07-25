/**
 * TicketS - CategoriesPage
 *
 * Página de administración de categorías.
 * Permite listar, buscar, crear, editar y eliminar categorías.
 *
 * Ruta: #/admin/categories
 *
 * @see useAdminCategories para el hook de datos.
 * @see CategoryForm para el formulario de creación/edición.
 */

import { useState, useMemo } from 'react';
import { useAdminCategories } from '../hooks/useCategories';
import CategoryForm from '../components/categories/CategoryForm';
import type { CategoryFormData } from '../components/categories/CategoryForm';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Configuración visual según estado activo/inactivo */
const ACTIVE_CONFIG = {
  true: {
    label: 'Activa',
    className: 'bg-green-500/15 text-green-300 border-green-500/25',
  },
  false: {
    label: 'Inactiva',
    className: 'bg-white/10 text-red-100/50 border-white/10',
  },
};

// ---------------------------------------------------------------------------
// Subcomponentes de estado
// ---------------------------------------------------------------------------

/** Esqueleto de carga */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/35 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-36 rounded bg-white/8" />
              <div className="h-4 w-24 rounded bg-white/8" />
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
 * Página de administración de categorías.
 */
export default function CategoriesPage() {
  const {
    categories,
    loading,
    saving,
    error,
    successMessage,
    reload,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminCategories();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // -----------------------------------------------------------------------
  // Filtro de búsqueda
  // -----------------------------------------------------------------------

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query),
    );
  }, [categories, searchQuery]);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  async function handleCreate(data: CategoryFormData) {
    const ok = await createCategory(data);
    if (ok) setShowForm(false);
  }

  async function handleUpdate(data: CategoryFormData) {
    if (!editingId) return;
    const ok = await updateCategory(editingId, data);
    if (ok) setEditingId(null);
  }

  async function handleToggleActive(category: {
    id: string;
    active: boolean;
  }) {
    await updateCategory(category.id, { active: !category.active });
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
        {/* Encabezado */}
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-brand">
            Administración
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            Categorías
          </h1>
          <p className="mt-2 text-red-100/60">
            Administra las categorías de eventos de la plataforma
          </p>
        </div>

        {/* Barra de acciones */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-red-100/30">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar categorías…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-neutral-900/60 py-2.5 pl-9 pr-4 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15"
            />
          </div>

          {/* Botón crear */}
          {!showForm && !editingId && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-brand/45 bg-gradient-to-r from-brand to-brand px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-brand/25 transition hover:from-brand-muted hover:to-brand"
            >
              + Nueva categoría
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
            <CategoryForm
              onSubmit={handleCreate}
              saving={saving}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Formulario de edición */}
        {editingId && (() => {
          const editingCategory = categories.find((c) => c.id === editingId);
          if (!editingCategory) return null;
          return (
            <div className="mb-8">
              <CategoryForm
                initialData={{
                  name: editingCategory.name,
                  slug: editingCategory.slug,
                  description: editingCategory.description,
                  imageUrl: editingCategory.imageUrl,
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
        ) : filteredCategories.length === 0 && !showForm ? (
          /* Sin categorías */
          <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] p-12 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <span className="text-2xl">🏷️</span>
            </div>
            <p className="text-xl font-black text-white">
              {searchQuery
                ? 'No se encontraron categorías'
                : 'Aún no hay categorías'}
            </p>
            <p className="mt-2 text-sm text-red-100/50">
              {searchQuery
                ? 'Intenta con otro término de búsqueda.'
                : 'Crea la primera categoría para comenzar a organizar eventos.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-brand/45 bg-gradient-to-r from-brand to-brand px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-brand/25 transition hover:from-brand-muted hover:to-brand"
              >
                + Crear categoría
              </button>
            )}
          </div>
        ) : (
          /* Lista de categorías */
          <div className="space-y-4">
            {filteredCategories.map((category) => {
              const activeCfg = ACTIVE_CONFIG[String(category.active) as 'true' | 'false'];

              return (
                <div
                  key={category.id}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/35 backdrop-blur-xl transition hover:border-brand/30"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black text-white">
                          {category.name}
                        </h3>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${activeCfg.className}`}
                        >
                          {activeCfg.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-mono text-red-100/40">
                        /{category.slug}
                      </p>
                      {category.description && (
                        <p className="mt-1 text-sm text-red-100/50 line-clamp-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => setEditingId(category.id)}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-bold text-red-100/60 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-brand/40 hover:text-brand disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleActive(category)}
                      disabled={saving}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold shadow-lg shadow-black/25 backdrop-blur-xl transition disabled:opacity-50 ${
                        category.active
                          ? 'border-yellow-500/20 bg-yellow-500/8 text-yellow-300/70 hover:border-yellow-400/40 hover:text-yellow-300'
                          : 'border-green-500/20 bg-green-500/8 text-green-300/70 hover:border-green-400/40 hover:text-green-300'
                      }`}
                      title={
                        category.active
                          ? 'Desactivar categoría'
                          : 'Activar categoría'
                      }
                    >
                      {category.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            `¿Eliminar "${category.name}"? Esta acción no se puede deshacer.`,
                          )
                        ) {
                          await deleteCategory(category.id);
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
              {filteredCategories.length} categoría
              {filteredCategories.length !== 1 ? 's' : ''}
              {searchQuery && ` (filtradas de ${categories.length})`}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
