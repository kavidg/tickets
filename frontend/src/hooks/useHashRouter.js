import { useEffect, useState } from 'react';

/**
 * Extract the event ID from the URL hash.
 * Supports patterns: #/event/some-id, #events, #/, #/how-it-works, etc.
 * @returns {string}
 */
function getEventIdFromHash() {
  const match = window.location.hash.match(/^#\/event\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Scroll to the #events section smoothly.
 */
function scrollToEventsSection() {
  requestAnimationFrame(() => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  });
}

/**
 * Custom hook that manages hash-based client-side routing.
 * Returns the current event ID derived from the hash, or '' if on the home page.
 * @returns {{ eventId: string }}
 */
export default function useHashRouter() {
  const [eventId, setEventId] = useState(getEventIdFromHash());

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;

      setEventId(getEventIdFromHash());

      if (hash.startsWith('#/event') || hash === '#/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (hash === '#events') {
        scrollToEventsSection();
      }
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return { eventId };
}
