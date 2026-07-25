/**
 * Convierte un Timestamp de Firestore a un objeto Date de JavaScript.
 *
 * Soporta:
 *   - Firestore SDK Timestamp (con toDate())
 *   - API REST Timestamp ({ _seconds, _nanoseconds })
 *   - String ISO
 *   - Date nativo
 *   - null/undefined (retorna new Date() como fallback)
 *
 * @param {any} timestamp
 * @returns {Date}
 *
 * @example
 * toDate({ _seconds: 1700000000, _nanoseconds: 0 })  → Date
 * toDate(firestoreTimestamp) → Date
 * toDate('2026-01-01T00:00:00Z') → Date
 */
export function toDate(timestamp) {
  if (!timestamp) return new Date();
  // Firestore SDK Timestamp
  if (typeof timestamp.toDate === 'function') return timestamp.toDate();
  // API REST Timestamp
  if (typeof timestamp._seconds === 'number') {
    return new Date(timestamp._seconds * 1000);
  }
  // String ISO o Date nativo
  return new Date(timestamp);
}

/**
 * Format a date value into a human-readable string.
 * @param {string|number|Date} value
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
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

/**
 * Format a number as currency (USD, no decimals).
 * @param {number|string} value
 * @returns {string}
 */
export function formatPrice(value) {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Check if a given date falls within the selected date filter range.
 * @param {string} dateValue
 * @param {string} filter
 * @returns {boolean}
 */
export function isWithinDateFilter(dateValue, filter) {
  if (filter === 'all') return true;

  const eventDate = new Date(dateValue);
  const now = new Date('2026-05-06T00:00:00');
  const days = filter === 'week' ? 7 : filter === 'month' ? 31 : 90;
  const limit = new Date(now);
  limit.setDate(now.getDate() + days);

  return eventDate >= now && eventDate <= limit;
}
