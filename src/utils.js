export function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat('es-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(new Date(value));
}

export function formatPrice(value) {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function isWithinDateFilter(dateValue, filter) {
  if (filter === 'all') return true;

  const eventDate = new Date(dateValue);
  const now = new Date('2026-05-06T00:00:00');
  const days = filter === 'week' ? 7 : filter === 'month' ? 31 : 90;
  const limit = new Date(now);
  limit.setDate(now.getDate() + days);

  return eventDate >= now && eventDate <= limit;
}
