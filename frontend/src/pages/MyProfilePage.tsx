/**
 * TicketS - MyProfilePage
 *
 * Pantalla de edición del perfil del usuario autenticado.
 * Carga datos desde Firestore y permite actualizar nombre, teléfono y ciudad.
 *
 * Campos protegidos (no editables):
 *   uid, email, role, status, createdAt
 *
 * Arquitectura:
 *   Componente → useAuth() + user.service.ts → Firestore
 */

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getUserProfile,
  updateUserProfile,
} from '../services/user.service';
import type { UserProfile } from '../types/user';
import Button from '../components/ui/Button';

export default function MyProfilePage() {
  const { user: authUser } = useAuth();

  // Estados del formulario
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Referencia para el timeout del mensaje de éxito
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // -----------------------------------------------------------------------
  // Cargar perfil desde Firestore
  // -----------------------------------------------------------------------
  useEffect(() => {
    const currentUid = authUser?.uid;
    if (!currentUid) return;
    const safeUid: string = currentUid;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      const response = await getUserProfile(safeUid);

      if (cancelled) return;

      if (response.success && response.profile) {
        setProfile(response.profile);
        setDisplayName(response.profile.displayName || '');
        setPhone(response.profile.phone || '');
        setCity(response.profile.city || '');
      } else {
        setError('No se pudo cargar tu perfil. Intenta de nuevo.');
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
      clearTimeout(successTimeoutRef.current);
    };
  }, [authUser?.uid]);

  // -----------------------------------------------------------------------
  // Guardar cambios
  // -----------------------------------------------------------------------

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const uid = authUser?.uid;
    if (!uid) {
      setError('Debes iniciar sesión para editar tu perfil.');
      return;
    }

    if (!displayName.trim()) {
      setError('El nombre es requerido.');
      return;
    }

    setSaving(true);

    const response = await updateUserProfile(uid, {
      displayName: displayName.trim(),
      phone: phone.trim() || null,
      city: city.trim() || null,
    });

    setSaving(false);

    if (response.success) {
      setSuccess(true);
      if (response.profile) {
        setProfile(response.profile);
      }
      // Ocultar mensaje de éxito después de 3 segundos
      successTimeoutRef.current = setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(response.error || 'Error al guardar los cambios.');
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <main className="relative mx-auto max-w-2xl px-4 py-12">
      {/* Fondos decorativos */}
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-brand-muted/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative">
        {/* Encabezado */}
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-brand">
            Mi cuenta
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            Mi perfil
          </h1>
          <p className="mt-2 text-red-100/60">
            Administra tu información personal
          </p>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-brand/30 border-t-brand"
              role="status"
              aria-label="Cargando perfil"
            />
          </div>
        )}

        {/* Formulario */}
        {!loading && (
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 shadow-card backdrop-blur-2xl"
            noValidate
          >
            {/* Mensaje de éxito */}
            {success && (
              <div
                className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-300"
                role="status"
              >
                Perfil actualizado correctamente.
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

            {/* Campos protegidos (solo lectura) */}
            <div className="mb-6 grid gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-100/40">
                  ID de usuario
                </p>
                <p className="mt-1 text-sm font-semibold text-red-100/70 font-mono">
                  {profile?.uid || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-100/40">
                  Correo electrónico
                </p>
                <p className="mt-1 text-sm font-semibold text-red-100/70">
                  {profile?.email || authUser?.email || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-100/40">
                  Rol
                </p>
                <p className="mt-1 text-sm font-semibold text-red-100/70">
                  {profile?.role === 'cliente' ? 'Cliente' : profile?.role || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-100/40">
                  Miembro desde
                </p>
                <p className="mt-1 text-sm font-semibold text-red-100/70">
                  {profile?.createdAt
                    ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                      })
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-100/40">
                  Estado
                </p>
                <p className="mt-1 text-sm font-semibold text-green-400">
                  {profile?.status === 'active' ? 'Activo' : profile?.status || '—'}
                </p>
              </div>
            </div>

            {/* Separador */}
            <hr className="mb-6 border-white/5" />

            {/* Campo: Nombre completo */}
            <div className="mb-5">
              <label
                htmlFor="profile-name"
                className="mb-2 block text-sm font-bold text-red-100/70"
              >
                Nombre completo
              </label>
              <input
                id="profile-name"
                type="text"
                autoComplete="name"
                placeholder="Tu nombre"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={saving}
                className="w-full rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
              />
            </div>

            {/* Campo: Teléfono */}
            <div className="mb-5">
              <label
                htmlFor="profile-phone"
                className="mb-2 block text-sm font-bold text-red-100/70"
              >
                Teléfono
              </label>
              <input
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+57 300 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={saving}
                className="w-full rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
              />
            </div>

            {/* Campo: Ciudad */}
            <div className="mb-6">
              <label
                htmlFor="profile-city"
                className="mb-2 block text-sm font-bold text-red-100/70"
              >
                Ciudad
              </label>
              <input
                id="profile-city"
                type="text"
                autoComplete="address-level2"
                placeholder="Bogotá, Medellín, Cali…"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={saving}
                className="w-full rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
              />
            </div>

            {/* Botón de guardar */}
            <Button
              type="submit"
              variant="glow"
              className="w-full"
              disabled={saving}
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Guardando…
                </span>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
