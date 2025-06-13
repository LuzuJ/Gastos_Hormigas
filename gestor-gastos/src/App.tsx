import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { auth } from './config/firebase';
import { useExpensesController } from './hooks/useExpensesController';
import { Layout } from './components/Layout/Layout';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    
    const expensesController = useExpensesController(userId);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
            if (currentUser) {
                setUserId(currentUser.uid);
            } else {
                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error("Error al iniciar sesión anónimamente:", error);
                }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    if (!isAuthReady) {
        return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
                <p style={{fontSize: '1.25rem', fontWeight: '600'}}>Iniciando...</p>
            </div>
        );
    }
    
    return (
        <Layout>
            <DashboardPage controller={expensesController} />
        </Layout>
    );
}
