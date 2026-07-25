import { useEffect, useMemo, useState } from 'react';

/**
 * Extract the event ID from a pathname string.
 * Supports patterns: /event/some-id
 * @param {string} pathname - The full URL path
 * @returns {string}
 */
function getEventIdFromPath(pathname) {
  const match = pathname.match(/^\/event\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Custom hook that manages client-side routing based on pathname.
 *
 * Tracks the current pathname so that ANY navigation change triggers
 * a React re-render.
 *
 * Returns the current event ID derived from the pathname, or '' if on the home page.
 * @returns {{ eventId: string, pathname: string }}
 */
export default function usePathRouter() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => {
      const newPath = window.location.pathname;
      setPathname(newPath);
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const eventId = useMemo(() => getEventIdFromPath(pathname), [pathname]);

  return { eventId, pathname };
}
