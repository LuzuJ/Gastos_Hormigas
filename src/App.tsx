import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from './config/firebase';
import { AppProvider } from './contexts/AppContext'; // Importa el proveedor
import { Layout, type Page } from './components/Layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { PlanningPage } from './pages/PlanningPage';
import { RegistroPage } from './pages/RegistroPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { ManageCategoriesPage } from './pages/ManageCategoriesPage';
import { Toaster } from 'react-hot-toast';
import './index.css';
import { PAGE_ROUTES } from './constants';

// Componente para la aplicación principal, se muestra cuando el usuario está logueado
const MainApp: React.FC<{ user: User }> = ({ user }) => {
  const [currentPage, setCurrentPage] = useState<Page>(PAGE_ROUTES.DASHBOARD);
  const isGuest = user.isAnonymous;

  const renderPage = () => {
    switch (currentPage) {
      case PAGE_ROUTES.DASHBOARD: return <DashboardPage isGuest={isGuest} />;
      case PAGE_ROUTES.REGISTRO: return <RegistroPage />;
      case PAGE_ROUTES.PLANNING: return <PlanningPage isGuest={isGuest} />;
      case PAGE_ROUTES.REPORTS: return <ReportsPage isGuest={isGuest} />;
      case PAGE_ROUTES.ANALYSIS: return <ManageCategoriesPage isGuest={isGuest} />;
      case PAGE_ROUTES.PROFILE: return <ProfilePage userId={user.uid} isGuest={isGuest} setCurrentPage={setCurrentPage} />;
      default: return <DashboardPage isGuest={false} />;
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} isGuest={isGuest}>
      {renderPage()}
    </Layout>
  );
};


// Componente principal de la aplicación
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isValidatingUser, setIsValidatingUser] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🔄 Auth state changed:', currentUser ? currentUser.uid : 'null');
      setIsValidatingUser(true);
      
      if (currentUser && !currentUser.isAnonymous) {
        // Para usuarios registrados, verificar que tengan perfil completo
        console.log('👤 Verificando perfil para usuario registrado');
        try {
          const { userService } = await import('./services/userService');
          const userProfile = await userService.getUserProfile(currentUser.uid);
          console.log('📋 Perfil en App.tsx:', userProfile ? 'ENCONTRADO' : 'NO ENCONTRADO');
          
          if (!userProfile) {
            // Intentar crear el perfil automáticamente en lugar de rechazar
            console.log('🔧 Intentando crear perfil automáticamente');
            await userService.createUserProfile(currentUser);
            const newProfile = await userService.getUserProfile(currentUser.uid);
            
            if (newProfile) {
              console.log('✅ Perfil creado exitosamente');
              setUser(currentUser);
            } else {
              // Solo rechazar si realmente no se puede crear el perfil
              console.log('❌ No se pudo crear perfil, cerrando sesión');
              await signOut(auth);
              setUser(null);
            }
          } else {
            console.log('✅ Perfil válido, permitiendo acceso');
            setUser(currentUser);
          }
        } catch (error) {
          console.error('🚫 Error verificando perfil de usuario:', error);
          // En caso de error, permitir el acceso pero loggear el problema
          setUser(currentUser);
        }
      } else {
        // Usuario anónimo o no autenticado
        console.log('👤 Usuario anónimo o no autenticado');
        setUser(currentUser);
      }
      
      setIsValidatingUser(false);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!isAuthReady || isValidatingUser) {
    return <div className="loading-screen">Cargando...</div>;
  }

  return (
    // AppProvider envuelve toda la lógica condicional
    <AppProvider userId={user?.uid || null}>
      <Toaster position="bottom-center" />
      {user ? <MainApp user={user} /> : <LoginPage />}
    </AppProvider>
  );
}