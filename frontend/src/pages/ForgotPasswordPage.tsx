/**
 * TicketS - ForgotPasswordPage
 *
 * Pantalla de recuperación de contraseña.
 * Utiliza exclusivamente useAuth() para enviar el correo de restablecimiento.
 * No accede directamente a Firebase.
 *
 * Flujo:
 *   1. Usuario ingresa su correo electrónico
 *   2. Se valida el formato del email
 *   3. Se envía el correo de recuperación vía useAuth().resetPassword()
 *   4. Se muestra mensaje de éxito o error
 */

import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  // Estado del formulario
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // -----------------------------------------------------------------------
  // Validación
  // -----------------------------------------------------------------------

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(): string | null {
    if (!email.trim()) return 'El correo electrónico es requerido.';
    if (!EMAIL_REGEX.test(email.trim())) return 'El correo electrónico no es válido.';
    return null;
  }

  // -----------------------------------------------------------------------
  // Manejo del envío
  // -----------------------------------------------------------------------

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSent(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const response = await resetPassword(email.trim());

      if (!response.success) {
        setError(response.error || 'Error al enviar el correo de recuperación.');
        setSubmitting(false);
        return;
      }

      setSent(true);
      setSubmitting(false);
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
            Recuperar contraseña
          </h1>
          <p className="mt-2 text-red-100/60">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 shadow-deep-luxe backdrop-blur-2xl"
          noValidate
        >
          {/* Mensaje de éxito */}
          {sent && (
            <div
              className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-300"
              role="status"
            >
              Te hemos enviado un enlace de recuperación a{' '}
              <strong className="text-green-200">{email}</strong>.
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </div>
          )}

          {/* Mensaje de error */}
          {error && !sent && (
            <div
              className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
              role="alert"
            >
              {error}
            </div>
          )}

          {!sent && (
            <>
              {/* Campo: Email */}
              <div className="mb-6">
                <label
                  htmlFor="forgot-email"
                  className="mb-2 block text-sm font-bold text-red-100/70"
                >
                  Correo electrónico
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Enviando…
                  </span>
                ) : (
                  'Enviar enlace'
                )}
              </Button>
            </>
          )}

          {/* Enlace a Login */}
          <div className="mt-6 text-center text-sm">
            <a
              href="#/login"
              className="font-semibold text-red-100/50 transition hover:text-luxe-ember"
            >
              Volver al inicio de sesión
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
