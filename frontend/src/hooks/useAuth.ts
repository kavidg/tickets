/**
 * TicketS - useAuth Hook
 *
 * Hook personalizado que re-exporta el hook de autenticación desde el contexto.
 *
 * Proporciona una interfaz limpia para que los componentes accedan al estado
 * y funciones de autenticación sin importar directamente el contexto.
 *
 * Arquitectura:
 *   Componente → useAuth() → AuthContext → AuthService → Firebase Auth
 *
 * @example
 * import { useAuth } from '../hooks/useAuth';
 *
 * function ProfileButton() {
 *   const { user, loading, logout } = useAuth();
 *   if (loading) return null;
 *   return user ? <button onClick={logout}>Cerrar sesión</button> : null;
 * }
 */

export { useAuth } from '../contexts/AuthContext';
export type { AuthContextValue } from '../contexts/AuthContext';
