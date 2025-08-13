import React, { useState, useEffect } from 'react';
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

            // La lógica de automatización solo debe correr si hay un usuario (sea anónimo o no)
            if (currentUser) {
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

    // SI HAY CUALQUIER TIPO DE USUARIO (real o invitado), muestra la app.
    if (user) {
        const isGuest = user.isAnonymous;
        const renderPage = () => {
            switch (currentPage) {
                // Pasamos el userId a todas las páginas
                case PAGE_ROUTES.DASHBOARD: return <DashboardPage userId={user.uid} />;
                case PAGE_ROUTES.REGISTRO: return <RegistroPage userId={user.uid} />;
                case PAGE_ROUTES.PLANNING: return <PlanningPage userId={user.uid} isGuest={isGuest} />;
                case PAGE_ROUTES.REPORTS: return <ReportsPage userId={user.uid} isGuest={isGuest} />; // <-- Ruta para reportes
                case PAGE_ROUTES.ANALYSIS: return <ManageCategoriesPage userId={user.uid} isGuest={isGuest} />; // <-- Ruta para gestionar categorías
                case PAGE_ROUTES.PROFILE: return <ProfilePage userId={user.uid} />;
                default: return <DashboardPage userId={user.uid} />;
            }
        };

        return (
            // Pasamos isGuest al Layout para mostrar botones diferentes
            <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} isGuest={isGuest}>
                {renderPage()}
            </Layout>
        );
    }

    return <LoginPage />;
}