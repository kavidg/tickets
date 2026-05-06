import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import EventDetailPage from './pages/EventDetailPage.jsx';
import HomePage from './pages/HomePage.jsx';

function getEventIdFromHash() {
  const match = window.location.hash.match(/^#\/event\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : '';
}

export default function App() {
  const [eventId, setEventId] = useState(getEventIdFromHash());

  useEffect(() => {
    const onHashChange = () => {
      setEventId(getEventIdFromHash());
      if (window.location.hash.startsWith('#/event') || window.location.hash === '#/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <Header />
      {eventId ? <EventDetailPage eventId={eventId} /> : <HomePage />}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm font-semibold text-slate-500">
        PulsePass © 2026 · Tiquetera SaaS para eventos con UX de alta conversión
      </footer>
    </div>
  );
}
