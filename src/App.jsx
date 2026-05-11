import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import EventDetailPage from './pages/EventDetailPage.jsx';
import HomePage from './pages/HomePage.jsx';

function getEventIdFromHash() {
  const match = window.location.hash.match(/^#\/event\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : '';
}

function scrollToEventsSection() {
  requestAnimationFrame(() => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  });
}

export default function App() {
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

  return (
    <div className="min-h-screen bg-luxe-black font-sans text-red-50 antialiased">
      <Header />
      {eventId ? <EventDetailPage eventId={eventId} /> : <HomePage />}
      <footer className="border-t border-white/10 bg-luxe-black/95 py-8 text-center text-sm font-semibold text-red-100/45">
        PulsePass © 2026 · Todos los derechos reservados
      </footer>
    </div>
  );
}
