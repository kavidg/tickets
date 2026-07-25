/**
 * TicketS - VenuesPage
 *
 * Página de administración de lugares (venues).
 * Permite listar, buscar, crear, editar y eliminar lugares.
 *
 * Ruta: #/organizer/venues
 *
 * @see useAdminVenues para el hook de datos.
 * @see VenueForm para el formulario de creación/edición.
 */

import { useState, useMemo } from 'react';
import { useAdminVenues } from '../hooks/useVenues';
import VenueForm from '../components/venues/VenueForm';
import type { VenueFormData } from '../components/venues/VenueForm';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACTIVE_CONFIG = {
  true: {
    label: 'Activo',
    className: 'bg-green-500/15 text-green-300 border-green-500/25',
  },
  false: {
    label: 'Inactivo',
    className: 'bg-white/10 text-red-100/50 border-white/10',
  },
};

function formatCapacity(cap: number): string {
  if (!cap) return '—';
  return new Intl.NumberFormat('es-CO').format(cap);
}

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------

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
              <div className="h-5 w-48 rounded bg-white/8" />
              <div className="h-4 w-28 rounded bg-white/8" />
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

export default function VenuesPage() {
  const {
    venues,
    loading,
    saving,
    error,
    successMessage,
    reload,
    createVenue,
    updateVenue,
    deleteVenue,
  } = useAdminVenues();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) return venues;
    const q = searchQuery.toLowerCase().trim();
    return venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q) ||
        v.country.toLowerCase().includes(q),
    );
  }, [venues, searchQuery]);

  async function handleCreate(data: VenueFormData) {
    const ok = await createVenue({
      name: data.name,
      description: data.description,
      address: data.address || '',
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      capacity: data.capacity ? Number(data.capacity) : 0,
      imageUrl: data.imageUrl,
    });
    if (ok) setShowForm(false);
  }

  async function handleUpdate(data: VenueFormData) {
    if (!editingId) return;
    const ok = await updateVenue(editingId, {
      name: data.name,
      description: data.description,
      address: data.address || '',
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      capacity: data.capacity ? Number(data.capacity) : undefined,
      imageUrl: data.imageUrl,
    });
    if (ok) setEditingId(null);
  }

  async function handleToggleActive(venue: { id: string; active: boolean }) {
    await updateVenue(venue.id, { active: !venue.active });
  }

  return (
    <main className="relative mx-auto max-w-4xl px-4 py-12">
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-luxe-wine/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-luxe-ember/10 blur-3xl" />

      <div className="relative">
        {/* Encabezado */}
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-luxe-ember">
            Organizador
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            Mis lugares
          </h1>
          <p className="mt-2 text-red-100/60">
            Administra los lugares donde se realizan tus eventos
          </p>
        </div>

        {/* Barra de acciones */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-red-100/30">🔍</span>
            <input
              type="text" placeholder="Buscar lugares…"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-luxe-black/60 py-2.5 pl-9 pr-4 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15"
            />
          </div>
          {!showForm && !editingId && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-luxe-ember/45 bg-gradient-to-r from-luxe-crimson to-luxe-ember px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-luxe-ember/25 transition hover:from-luxe-wine hover:to-luxe-crimson"
            >
              + Nuevo lugar
            </button>
          )}
        </div>

        {/* Mensajes */}
        {successMessage && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-300" role="status">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300" role="alert">
            {error}
          </div>
        )}

        {/* Formularios */}
        {showForm && (
          <div className="mb-8">
            <VenueForm onSubmit={handleCreate} saving={saving} onCancel={() => setShowForm(false)} />
          </div>
        )}
        {editingId && (() => {
          const editingVenue = venues.find((v) => v.id === editingId);
          if (!editingVenue) return null;
          return (
            <div className="mb-8">
              <VenueForm
                initialData={{
                  name: editingVenue.name,
                  description: editingVenue.description,
                  address: editingVenue.address,
                  city: editingVenue.city,
                  state: editingVenue.state,
                  country: editingVenue.country,
                  postalCode: editingVenue.postalCode,
                  latitude: editingVenue.latitude?.toString() || '',
                  longitude: editingVenue.longitude?.toString() || '',
                  capacity: editingVenue.capacity?.toString() || '',
                  imageUrl: editingVenue.imageUrl,
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
        ) : filteredVenues.length === 0 && !showForm ? (
          <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] p-12 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <span className="text-2xl">📍</span>
            </div>
            <p className="text-xl font-black text-white">
              {searchQuery ? 'No se encontraron lugares' : 'Aún no hay lugares registrados'}
            </p>
            <p className="mt-2 text-sm text-red-100/50">
              {searchQuery ? 'Intenta con otro término de búsqueda.' : 'Crea tu primer lugar para comenzar a asociar eventos.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-luxe-ember/45 bg-gradient-to-r from-luxe-crimson to-luxe-ember px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-luxe-ember/25 transition hover:from-luxe-wine hover:to-luxe-crimson"
              >
                + Crear lugar
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVenues.map((venue) => {
              const activeCfg = ACTIVE_CONFIG[String(venue.active) as 'true' | 'false'];
              return (
                <div
                  key={venue.id}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/35 backdrop-blur-xl transition hover:border-luxe-ember/30"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black text-white">{venue.name}</h3>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${activeCfg.className}`}>
                          {activeCfg.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-red-100/60">
                        {venue.city}{venue.state ? `, ${venue.state}` : ''}{venue.country ? ` · ${venue.country}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-red-100/40">
                        {venue.address && `${venue.address} · `}
                        Cap. {formatCapacity(venue.capacity)} personas
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => setEditingId(venue.id)} disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-bold text-red-100/60 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-luxe-ember/40 hover:text-luxe-ember disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleActive(venue)} disabled={saving}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold shadow-lg shadow-black/25 backdrop-blur-xl transition disabled:opacity-50 ${
                        venue.active
                          ? 'border-yellow-500/20 bg-yellow-500/8 text-yellow-300/70 hover:border-yellow-400/40 hover:text-yellow-300'
                          : 'border-green-500/20 bg-green-500/8 text-green-300/70 hover:border-green-400/40 hover:text-green-300'
                      }`}
                    >
                      {venue.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`¿Eliminar "${venue.name}"? Esta acción no se puede deshacer.`)) {
                          await deleteVenue(venue.id);
                        }
                      }} disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-2 text-xs font-bold text-red-300/70 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
            <p className="pt-2 text-center text-xs text-red-100/40">
              {filteredVenues.length} lugar{filteredVenues.length !== 1 ? 'es' : ''}
              {searchQuery && ` (filtrados de ${venues.length})`}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
