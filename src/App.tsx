import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { auth } from './config/firebase'; // Asegúrate que la ruta es correcta
import { useExpensesController } from './hooks/useExpensesController';
import { Layout } from './components/Layout/Layout';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
    // Estado para el ID del usuario
    const [userId, setUserId] = useState<string | null>(null);
    // Estado para saber si la autenticación inicial ya terminó
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    // Estado para manejar errores de autenticación
    const [authError, setAuthError] = useState<string | null>(null);

    // Conectamos el controlador de gastos
    const expensesController = useExpensesController(userId);

    // Este efecto se encarga de la autenticación al iniciar la app
    useEffect(() => {
        console.log("App.tsx: Iniciando efecto de autenticación...");

        const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
            console.log("App.tsx: onAuthStateChanged se disparó.");

            if (currentUser) {
                console.log(`App.tsx: Usuario encontrado. UID: ${currentUser.uid}`);
                setUserId(currentUser.uid);
                setIsAuthReady(true); // ¡Estamos listos para renderizar!
            } else {
                console.log("App.tsx: No se encontró usuario. Intentando inicio de sesión anónimo...");
                try {
                    await signInAnonymously(auth);
                    // Si el inicio de sesión es exitoso, onAuthStateChanged se volverá
                    // a ejecutar con el nuevo usuario, y entrará en el 'if' de arriba.
                    console.log("App.tsx: Inicio de sesión anónimo exitoso. Esperando al próximo estado...");
                } catch (error) {
                    console.error("App.tsx: ERROR CRÍTICO al iniciar sesión anónimamente.", error);
                    setAuthError("No se pudo conectar con el servicio de autenticación.");
                    setIsAuthReady(true); // Marcamos como listo para no dejar la app congelada.
                }
            }
        });

        // Limpiamos la suscripción al desmontar el componente
        return () => {
            console.log("App.tsx: Limpiando efecto de autenticación.");
            unsubscribe();
        };
    }, []); // El array vacío asegura que este efecto se ejecute solo una vez

    // --- Renderizado Condicional ---

    // 1. Si la autenticación aún no ha terminado, mostramos un mensaje de carga.
    if (!isAuthReady) {
        return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
                <p style={{fontSize: '1.25rem', fontWeight: '600'}}>Conectando...</p>
            </div>
        );
    }

    // 2. Si hubo un error grave de autenticación, lo mostramos.
    if (authError) {
        return (
             <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
                <p style={{fontSize: '1.25rem', fontWeight: '600', color: 'red'}}>{authError}</p>
            </div>
        )
    }

    // 3. Si todo está bien, renderizamos la aplicación.
    return (
        <Layout>
            <DashboardPage controller={expensesController} />
        </Layout>
    );
}
