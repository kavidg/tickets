import { CalendarDays, SlidersHorizontal } from 'lucide-react';
import { categories, dateFilters } from '../data/events.js';

export default function Filters({ category, dateFilter, onCategoryChange, onDateFilterChange }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-4 shadow-deep-luxe backdrop-blur-2xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-luxe-ember">
            <SlidersHorizontal className="h-4 w-4" /> Filtrar eventos
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Elige tu plan ideal</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[32rem]">
          <label className="text-sm font-bold text-red-100/65">
            Categoría
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-luxe-black/80 px-4 py-3 text-red-50 outline-none transition focus:border-luxe-ember/60 focus:ring-4 focus:ring-luxe-ember/15"
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold text-red-100/65">
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-luxe-ember" /> Fecha</span>
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-luxe-black/80 px-4 py-3 text-red-50 outline-none transition focus:border-luxe-ember/60 focus:ring-4 focus:ring-luxe-ember/15"
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
