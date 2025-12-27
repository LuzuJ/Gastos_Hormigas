import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth/authService';
import { LoadingStateWrapper } from '../components/LoadingState/LoadingState';
import { ExportManager } from '../components/features/reports/ExportManager/ExportManager';
import { PasswordInput } from '../components/ui/PasswordInput/PasswordInput';
import styles from './ProfilePage.module.css';
import { LogOut, UserPlus, Settings, TrendingUp, Wallet, Calendar, DollarSign, PiggyBank } from 'lucide-react';
import { useProfileContext, useExpensesContext, useNetWorthContext, useSavingsGoalsContext } from '../contexts/AppContext';
import { CURRENCY_OPTIONS, formatCurrency } from '../utils/formatters';
import type { Page } from '../components/layout/Layout/Layout';
import type { UserProfile } from '../types';
import { PAGE_ROUTES } from '../constants';

interface ProfilePageProps {
    userId: string | null;
    isGuest: boolean;
    setCurrentPage: (page: Page) => void;
}

// Componente para el perfil de un usuario REGISTRADO
const RegisteredUserProfile: React.FC = () => {
    const {
        profile,
        updateUserProfile,
        loadingProfile,
        profileError,
        clearProfileError
    } = useProfileContext();

    // Datos financieros para estadísticas
    const { expenses } = useExpensesContext();

    const { assets, liabilities } = useNetWorthContext();
    const { savingsGoals } = useSavingsGoalsContext();

    const [displayName, setDisplayName] = useState('');
    const [currency, setCurrency] = useState<UserProfile['currency']>('USD');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName);
            setCurrency(profile.currency);
        }
    }, [profile?.displayName, profile?.currency]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        const result = await updateUserProfile({ displayName, currency });

        if (result?.success) {
            setMessage('¡Perfil guardado con éxito!');
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage(result?.error || 'Error al guardar. Inténtalo de nuevo.');
        }
    };

    // Calcular estadísticas
    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const totalAssets = assets.reduce((acc, asset) => acc + asset.value, 0);
    const totalLiabilities = liabilities.reduce((acc, liability) => acc + liability.amount, 0);
    const netWorth = totalAssets - totalLiabilities;
    const expenseCount = expenses.length;
    const savingsProgress = savingsGoals.length > 0
        ? savingsGoals.reduce((acc, goal) => acc + goal.currentAmount, 0) /
        savingsGoals.reduce((acc, goal) => acc + goal.targetAmount, 0) * 100
        : 0;

    // Obtener iniciales del usuario
    const getInitials = () => {
        if (!profile?.displayName) return '?';
        const parts = profile.displayName.split(' ');
        return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
    };

    // Fecha de creación aproximada (primer gasto)
    const memberSince = expenses.length > 0 && expenses[expenses.length - 1].createdAt
        ? new Date(expenses[expenses.length - 1].createdAt as string).toLocaleDateString('es-MX', {
            month: 'long',
            year: 'numeric'
        })
        : 'Hoy';

    return (
        <LoadingStateWrapper
            loading={loadingProfile}
            error={profileError}
            onDismissError={clearProfileError}
            loadingMessage="Cargando perfil..."
        >
            <>
                <div className={styles.header}>
                    <h2 className="section-title">Mi Perfil</h2>
                    <button
                        onClick={async () => {
                            try {
                                await authService.signOut();
                            } catch (error) {
                                console.log('Sesión cerrada exitosamente');
                            }
                        }}
                        className={styles.logoutButton}
                    >
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>

                {!profile ? (
                    <div className={styles.errorContainer}>
                        <p>Error al cargar el perfil. Intenta cerrar sesión y volver a iniciar.</p>
                        <button onClick={() => authService.signOut()} className={styles.logoutButton}>
                            <LogOut size={16} /> Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <div className={styles.profileContent}>
                        {/* Card de Perfil con Avatar */}
                        <div className={styles.profileCard}>
                            <div className={styles.avatar}>
                                {getInitials()}
                            </div>
                            <div className={styles.profileInfo}>
                                <h3 className={styles.userName}>{profile.displayName}</h3>
                                <span className={styles.userEmail}>{profile.email}</span>
                                <span className={styles.memberSince}>
                                    <Calendar size={12} /> Miembro desde {memberSince}
                                </span>
                            </div>
                        </div>

                        {/* Grid de Estadísticas */}
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                    <TrendingUp size={20} />
                                </div>
                                <div className={styles.statContent}>
                                    <span className={styles.statValue}>{formatCurrency(totalExpenses)}</span>
                                    <span className={styles.statLabel}>Total Gastado</span>
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                    <DollarSign size={20} />
                                </div>
                                <div className={styles.statContent}>
                                    <span className={styles.statValue}>{expenseCount}</span>
                                    <span className={styles.statLabel}>Transacciones</span>
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                    <Wallet size={20} />
                                </div>
                                <div className={styles.statContent}>
                                    <span className={`${styles.statValue} ${netWorth >= 0 ? styles.positive : styles.negative}`}>
                                        {formatCurrency(netWorth)}
                                    </span>
                                    <span className={styles.statLabel}>Patrimonio Neto</span>
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                                    <PiggyBank size={20} />
                                </div>
                                <div className={styles.statContent}>
                                    <span className={styles.statValue}>{savingsProgress.toFixed(0)}%</span>
                                    <span className={styles.statLabel}>Ahorro Promedio</span>
                                </div>
                            </div>
                        </div>

                        {/* Formulario de Preferencias */}
                        <div className={styles.settingsCard}>
                            <div className={styles.settingsHeader}>
                                <Settings size={18} />
                                <h4>Preferencias</h4>
                            </div>
                            <form onSubmit={handleSave} className={styles.form}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="displayName">Nombre</label>
                                        <input
                                            id="displayName"
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="currency">Moneda</label>
                                        <select
                                            id="currency"
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value as UserProfile['currency'])}
                                            className={styles.select}
                                        >
                                            {CURRENCY_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    <button type="submit" className={styles.button}>Guardar Cambios</button>
                                    {message && <span className={styles.savedMessage}>{message}</span>}
                                </div>
                            </form>
                        </div>

                        {/* Sección de Exportación */}
                        <div className={styles.exportSection}>
                            <ExportManager />
                        </div>
                    </div>
                )}
            </>
        </LoadingStateWrapper>
    );
};

