import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { auth } from './config/firebase';
import { Layout } from './components/Layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ManageCategoriesPage } from './pages/ManageCategoriesPage';
import { PlanningPage } from './pages/PlanningPage';
import './index.css';
import { categoryService } from './services/categoryService';

// Define un tipo para las páginas para mayor seguridad
export type Page = 'dashboard' | 'categories' | 'planning';

export default function App() {
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
            if (currentUser) {
                // Si es un nuevo usuario, su metadata de creación será igual a la de último inicio de sesión
                const isNewUser = currentUser.metadata.creationTime === currentUser.metadata.lastSignInTime;
                if (isNewUser) {
                    // Si es nuevo, creamos sus categorías por defecto
                    await categoryService.initializeDefaultCategories(currentUser.uid);
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
                }
            }
        });
        return () => unsubscribe();
    }, []);

    if (!isAuthReady) return <div className="loading-screen">Conectando...</div>;
    if (authError) return <div className="loading-screen error">{authError}</div>;
    
    return (
        <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
            {currentPage === 'dashboard' && <DashboardPage userId={userId} />}
            {currentPage === 'categories' && <ManageCategoriesPage userId={userId} />}
            {currentPage === 'planning' && <PlanningPage userId={userId} />}
        </Layout>
    );
}
