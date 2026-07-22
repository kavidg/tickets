/**
 * TicketS - Cloud Functions Entry Point
 *
 * Exporta todas las Cloud Functions organizadas por módulo.
 * Firebase Functions detecta automáticamente los exports.
 *
 * Arquitectura:
 *   - payments/   → Abstracción de pasarelas de pago
 *   - services/   → Lógica de negocio del backend
 *   - functions/  → Cloud Functions (HTTP, Callable, Triggers)
 *   - utils/      → Utilidades compartidas
 *
 * @see docs/ARCHITECTURE.md para la documentación completa.
 */

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------
export { checkout, checkPaymentStatus } from './functions/checkout';

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------
export { webhooks } from './functions/webhooks';

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------
export {
  generateTicketsFromPurchase,
  onPurchaseCompleted,
} from './functions/tickets';

// ---------------------------------------------------------------------------
// Check-in
// ---------------------------------------------------------------------------
export { checkinByQR, getEventTickets } from './functions/checkin';
