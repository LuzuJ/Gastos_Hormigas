import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from './config/firebase';
import { userService } from './services/profile/userService';
import { authService } from './services/auth/authService';
import { AppProvider } from './contexts/AppContext';
import { Layout, type Page } from './components/layout/Layout/Layout';
import { PWAManager } from './components/PWAManager';
import { Toaster } from 'react-hot-toast';
import { PAGE_ROUTES } from './constants';
import { 
  DashboardPage,
  ReportsPage,
  PlanningPage,
  RegistroPage,
  LoginPage,
  ProfilePage,
  ManageCategoriesPage,
  BudgetPage,
  preloadRoutesFor
} from './routes/lazyRoutes';

// Componente para la aplicación principal, se muestra cuando el usuario está logueado
const MainApp: React.FC<{ user: User }> = ({ user }) => {
  const [currentPage, setCurrentPage] = useState<Page>(PAGE_ROUTES.DASHBOARD);
  const isGuest = user.isAnonymous;

  // Precargar rutas relacionadas cuando se carga una página
  useEffect(() => {
    preloadRoutesFor(currentPage);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case PAGE_ROUTES.DASHBOARD: 
        return <DashboardPage isGuest={isGuest} userId={user.uid} />;
      case PAGE_ROUTES.REGISTRO: 
        return <RegistroPage />;
      case PAGE_ROUTES.PLANNING: 
        return <PlanningPage isGuest={isGuest} />;
      case PAGE_ROUTES.REPORTS: 
        return <ReportsPage isGuest={isGuest} />;
      case PAGE_ROUTES.ANALYSIS: 
        return <ManageCategoriesPage isGuest={isGuest} />;
      case PAGE_ROUTES.BUDGET: 
        return <BudgetPage isGuest={isGuest} />;
      case PAGE_ROUTES.PROFILE: 
        return <ProfilePage userId={user.uid} isGuest={isGuest} setCurrentPage={setCurrentPage} />;
      default: 
        return <DashboardPage isGuest={false} userId={user.uid} />;
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
    // Handle Google Sign-In redirect result first (for mobile devices)
    const handleInitialRedirect = async () => {
      const redirectResult = await authService.handleRedirectResult();
      if (redirectResult.error) {
        console.error('Error handling redirect:', redirectResult.error);
      }
    };
    
    // Handle redirect immediately
    handleInitialRedirect();
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsValidatingUser(true);
      
      if (currentUser && !currentUser.isAnonymous) {
        // Para usuarios registrados, verificar que tengan perfil completo
        try {
          const userProfile = await userService.getUserProfile(currentUser.uid);
          
          if (!userProfile) {
            // Intentar crear el perfil automáticamente en lugar de rechazar
            await userService.createUserProfile(currentUser);
            const newProfile = await userService.getUserProfile(currentUser.uid);
            
            if (newProfile) {
              setUser(currentUser);
            } else {
              // Solo rechazar si realmente no se puede crear el perfil
              await signOut(auth);
              setUser(null);
            }
          } else {
            setUser(currentUser);
          }
        } catch (error) {
          console.error('Error verificando perfil de usuario:', error);
          // En caso de error, permitir el acceso pero loggear el problema
          setUser(currentUser);
        }
      } else {
        // Usuario anónimo o no autenticado
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
      <PWAManager showInstallPrompt={true} />
      <Toaster position="bottom-center" />
      {user ? (
        <MainApp user={user} />
      ) : (
        <LoginPage />
      )}
    </AppProvider>
  );
}