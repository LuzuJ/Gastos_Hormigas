import React, { createContext, useContext, type ReactNode } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';

// Contexto para autenticación y perfil de usuario
const AuthContext = createContext<ReturnType<typeof useUserProfile> | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  userId: string | null;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, userId }) => {
  const profileData = useUserProfile(userId);

  return (
    <AuthContext.Provider value={profileData}>
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
