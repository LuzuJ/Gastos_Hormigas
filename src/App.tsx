import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout, type Page } from './components/layout/Layout/Layout';
import { Toaster } from 'react-hot-toast';
import { PAGE_ROUTES } from './constants';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import {
  DashboardPage,
  ReportsPage,
  PlanningPage,
  RegistroPage,
  LoginPage,
  ProfilePage,
  ManageCategoriesPage,
  BudgetPage,
  IncomesPage,
  StatsPage,
  AuthCallbackPage,
  preloadRoutesFor
} from './routes/lazyRoutes';

// Componente que protege las rutas que requieren autenticación
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <LoadingSpinner size="large" />
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para la aplicación principal, se muestra cuando el usuario está logueado
const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(PAGE_ROUTES.DASHBOARD);
  const isGuest = user?.user_metadata?.is_guest === true;

  // Precargar rutas relacionadas cuando se carga una página
  useEffect(() => {
    preloadRoutesFor(currentPage);
  }, [currentPage]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case PAGE_ROUTES.DASHBOARD:
        return <DashboardPage isGuest={isGuest} userId={user.id} />;
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
      case PAGE_ROUTES.INCOMES:
        return <IncomesPage />;
      case PAGE_ROUTES.STATS:
        return <StatsPage isGuest={isGuest} />;
      case PAGE_ROUTES.PROFILE:
        return <ProfilePage userId={user.id} isGuest={isGuest} setCurrentPage={setCurrentPage} />;
      default:
        return <DashboardPage isGuest={false} userId={user.id} />;
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
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Toaster position="bottom-center" />

          <Routes>
            {/* Ruta de callback para OAuth */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Rutas de autenticación */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />

            {/* Rutas protegidas */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            } />

            {/* Redirección para rutas no definidas */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}