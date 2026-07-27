/**
 * TicketS - RegisterPage
 *
 * Pantalla de registro de usuario.
 * Utiliza exclusivamente useAuth() para autenticación.
 * No accede directamente a Firebase.
 *
 * Flujo post-registro:
 *   1. Crear usuario en Firebase Auth vía useAuth().register()
 *   2. Enviar correo de verificación
 *   3. Redirigir al Home — ProtectedRoute se encarga de crear el perfil
 *      (GET /api/v1/profile → si 404 → POST /api/v1/profile)
 */

import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

export default function RegisterPage() {
  const { register, sendVerificationEmail } = useAuth();

  // Estado del formulario
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // -----------------------------------------------------------------------
  // Validación
  // -----------------------------------------------------------------------

  /** Expresión regular simple para validar formato de email */
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(): string | null {
    if (!displayName.trim()) return 'El nombre es requerido.';
    if (!email.trim()) return 'El correo electrónico es requerido.';
    if (!EMAIL_REGEX.test(email.trim())) return 'El correo electrónico no es válido.';
    if (!password) return 'La contraseña es requerida.';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (password !== confirmPassword) return 'Las contraseñas no coinciden.';
    return null;
  }

  // -----------------------------------------------------------------------
  // Manejo del envío
  // -----------------------------------------------------------------------

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    // Validar campos
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      // 1. Crear usuario en Firebase Auth
      const authResponse = await register(email.trim(), password);

      if (!authResponse.success) {
        setError(authResponse.error || 'Error al crear la cuenta.');
        setSubmitting(false);
        return;
      }

      // 2. Enviar correo de verificación
      await sendVerificationEmail();

      // 3. Redirigir al Home — ProtectedRoute se encarga de crear el perfil
      //    (GET /api/v1/profile → si 404 → POST /api/v1/profile)
      window.location.href = '/';
    } catch (err) {
      setError('Ocurrió un error inesperado. Intenta de nuevo.');
      setSubmitting(false);
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <main className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 pt-28 pb-12">
      {/* Fondos decorativos */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-muted/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Header del formulario */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl border border-brand/30 bg-gradient-to-br from-brand-muted to-neutral-900 shadow-lg shadow-brand/20">
            <span className="text-2xl font-black text-white">P</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Crear cuenta
          </h1>
          <p className="mt-2 text-red-100/60">
            Regístrate para obtener una experiencia más personalizada y beneficios exclusivos
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 shadow-card backdrop-blur-2xl"
          noValidate
        >
          {/* Mensaje de error */}
          {error && (
            <div
              className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Campo: Nombre */}
          <div className="mb-5">
            <label
              htmlFor="reg-name"
              className="mb-2 block text-sm font-bold text-red-100/70"
            >
              Nombre completo
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="María García"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={submitting}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
            />
          </div>

          {/* Campo: Email */}
          <div className="mb-5">
            <label
              htmlFor="reg-email"
              className="mb-2 block text-sm font-bold text-red-100/70"
            >
              Correo electrónico
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
            />
          </div>

          {/* Campo: Contraseña */}
          <div className="mb-5">
            <label
              htmlFor="reg-password"
              className="mb-2 block text-sm font-bold text-red-100/70"
            >
              Contraseña
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
            />
          </div>

          {/* Campo: Confirmar contraseña */}
          <div className="mb-6">
            <label
              htmlFor="reg-confirm"
              className="mb-2 block text-sm font-bold text-red-100/70"
            >
              Confirmar contraseña
            </label>
            <input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
            />
          </div>

          {/* Botón de envío */}
          <Button
            type="submit"
            variant="glow"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creando cuenta…
              </span>
            ) : (
              'Crear cuenta'
            )}
          </Button>

          {/* Enlace a Login */}
          <div className="mt-6 text-center text-sm">
            <a
              href="/login"
              className="font-semibold text-red-100/50 transition hover:text-brand"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
