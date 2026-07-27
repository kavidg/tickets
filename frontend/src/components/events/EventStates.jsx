/**
 * Componentes de estado compartidos para las páginas de listado de eventos.
 * Reutilizados por HomePage y EventsPage.
 */

/**
 * Skeleton loader con 6 cards animadas para mostrar durante la carga de eventos.
 */
export function LoadingSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="card-base overflow-hidden p-0">
          <div className="aspect-[16/9] skeleton" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-24 skeleton" />
            <div className="h-5 w-3/4 skeleton" />
            <div className="space-y-2">
              <div className="h-3 w-1/2 skeleton" />
              <div className="h-3 w-2/3 skeleton" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="h-5 w-16 skeleton" />
              <div className="h-8 w-24 skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Mensaje de error con botón de reintento.
 */
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="card-base flex flex-col items-center p-10 text-center">
      <h3 className="text-lg font-semibold text-white">Error al cargar eventos</h3>
      <p className="mt-2 text-sm text-neutral-400">{message}</p>
      <button onClick={onRetry} className="btn-primary mt-6">
        Reintentar
      </button>
    </div>
  );
}
