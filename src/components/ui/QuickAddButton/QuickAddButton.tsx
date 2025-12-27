import React, { useState, useEffect } from 'react';
import { Plus, X, Download, PiggyBank, ArrowRightLeft, Receipt, Wallet } from 'lucide-react';
import styles from './QuickAddButton.module.css';

interface QuickAddButtonProps {
    onAddExpense: () => void;
    onAddIncome?: () => void;
    onAddGoal?: () => void;
    onNavigate?: (page: string) => void;
}

export const QuickAddButton: React.FC<QuickAddButtonProps> = ({
    onAddExpense,
    onAddIncome,
    onAddGoal,
    onNavigate
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [canInstall, setCanInstall] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // Detectar si la app ya está instalada
        const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isRunningFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
        const isRunningMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;

        setIsInstalled(isRunningStandalone || isRunningFullscreen || isRunningMinimalUI);

        // Escuchar evento de instalación
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setCanInstall(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setCanInstall(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleAddExpense = () => {
        onAddExpense();
        setIsOpen(false);
    };

    const handleAddIncome = () => {
        if (onAddIncome) {
            onAddIncome();
            setIsOpen(false);
        }
    };

    const handleAddGoal = () => {
        if (onAddGoal) {
            onAddGoal();
            setIsOpen(false);
        } else if (onNavigate) {
            onNavigate('patrimonio');
            setIsOpen(false);
        }
    };

    const handleGoToReports = () => {
        if (onNavigate) {
            onNavigate('reportes');
            setIsOpen(false);
        }
    };

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        try {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('✅ Usuario aceptó la instalación');
            }

            setDeferredPrompt(null);
            setCanInstall(false);
            setIsOpen(false);
        } catch (error) {
            console.error('Error al instalar PWA:', error);
        }
    };

    return (
        <div className={styles.container}>
            {/* Backdrop para cerrar al hacer click fuera */}
            {isOpen && <div className={styles.backdrop} onClick={() => setIsOpen(false)} />}

            {/* Opciones expandidas */}
            {isOpen && (
                <div className={styles.options}>
                    <button
                        className={`${styles.optionButton} ${styles.expense}`}
                        onClick={handleAddExpense}
                        title="Añadir Gasto"
                    >
                        <span className={styles.optionLabel}>Gasto</span>
                        <span className={styles.optionIcon}>💸</span>
                    </button>

                    <button
                        className={`${styles.optionButton} ${styles.income}`}
                        onClick={handleAddIncome}
                        title="Añadir Ingreso"
                    >
                        <span className={styles.optionLabel}>Ingreso</span>
                        <span className={styles.optionIcon}>💰</span>
                    </button>

                    <button
                        className={`${styles.optionButton} ${styles.goal}`}
                        onClick={handleAddGoal}
                        title="Nueva Meta de Ahorro"
                    >
                        <span className={styles.optionLabel}>Meta</span>
                        <PiggyBank size={18} className={styles.optionIconSvg} />
                    </button>

                    <button
                        className={`${styles.optionButton} ${styles.reports}`}
                        onClick={handleGoToReports}
                        title="Ver Reportes"
                    >
                        <span className={styles.optionLabel}>Reportes</span>
                        <Receipt size={18} className={styles.optionIconSvg} />
                    </button>

                    {/* Opción de instalar - solo visible si se puede instalar */}
                    {canInstall && !isInstalled && (
                        <button
                            className={`${styles.optionButton} ${styles.install}`}
                            onClick={handleInstall}
                            title="Instalar App"
                        >
                            <span className={styles.optionLabel}>Instalar</span>
                            <Download size={18} className={styles.optionIconSvg} />
                        </button>
                    )}
                </div>
            )}

            {/* Botón principal */}
            <button
                className={`${styles.mainButton} ${isOpen ? styles.open : ''}`}
                onClick={handleToggle}
                aria-label={isOpen ? 'Cerrar' : 'Añadir'}
            >
                {isOpen ? <X size={24} /> : <Plus size={24} />}
            </button>
        </div>
    );
};
