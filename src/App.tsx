import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { auth } from './config/firebase';
import { categoryService } from './services/categoryService';
import { Layout, type Page } from './components/Layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ManageCategoriesPage } from './pages/ManageCategoriesPage';
import { PlanningPage } from './pages/PlanningPage';
import './index.css';

export default function App() {
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
            if (currentUser) {
                const isNewUser = currentUser.metadata.creationTime === currentUser.metadata.lastSignInTime;
                
                if (isNewUser) {
                    setIsInitializing(true); // Empezamos a inicializar
                    await categoryService.initializeDefaultCategories(currentUser.uid);
                    setIsInitializing(false); // Terminamos de inicializar
                } else {
                    setIsInitializing(false); // No es usuario nuevo, no hay nada que inicializar
                }
                
                setUserId(currentUser.uid);
                setIsAuthReady(true);
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
        switch (currentPage) {
            case 'dashboard': return <DashboardPage userId={userId} />;
            case 'planning': return <PlanningPage userId={userId} />;
            case 'analysis': return <ManageCategoriesPage userId={userId} />; // Aquí se renderiza la página correcta
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
