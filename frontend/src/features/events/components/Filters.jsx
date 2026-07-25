import { CalendarDays, SlidersHorizontal } from 'lucide-react';
import { dateFilters } from '../data/events.js';

/**
 * Modern filter controls for category and date range selection.
 */
export default function Filters({ category, dateFilter, onCategoryChange, onDateFilterChange, categories: categoriesProp }) {
  const categoryOptions = categoriesProp || ['Todos', 'Música', 'Tecnología', 'Gastronomía', 'Arte', 'Bienestar'];

  return (
    <div className="card-base p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-light">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filtrar eventos
          </p>
          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Encuentra tu plan perfecto
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[28rem]">
          <label className="text-xs font-medium text-neutral-400">
            Categoría
            <select
              className="input-base mt-1.5"
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
            >
              {categoryOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-brand-light" /> Fecha
            </span>
            <select
              className="input-base mt-1.5"
              value={dateFilter}
              onChange={(event) => onDateFilterChange(event.target.value)}
            >
              {dateFilters.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
