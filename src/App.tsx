import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { auth } from './config/firebase';
import { categoryService } from './services/categoryService';
import { Layout, type Page } from './components/Layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ManageCategoriesPage } from './pages/ManageCategoriesPage';
import { PlanningPage } from './pages/PlanningPage';
import { RegistroPage } from './pages/RegistroPage'
import { automationService } from './services/automationService'; 
import './index.css';
import { PAGE_ROUTES } from './constants'; // 1. Importamos las constantes

export default function App() {
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>(PAGE_ROUTES.DASHBOARD); // 2. Usamos la constante

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
            if (currentUser) {
                const isNewUser = currentUser.metadata.creationTime === currentUser.metadata.lastSignInTime;
                
                if (isNewUser) {
                    setIsInitializing(true);
                    await categoryService.initializeDefaultCategories(currentUser.uid);
                    setIsInitializing(false);
                } else {
                    setIsInitializing(false);
                }
                
                setUserId(currentUser.uid);
                setIsAuthReady(true);

                await automationService.checkAndPostFixedExpenses(currentUser.uid);
            } else {
                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error("Error de autenticación anónima:", error);
                    setAuthError("No se pudo conectar con el servicio de autenticación.");
                    setIsAuthReady(true);
                    setIsInitializing(false);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const renderPage = () => {
        // 3. Usamos las constantes en el switch
        switch (currentPage) {
            case PAGE_ROUTES.DASHBOARD: return <DashboardPage userId={userId} />;
            case PAGE_ROUTES.REGISTRO: return <RegistroPage userId={userId} />;
            case PAGE_ROUTES.PLANNING: return <PlanningPage userId={userId} />;
            case PAGE_ROUTES.ANALYSIS: return <ManageCategoriesPage userId={userId} />;
            default: return <DashboardPage userId={userId} />;
        }
    };

    if (!isAuthReady || isInitializing) {
        return <div className="loading-screen">Preparando tu espacio...</div>;
    }
    if (authError) return <div className="loading-screen error">{authError}</div>;
    
    return (
        <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
            {renderPage()}
        </Layout>
    );
}