/**
 * TicketS - AppRouter
 *
 * Configuración central de enrutamiento organizada por módulos.
 *
 * Grupos de rutas:
 *
 *   Públicas          → #/, #/event/:id, #events, #/how-it-works
 *   Autenticación     → #/login, #/register, #/forgot-password
 *   Cliente 🔒        → #/my-tickets, #/my-profile, #/my-orders
 *   Organizador 🔒    → #/organizer/dashboard, #/organizer/events
 *   Administrador 🔒  → #/admin, #/admin/users
 *
 * Las rutas protegidas (🔒) usan <ProtectedRoute> que verifica sesión
 * y redirige a #/login si el usuario no está autenticado.
 * Cuando el sistema de roles esté implementado, se añadirá
 * la propiedad `allowedRoles` para restringir por rol.
 */

import useHashRouter from '../hooks/useHashRouter.js';
import ProtectedRoute from './ProtectedRoute';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';

// Páginas públicas existentes
import HomePage from '../pages/HomePage.jsx';
import EventDetailPage from '../pages/EventDetailPage.jsx';

// Páginas de autenticación (públicas)
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';

// Páginas de cliente (protegidas)
import MyTicketsPage from '../pages/MyTicketsPage';
import MyProfilePage from '../pages/MyProfilePage';

// Páginas de organizador (protegidas)
import OrganizerDashboardPage from '../pages/OrganizerDashboardPage';

// Páginas de administrador (protegidas)
import AdminPanelPage from '../pages/AdminPanelPage';

import { ROUTE_PREFIXES } from '../constants/routes';

// ---------------------------------------------------------------------------
// Resolución de rutas
// ---------------------------------------------------------------------------

/**
 * Renderiza un placeholder genérico para páginas aún no implementadas.
 * @param {string} title - Título de la página
 * @param {string} description - Descripción breve
 * @returns {React.ReactNode}
 */
function pagePlaceholder(title, description) {
  return (
    <main className="mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
      <p className="mt-3 text-red-100/60">{description}</p>
      <p className="mt-8 text-sm text-red-100/40">Esta sección estará disponible próximamente.</p>
    </main>
  );
}

/**
 * Determina qué página renderizar según el hash actual de la URL.
 *
 * @param {string} eventId - ID del evento extraído del hash (o '' si no aplica)
 * @param {string} hash - Hash completo de la URL
 * @returns {React.ReactNode} Componente de página a renderizar
 */
function resolveRoute(eventId, hash) {
  // =====================================================================
  // 1. Ruta pública: detalle de evento
  // =====================================================================
  if (eventId) {
    return <EventDetailPage eventId={eventId} />;
  }

  // =====================================================================
  // 2. Rutas de autenticación (públicas, sin protección)
  // =====================================================================
  if (hash === ROUTE_PREFIXES.AUTH) return <LoginPage />;
  if (hash === '#/register') return <RegisterPage />;
  if (hash === '#/forgot-password') return <ForgotPasswordPage />;

  // =====================================================================
  // 3. Rutas de cliente (protegidas)
  //    Futuro: añadir allowedRoles={['cliente', 'organizador', 'super_admin']}
  // =====================================================================
  if (hash.startsWith(ROUTE_PREFIXES.CLIENT)) {
    return (
      <ProtectedRoute>
        {hash === '#/my-tickets' && <MyTicketsPage />}
        {hash === '#/my-profile' && <MyProfilePage />}
        {hash === '#/my-orders' && pagePlaceholder('Mis pedidos', 'Historial de compras y estado de tus pedidos.')}
      </ProtectedRoute>
    );
  }

  // =====================================================================
  // 4. Rutas de organizador (protegidas)
  //    Futuro: añadir allowedRoles={['organizador', 'super_admin']}
  // =====================================================================
  if (hash.startsWith(ROUTE_PREFIXES.ORGANIZER)) {
    return (
      <ProtectedRoute>
        {hash === '#/organizer/dashboard' && <OrganizerDashboardPage />}
        {hash === '#/organizer/events' && pagePlaceholder('Mis eventos', 'Administra los eventos de tu organización.')}
        {hash === '#/organizer/settings' && pagePlaceholder('Configuración', 'Ajustes de tu organización.')}
      </ProtectedRoute>
    );
  }

  // =====================================================================
  // 5. Rutas de administración (protegidas)
  //    Futuro: añadir allowedRoles={['super_admin']}
  // =====================================================================
  if (hash.startsWith(ROUTE_PREFIXES.ADMIN)) {
    return (
      <ProtectedRoute>
        {hash === '#/admin' && <AdminPanelPage />}
        {hash === '#/admin/users' && pagePlaceholder('Usuarios', 'Gestiona los usuarios de la plataforma.')}
        {hash === '#/admin/settings' && pagePlaceholder('Configuración global', 'Ajustes generales de la plataforma.')}
      </ProtectedRoute>
    );
  }

  // =====================================================================
  // 6. Ruta por defecto: página principal
  // =====================================================================
  return <HomePage />;
}

// ---------------------------------------------------------------------------
// Componente raíz
// ---------------------------------------------------------------------------

/**
 * Componente raíz de enrutamiento.
 * Renderiza el layout general (Header + contenido + Footer).
 */
export default function AppRouter() {
  const { eventId } = useHashRouter();
  const hash = window.location.hash;

  return (
    <div className="min-h-screen bg-luxe-black font-sans text-red-50 antialiased">
      <Header />
      {resolveRoute(eventId, hash)}
      <Footer />
    </div>
  );
}
