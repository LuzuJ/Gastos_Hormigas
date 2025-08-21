import React, { useState, useEffect, Suspense, lazy } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from './config/firebase';
import { userService } from './services/userService';
import { AppProvider } from './contexts/AppContext';
import { Layout, type Page } from './components/Layout/Layout';
import { PageLoader } from './components/PageLoader/PageLoader';
import { Toaster } from 'react-hot-toast';
import { PAGE_ROUTES } from './constants';

// Lazy loading de páginas para mejorar el code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const PlanningPage = lazy(() => import('./pages/PlanningPage').then(module => ({ default: module.PlanningPage })));
const RegistroPage = lazy(() => import('./pages/RegistroPage').then(module => ({ default: module.RegistroPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const ManageCategoriesPage = lazy(() => import('./pages/ManageCategoriesPage').then(module => ({ default: module.ManageCategoriesPage })));

// Componente para la aplicación principal, se muestra cuando el usuario está logueado
const MainApp: React.FC<{ user: User }> = ({ user }) => {
  const [currentPage, setCurrentPage] = useState<Page>(PAGE_ROUTES.DASHBOARD);
  const isGuest = user.isAnonymous;

  const renderPage = () => {
    switch (currentPage) {
      case PAGE_ROUTES.DASHBOARD: 
        return (
          <Suspense fallback={<PageLoader message="Cargando Dashboard..." />}>
            <DashboardPage isGuest={isGuest} userId={user.uid} />
          </Suspense>
        );
      case PAGE_ROUTES.REGISTRO: 
        return (
          <Suspense fallback={<PageLoader message="Cargando Registro..." />}>
            <RegistroPage />
          </Suspense>
        );
      case PAGE_ROUTES.PLANNING: 
        return (
          <Suspense fallback={<PageLoader message="Cargando Planificación..." />}>
            <PlanningPage isGuest={isGuest} />
          </Suspense>
        );
      case PAGE_ROUTES.REPORTS: 
        return (
          <Suspense fallback={<PageLoader message="Cargando Reportes..." />}>
            <ReportsPage isGuest={isGuest} />
          </Suspense>
        );
      case PAGE_ROUTES.ANALYSIS: 
        return (
          <Suspense fallback={<PageLoader message="Cargando Análisis..." />}>
            <ManageCategoriesPage isGuest={isGuest} />
          </Suspense>
        );
      case PAGE_ROUTES.PROFILE: 
        return (
          <Suspense fallback={<PageLoader message="Cargando Perfil..." />}>
            <ProfilePage userId={user.uid} isGuest={isGuest} setCurrentPage={setCurrentPage} />
          </Suspense>
        );
      default: 
        return (
          <Suspense fallback={<PageLoader message="Cargando..." />}>
            <DashboardPage isGuest={false} userId={user.uid} />
          </Suspense>
        );
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
      <Toaster position="bottom-center" />
      {user ? (
        <MainApp user={user} />
      ) : (
        <Suspense fallback={<PageLoader message="Cargando..." />}>
          <LoginPage />
        </Suspense>
      )}
    </AppProvider>
  );
}