// Componente MEJORADO para el perfil de un usuario INVITADO
const GuestProfile: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const getFriendlyErrorMessage = (errorCode: string): string => {
        return "Error";
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        setError('');
        const result = await authService.signInWithGoogle();
        if (!result.success) {
            setError(getFriendlyErrorMessage(result.error as string));
            setLoading(false);
        } else {
            setCurrentPage(PAGE_ROUTES.DASHBOARD);
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!isPasswordValid) {
            setError('Por favor, ingresa una contraseña que cumpla con los requisitos de seguridad.');
            setLoading(false);
            return;
        }

        const result = await authService.signUpWithEmail(email, password);
        if (!result.success) {
            setError(getFriendlyErrorMessage(result.error as string));
            setLoading(false);
        } else {
            setCurrentPage(PAGE_ROUTES.DASHBOARD);
        }
    };

    return (
        <>
            <div className={styles.header}>
                <h2 className="section-title">Crear Cuenta</h2>
                <button onClick={() => authService.signOut()} className={styles.logoutButton}>
                    <LogOut size={16} /> Salir del modo invitado
                </button>
            </div>
            <div className={`${styles.form} ${styles.guestForm}`}>
                <UserPlus size={48} className={styles.guestIcon} />
                <h3>Guarda tu Progreso</h3>
                <p>Crea una cuenta gratuita para guardar todos tus gastos y planificación financiera. ¡Tu información actual se conservará automáticamente!</p>

                <form onSubmit={handleEmailSignUp} className={styles.guestActions}>
                    <input className={styles.input} type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} required />
                    <PasswordInput
                        value={password}
                        onChange={setPassword}
                        placeholder="Crea una contraseña"
                        showValidation={true}
                        required
                        className={styles.input}
                        autoComplete="new-password"
                        onValidationChange={setIsPasswordValid}
                    />
                    {error && <p className={styles.error}>{error}</p>}
                    <button
                        type="submit"
                        className={styles.button}
                        disabled={loading || !isPasswordValid}
                    >
                        {loading ? 'Creando...' : 'Crear cuenta con correo'}
                    </button>
                </form>

                <div className={styles.divider}>o</div>
                <button onClick={handleGoogleSignUp} className={styles.googleButton} disabled={loading}>
                    Continuar con Google
                </button>
            </div>
        </>
    );
};

// Componente principal
export const ProfilePage: React.FC<ProfilePageProps> = ({ isGuest, setCurrentPage }) => {
    return (
        <div className={styles.container}>
            {isGuest
                ? <GuestProfile setCurrentPage={setCurrentPage} />
                : <RegisteredUserProfile />
            }
        </div>
    );
};
