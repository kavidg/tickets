/**
 * TicketS - AppRouter
 *
 * Configuración central de enrutamiento para BrowserRouter.
 * Usa window.location.pathname en lugar de hash para las rutas.
 *
 * Grupos de rutas:
 *
 *   Públicas          -> /, /event/:id, /checkout, /purchase/success, /tickets/search
 *   Autenticación     -> /login, /register, /forgot-password
 *   Cliente           -> /my-tickets, /my-profile, /my-orders
 *   Organizador       -> /organizer/dashboard, /organizer/events
 *   Administrador     -> /admin, /admin/users
 */

import usePathRouter from '../hooks/useHashRouter.js';
import ProtectedRoute from './ProtectedRoute';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';

// Páginas públicas
import HomePage from '../pages/HomePage.jsx';
import EventsPage from '../pages/EventsPage.jsx';
import EventDetailPage from '../pages/EventDetailPage.jsx';
import CheckoutPage from '../pages/CheckoutPage';
import TicketLookupPage from '../pages/TicketLookupPage.jsx';
import PurchaseSuccessPage from '../pages/PurchaseSuccessPage';

// Páginas de autenticación
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';

// Páginas de cliente (protegidas)
import MyTicketsPage from '../pages/MyTicketsPage';
import MyProfilePage from '../pages/MyProfilePage';

// Páginas de organizador (protegidas)
import OrganizerDashboardPage from '../pages/OrganizerDashboardPage';
import OrganizerEventsPage from '../pages/OrganizerEventsPage';
import OrganizerEventManagePage from '../pages/OrganizerEventManagePage';
import OrganizerTicketTypesPage from '../pages/OrganizerTicketTypesPage';
import OrganizationSetupPage from '../pages/OrganizationSetupPage';
import CreateEventPage from '../pages/CreateEventPage';
import VenuesPage from '../pages/VenuesPage';

// Páginas de administrador (protegidas)
import AdminPanelPage from '../pages/AdminPanelPage';
import CategoriesPage from '../pages/CategoriesPage';

import { ROUTE_PREFIXES } from '../constants/routes';

function pagePlaceholder(title, description) {
  return (
    <main className="mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
      <p className="mt-3 text-red-100/60">{description}</p>
      <p className="mt-8 text-sm text-red-100/40">Esta sección estará disponible próximamente.</p>
    </main>
  );
}

function resolveRoute(eventId, pathname) {
  if (eventId) {
    return <EventDetailPage eventId={eventId} />;
  }

  if (pathname === '/checkout') return <CheckoutPage />;
  if (pathname === '/purchase/success') return <PurchaseSuccessPage />;
  if (pathname === '/events') return <EventsPage />;
  if (pathname === '/tickets/search') return <TicketLookupPage />;

  if (pathname === '/login') return <LoginPage />;
  if (pathname === '/register') return <RegisterPage />;
  if (pathname === '/forgot-password') return <ForgotPasswordPage />;

  if (pathname.startsWith(ROUTE_PREFIXES.CLIENT)) {
    return (
      <ProtectedRoute>
        {pathname === '/my-tickets' && <MyTicketsPage />}
        {pathname === '/my-profile' && <MyProfilePage />}
        {pathname === '/my-orders' && pagePlaceholder('Mis pedidos', 'Historial de compras y estado de tus pedidos.')}
      </ProtectedRoute>
    );
  }

  if (pathname === '/organization/setup') {
    return (
      <ProtectedRoute>
        <OrganizationSetupPage />
      </ProtectedRoute>
    );
  }

  if (pathname.startsWith(ROUTE_PREFIXES.ORGANIZER)) {
    return (
      <ProtectedRoute>
        {pathname === '/organizer/dashboard' && <OrganizerDashboardPage />}
        {pathname === '/organizer/events/create' && <CreateEventPage />}
        {pathname === '/organizer/events' && <OrganizerEventsPage />}
        {pathname === '/organizer/venues' && <VenuesPage />}
        {pathname.match(/^\/organizer\/events\/manage\/([^/]+)\/tickets$/) && <OrganizerTicketTypesPage />}
        {pathname.match(/^\/organizer\/events\/manage\/(.+)$/) && <OrganizerEventManagePage />}
        {pathname === '/organizer/settings' && pagePlaceholder('Configuración', 'Ajustes de tu organización.')}
      </ProtectedRoute>
    );
  }

  if (pathname.startsWith(ROUTE_PREFIXES.ADMIN)) {
    return (
      <ProtectedRoute>
        {pathname === '/admin' && <AdminPanelPage />}
        {pathname === '/admin/categories' && <CategoriesPage />}
        {pathname === '/admin/users' && pagePlaceholder('Usuarios', 'Gestiona los usuarios de la plataforma.')}
        {pathname === '/admin/settings' && pagePlaceholder('Configuración global', 'Ajustes generales de la plataforma.')}
      </ProtectedRoute>
    );
  }

  return <HomePage />;
}

export default function AppRouter() {
  const { eventId, pathname } = usePathRouter();

  return (
    <div className="min-h-screen bg-neutral-900 font-sans text-neutral-50 antialiased">
      <Header />
      {resolveRoute(eventId, pathname)}
      <Footer />
    </div>
  );
}
