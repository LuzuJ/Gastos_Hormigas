import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './config/firebase';
import { categoryService } from './services/categoryService';
import { Layout, type Page } from './components/Layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { PlanningPage } from './pages/PlanningPage';
import { RegistroPage } from './pages/RegistroPage';
import { automationService } from './services/automationService';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { ManageCategoriesPage } from './pages/ManageCategoriesPage';
import { AppProvider } from './contexts/AppContext'; // 1. Importa el nuevo AppProvider
import './index.css';
import { PAGE_ROUTES } from './constants';

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<Page>(PAGE_ROUTES.DASHBOARD);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setIsAuthReady(true);

            // La lógica de automatización se puede quedar aquí
            if (currentUser) {
                // Esta lógica se ejecuta una vez por sesión, lo cual es correcto.
                // No depende del estado de React, por lo que puede permanecer aquí.
                categoryService.onCategoriesUpdate(currentUser.uid, async (categories) => {
                    if (categories && categories.length > 0) {
                        await automationService.checkAndPostFixedExpenses(currentUser.uid, categories);
                    }
                });
            }
        });
        return () => unsubscribe();
    }, []);

    if (!isAuthReady) {
        return <div className="loading-screen">Cargando...</div>;
    }

    if (user) {
        const isGuest = user.isAnonymous;
        const renderPage = () => {
            switch (currentPage) {
                // Pasamos `isGuest` a todas las páginas que lo necesitan
                case PAGE_ROUTES.DASHBOARD: return <DashboardPage userId={user.uid} isGuest={isGuest} />;
                case PAGE_ROUTES.REGISTRO: return <RegistroPage userId={user.uid} />;
                case PAGE_ROUTES.PLANNING: return <PlanningPage userId={user.uid} isGuest={isGuest} />;
                case PAGE_ROUTES.REPORTS: return <ReportsPage userId={user.uid} isGuest={isGuest} />;
                case PAGE_ROUTES.ANALYSIS: return <ManageCategoriesPage userId={user.uid} isGuest={isGuest} />;
                case PAGE_ROUTES.PROFILE: return <ProfilePage userId={user.uid} />;
                default: return <DashboardPage userId={user.uid} isGuest={isGuest}/>;
            }
        };

        return (
            // 2. Envuelve toda la aplicación con AppProvider
            <AppProvider userId={user.uid}>
                <Toaster position="bottom-center" /> 
                <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} isGuest={isGuest}>
                    {renderPage()}
                </Layout>
            </AppProvider>
        );
    }

    return <LoginPage />;
}