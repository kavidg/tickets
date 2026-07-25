/**
 * TicketS - EventManageActions
 *
 * Componente que muestra las acciones disponibles para gestionar un evento.
 * Cada botón navega a la sección correspondiente dentro del panel organizador.
 *
 * @example
 * <EventManageActions eventId="abc123" />
 */

import { Edit, Ticket, DollarSign, Users, BarChart3 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Configuración de acciones
// ---------------------------------------------------------------------------

interface ActionConfig {
  /** Etiqueta del botón */
  label: string;
  /** Descripción breve */
  description: string;
  /** Icono de lucide-react */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  /** Navegación destino */
  href: string;
  /** Si está deshabilitado (funcionalidad no implementada) */
  disabled?: boolean;
}

interface EventManageActionsProps {
  /** ID del evento para construir las rutas */
  eventId: string;
  /** Slug del evento para el preview público */
  eventSlug: string;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Panel de acciones rápidas para gestionar un evento.
 *
 * @param eventId - ID del evento para construir las rutas internas.
 * @param eventSlug - Slug del evento para el preview público.
 */
export default function EventManageActions({
  eventId,
  eventSlug,
}: EventManageActionsProps) {
  const actions: ActionConfig[] = [
    {
      label: 'Editar evento',
      description: 'Modifica la información del evento',
      icon: Edit,
      href: `/organizer/events/manage/${eventId}/edit`,
      disabled: true,
    },
    {
      label: 'Boletas',
      description: 'Administra tipos de entrada y precios',
      icon: Ticket,
      href: `/organizer/events/manage/${eventId}/tickets`,
      disabled: false,
    },
    {
      label: 'Ventas',
      description: 'Consulta las ventas realizadas',
      icon: DollarSign,
      href: `/organizer/events/manage/${eventId}/sales`,
      disabled: true,
    },
    {
      label: 'Asistentes',
      description: 'Lista de asistentes y check-in',
      icon: Users,
      href: `/organizer/events/manage/${eventId}/attendees`,
      disabled: true,
    },
    {
      label: 'Analytics',
      description: 'Métricas y estadísticas del evento',
      icon: BarChart3,
      href: `/organizer/events/manage/${eventId}/analytics`,
      disabled: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;

        if (action.disabled) {
          return (
            <div
              key={action.label}
              className="group rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 opacity-50 shadow-lg shadow-black/25 backdrop-blur-xl transition"
              title="Próximamente disponible"
            >
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                <Icon className="h-5 w-5 text-neutral-400" />
              </div>
              <p className="text-sm font-bold text-white">{action.label}</p>
              <p className="mt-1 text-xs text-neutral-500">{action.description}</p>
            </div>
          );
        }

        return (
          <a
            key={action.label}
            href={action.href}
            className="group rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-brand/30 hover:bg-white/[0.08]"
          >
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl border border-brand/20 bg-brand/20">
              <Icon className="h-5 w-5 text-brand-light" />
            </div>
            <p className="text-sm font-bold text-white">{action.label}</p>
            <p className="mt-1 text-xs text-neutral-400">{action.description}</p>
          </a>
        );
      })}

      {/* Enlace para ver evento en público */}
      <a
        href={`/event/${eventSlug}`}
        className="group col-span-full rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-center text-sm font-semibold text-neutral-400 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:border-brand/30 hover:text-brand-light"
      >
        ← Ver evento en público
      </a>
    </div>
  );
}
