import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useUserProfile } from '../hooks/profile/useUserProfile';
import { supabase } from '../config/supabase';
import type { User, Session } from '@supabase/supabase-js';

// Contexto para autenticación y perfil de usuario
const AuthContext = createContext<ReturnType<typeof useUserProfile> & {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
} | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Obtener el usuario actual al cargar el componente
  useEffect(() => {
    // Función para obtener la sesión actual
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        
        // Obtener la sesión actual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);
      } catch (error) {
        console.error('Error al obtener la sesión inicial:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Obtener la sesión inicial
    getInitialSession();
    
    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[AUTH] Auth state changed:', event, newSession?.user?.id || 'No user');
        setSession(newSession);
        setUser(newSession?.user || null);
      }
    );
    
    // Limpiar suscripción al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Usar el hook de perfil de usuario con el ID del usuario actual
  const profileData = useUserProfile(user?.id || null);

  return (
    <AuthContext.Provider value={{ ...profileData, user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de AuthProvider');
  }
  return context;
};

// Hook adicional para obtener solo la información de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return {
    user: context.user,
    session: context.session,
    isLoading: context.isLoading,
    isAuthenticated: !!context.user
  };
};
