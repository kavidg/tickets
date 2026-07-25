/**
 * TicketS - LoginPage
 *
 * Pantalla de inicio de sesión.
 * Utiliza exclusivamente useAuth() para autenticación.
 * No accede directamente a Firebase.
 *
 * Flujo post-login:
 *   1. Iniciar sesión con Firebase Auth
 *   2. Redirigir al Home — ProtectedRoute se encarga de verificar o crear el perfil
 *      (GET /api/v1/profile → si 404 → POST /api/v1/profile)
 */

import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();

  // Estado del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // -----------------------------------------------------------------------
  // Validación
  // -----------------------------------------------------------------------

  function validate(): string | null {
    if (!email.trim()) return 'El correo electrónico es requerido.';
    if (!password) return 'La contraseña es requerida.';
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
      // 1. Iniciar sesión con Firebase Auth
      const authResponse = await login(email, password);

      if (!authResponse.success) {
        setError(authResponse.error || 'Error al iniciar sesión.');
        setSubmitting(false);
        return;
      }

      // 2. Redirigir al Home — ProtectedRoute se encarga de verificar
      //    o crear el perfil y la organización.
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
    <main className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-12">
      {/* Fondos decorativos */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-luxe-wine/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-luxe-ember/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Header del formulario */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl border border-luxe-ember/30 bg-gradient-to-br from-luxe-wine to-luxe-black shadow-lg shadow-luxe-ember/20">
            <span className="text-2xl font-black text-white">T</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-red-100/60">
            Accede a tu cuenta de TicketS
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 shadow-deep-luxe backdrop-blur-2xl"
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

          {/* Campo: Email */}
          <div className="mb-5">
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-bold text-red-100/70"
            >
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
            />
          </div>

          {/* Campo: Contraseña */}
          <div className="mb-6">
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-bold text-red-100/70"
            >
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className="w-full rounded-2xl border border-white/10 bg-luxe-black/60 px-4 py-3 text-sm text-white placeholder-red-100/30 outline-none transition focus:border-luxe-ember/50 focus:ring-2 focus:ring-luxe-ember/15 disabled:opacity-50"
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
                Iniciando sesión…
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </Button>

          {/* Enlaces adicionales */}
          <div className="mt-6 flex flex-col items-center gap-3 text-sm">
            <a
              href="/register"
              className="font-semibold text-red-100/50 transition hover:text-luxe-ember"
            >
              ¿No tienes cuenta? Regístrate
            </a>
            <a
              href="/forgot-password"
              className="font-semibold text-red-100/40 transition hover:text-luxe-ember"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
