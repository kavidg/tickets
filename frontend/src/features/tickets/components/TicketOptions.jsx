import { CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../../../utils/format.js';
import Button from '../../../components/ui/Button.jsx';

/**
 * Displays a list of ticket options for an event with pricing and CTA.
 */
export default function TicketOptions({ tickets }) {
  return (
    <div className="space-y-4">
      {tickets.map((ticket, index) => (
        <div key={ticket.name} className={`rounded-[1.5rem] border p-5 shadow-2xl shadow-black/25 backdrop-blur-xl ${index === 1 ? 'border-brand/35 bg-brand/30' : 'border-white/10 bg-white/[0.055]'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-black text-white">{ticket.name}</p>
              <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-neutral-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-light" /> {ticket.perks}
              </p>
            </div>
            <p className="text-2xl font-black text-white">{formatPrice(ticket.price)}</p>
          </div>
          <Button className="mt-4 w-full" variant={index === 1 ? 'glow' : 'primary'}>Comprar</Button>
        </div>
      ))}
    </div>
  );
}
