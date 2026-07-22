import { useMemo } from 'react';
import { events } from '../data/events.js';
import { isWithinDateFilter } from '../../../utils/format.js';

/**
 * Custom hook that filters the events array by category and date range.
 * @param {string} category
 * @param {string} dateFilter
 * @returns {{ filteredEvents: import('../../../types/event.js').EventData[] }}
 */
export default function useFilteredEvents(category, dateFilter) {
  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesCategory = category === 'Todos' || event.category === category;
        return matchesCategory && isWithinDateFilter(event.date, dateFilter);
      }),
    [category, dateFilter],
  );

  return { filteredEvents };
}
