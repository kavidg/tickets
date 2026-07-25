/**
 * TicketS - AdminPanelPage
 *
 * Panel de administración global de la plataforma.
 * Protegida: requiere autenticación.
 *
 * Módulos disponibles:
 *   - Categorías
 *   - Usuarios (futuro)
 *   - Configuración global (futuro)
 */

import Button from '../components/ui/Button';

/**
 * Panel de administración global.
 */
export default function AdminPanelPage() {
  return (
    <main className="relative mx-auto max-w-6xl px-4 py-20 text-center">
      {/* Fondos decorativos */}
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-luxe-wine/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-luxe-ember/10 blur-3xl" />

      <div className="relative">
        <h1 className="text-3xl font-black tracking-tight text-white">
          Panel de administración
        </h1>
        <p className="mt-3 text-red-100/60">
          Gestiona categorías, usuarios y configuración global de la plataforma.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Button
            href="/admin/categories"
            variant="glow"
            className="min-w-[240px]"
          >
            Categorías
          </Button>
          <Button
            href="/admin/users"
            variant="secondary"
            className="min-w-[240px]"
          >
            Usuarios
          </Button>
          <Button
            href="/admin/settings"
            variant="secondary"
            className="min-w-[240px]"
          >
            Configuración
          </Button>
        </div>
      </div>
    </main>
  );
}
