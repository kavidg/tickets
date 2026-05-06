import { CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../utils.js';
import Button from './Button.jsx';

export default function TicketOptions({ tickets }) {
  return (
    <div className="space-y-4">
      {tickets.map((ticket, index) => (
        <div key={ticket.name} className={`rounded-[1.5rem] border p-5 ${index === 1 ? 'border-cyan-300 bg-cyan-50/70' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-black text-slate-950">{ticket.name}</p>
              <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-slate-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" /> {ticket.perks}
              </p>
            </div>
            <p className="text-2xl font-black text-slate-950">{formatPrice(ticket.price)}</p>
          </div>
          <Button className="mt-4 w-full" variant={index === 1 ? 'glow' : 'primary'}>Comprar</Button>
        </div>
      ))}
    </div>
  );
}
