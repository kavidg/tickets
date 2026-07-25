import { Calendar, MapPin } from 'lucide-react';
import { formatDate, formatPrice } from '../../../utils/format.js';
import Button from '../../../components/ui/Button.jsx';

/**
 * Modern event card with image, category badge, price, date, location,
 * and a CTA button. Clean design with subtle hover lift effect.
 */
export default function EventCard({ event }) {
  return (
    <article className="card-base group overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <a href={`/event/${event.id}`} className="block overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            className="h-full w-full object-cover brightness-90 saturate-[0.9] transition duration-500 group-hover:scale-105 group-hover:brightness-100"
            src={event.image}
            alt={event.title}
            loading="lazy"
          />
          {/* Category badge overlay */}
          <span className="absolute left-3 top-3 rounded-lg border border-white/[0.12] bg-neutral-900/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-200 backdrop-blur-sm">
            {event.category}
          </span>
        </div>
      </a>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base font-bold tracking-tight text-white sm:text-lg">
          <a href={`/event/${event.id}`} className="transition hover:text-brand-light">
            {event.title}
          </a>
        </h3>

        <div className="mt-3 space-y-1.5 text-xs text-neutral-400">
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-brand-light" />
            {formatDate(event.date)}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-brand-light" />
            {event.location}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-base font-bold text-white">
            {formatPrice(event.price)}
          </span>
          <Button href={`/event/${event.id}`} variant="outline" size="sm">
            Ver entradas
          </Button>
        </div>
      </div>
    </article>
  );
}
