import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from './config/firebase';
import { useExpensesController } from './hooks/useExpensesController';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';

// Placeholder para futuras páginas
const ReportsPage = () => <div className="text-center bg-white p-10 rounded-xl shadow-md">Contenido de Reportes... Próximamente</div>;
const AdvisorPage = () => <div className="text-center bg-white p-10 rounded-xl shadow-md">Consejos con IA... Próximamente</div>;


export default function App() {
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard'); // Estado para la navegación
    
    const expensesController = useExpensesController(userId);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUserId(currentUser.uid);
                // Pequeño truco para mostrar el ID en el footer
                const userIdElement = document.getElementById('userId');
                if(userIdElement) userIdElement.textContent = currentUser.uid;
            } else {
                await signInAnonymously(auth);
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage controller={expensesController} />;
            case 'reportes':
                return <ReportsPage />;
            case 'ia_advisor':
                return <AdvisorPage />;
            default:
                return <DashboardPage controller={expensesController} />;
        }
    };

    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-xl font-semibold text-gray-700">Iniciando tu Gestor Financiero...</p>
            </div>
        );
    }
    
    return (
        <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
            {renderCurrentPage()}
        </Layout>
    );
}
