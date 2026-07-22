/**
 * TicketS - Contexto de Autenticación
 *
 * Proveedor global de autenticación que administra el estado del usuario
 * y expone funciones para login, registro, logout y recuperación de contraseña.
 *
 * Arquitectura:
 *   Componente → useAuth() → AuthContext (este archivo) → AuthService → Firebase Auth
 *
 * El AuthContext consume exclusivamente el AuthService.
 * No existe comunicación directa con Firebase desde este contexto.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import {
  loginUser,
  registerUser,
  logoutUser,
  resetPassword as resetPasswordService,
  sendVerificationEmail as sendVerificationService,
  reloadCurrentUser as reloadService,
  onAuthStateChanged,
} from '../services/auth.service';

import type { AuthUser, AuthResponse } from '../types/auth';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/**
 * Valor del contexto de autenticación expuesto a los consumidores.
 */
export interface AuthContextValue {
  /** Usuario autenticado actual o null si no hay sesión */
  user: AuthUser | null;
  /** Indica si se está verificando el estado de la sesión inicial */
  loading: boolean;
  /** Indica si hay un usuario autenticado (atajo para user !== null) */
  authenticated: boolean;
  /** Inicia sesión con email y contraseña */
  login: (email: string, password: string) => Promise<AuthResponse>;
  /** Registra un nuevo usuario con email y contraseña */
  register: (email: string, password: string) => Promise<AuthResponse>;
  /** Cierra la sesión del usuario actual */
  logout: () => Promise<AuthResponse>;
  /** Envía correo de recuperación de contraseña */
  resetPassword: (email: string) => Promise<AuthResponse>;
  /** Envía correo de verificación al usuario actual */
  sendVerificationEmail: () => Promise<AuthResponse>;
  /** Refresca el estado del usuario desde Firebase Auth */
  reloadUser: () => Promise<AuthResponse>;
}

// ---------------------------------------------------------------------------
// Contexto
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Proveedor
// ---------------------------------------------------------------------------

/**
 * Proveedor global de autenticación.
 *
 * Debe envolver la aplicación (o la parte que necesite acceso a auth).
 * Escucha automáticamente los cambios de sesión mediante Firebase Auth
 * y mantiene el estado loading mientras se valida la sesión inicial.
 *
 * @example
 * // En main.jsx o App.jsx:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // -----------------------------------------------------------------------
  // Listener de sesión
  // -----------------------------------------------------------------------
  // Escucha cambios en el estado de autenticación de Firebase.
  // Se dispara al iniciar sesión, cerrar sesión, recargar la página, etc.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  // -----------------------------------------------------------------------
  // Funciones de autenticación
  // -----------------------------------------------------------------------

  /**
   * Inicia sesión con email y contraseña.
   * El estado del usuario se actualiza automáticamente vía onAuthStateChanged.
   */
  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    const response = await loginUser(email, password);
    return response;
  }, []);

  /**
   * Registra un nuevo usuario.
   * El estado del usuario se actualiza automáticamente vía onAuthStateChanged.
   */
  const register = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    const response = await registerUser(email, password);
    return response;
  }, []);

  /**
   * Cierra la sesión del usuario actual.
   * El estado se limpia automáticamente vía onAuthStateChanged.
   */
  const logout = useCallback(async (): Promise<AuthResponse> => {
    const response = await logoutUser();
    return response;
  }, []);

  /**
   * Envía un correo de recuperación de contraseña.
   */
  const resetPassword = useCallback(async (email: string): Promise<AuthResponse> => {
    const response = await resetPasswordService(email);
    return response;
  }, []);

  /**
   * Envía correo de verificación al usuario actual.
   */
  const sendVerificationEmail = useCallback(async (): Promise<AuthResponse> => {
    const response = await sendVerificationService();
    return response;
  }, []);

  /**
   * Refresca el estado del usuario desde Firebase Auth.
   */
  const reloadUser = useCallback(async (): Promise<AuthResponse> => {
    const response = await reloadService();
    return response;
  }, []);

  // -----------------------------------------------------------------------
  // Valor del contexto (memorizado)
  // -----------------------------------------------------------------------

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      authenticated: user !== null,
      login,
      register,
      logout,
      resetPassword,
      sendVerificationEmail,
      reloadUser,
    }),
    [user, loading, login, register, logout, resetPassword, sendVerificationEmail, reloadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook personalizado
// ---------------------------------------------------------------------------

/**
 * Hook para consumir el contexto de autenticación.
 * Debe usarse dentro de un AuthProvider.
 *
 * @throws Error si se usa fuera del AuthProvider.
 *
 * @example
 * function MiComponente() {
 *   const { user, loading, login, logout } = useAuth();
 *
 *   if (loading) return <Spinner />;
 *   if (!user) return <LoginForm onLogin={login} />;
 *   return <Dashboard onLogout={logout} />;
 * }
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
