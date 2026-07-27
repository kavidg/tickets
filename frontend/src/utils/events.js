import { toDate } from './format.js';

/**
 * Filtra eventos por categoría y rango de fechas (client-side).
 * Compartido entre HomePage y EventsPage.
 */
export function filterEvents(events, categoryFilter, dateFilter, categoryIdByName) {
  return events.filter((event) => {
    if (categoryFilter !== 'Todos') {
      const targetId = categoryIdByName[categoryFilter];
      if (!targetId || event.categoryId !== targetId) return false;
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const eventDate = toDate(event.startDate);
      const days = dateFilter === 'week' ? 7 : dateFilter === 'month' ? 31 : 90;
      const limit = new Date(now);
      limit.setDate(now.getDate() + days);
      if (eventDate < now || eventDate > limit) return false;
    }

    return true;
  });
}

/**
 * Convierte eventos filtrados al formato que espera EventGrid.
 */
export function mapToCardEvents(filteredEvents, categoryNameById) {
  return filteredEvents.map((event) => ({
    id: event.slug,
    image: event.imageUrl,
    category: categoryNameById[event.categoryId] || event.categoryId,
    price: 0,
    title: event.title,
    date: toDate(event.startDate).toISOString(),
    location: [event.city, event.address].filter(Boolean).join(' · '),
  }));
}
