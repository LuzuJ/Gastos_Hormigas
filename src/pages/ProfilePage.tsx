import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth/authService';
import { LoadingStateWrapper } from '../components/LoadingState/LoadingState';
import styles from './ProfilePage.module.css';
import { LogOut, Settings, TrendingUp, Wallet, Calendar, PiggyBank, User, CheckCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { PageContainer } from '../components/layout/PageContainer/PageContainer';
import { useProfileContext, useExpensesContext, useNetWorthContext, useSavingsGoalsContext } from '../contexts/AppContext';
import { CURRENCY_OPTIONS, formatCurrency } from '../utils/formatters';
import type { Page } from '../components/layout/Layout/Layout';
import { PAGE_ROUTES } from '../constants';
import { UserProfile } from '../types';

// Atoms
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { Input } from '../components/ui/Input/Input';
import { StatsCard } from '../components/ui/StatsCard/StatsCard';
import { PasswordInput } from '../components/ui/PasswordInput/PasswordInput'; // Keeping existing compound for now, or replace later

interface ProfilePageProps {
    userId?: string;
    isGuest: boolean;
    setCurrentPage: (page: Page) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ isGuest, setCurrentPage }) => {
    const { profile, updateUserProfile: updateProfile, loadingProfile: profileLoading, profileError } = useProfileContext();
    const { expenses } = useExpensesContext();
    const { netWorth } = useNetWorthContext();
    const { savingsGoals } = useSavingsGoalsContext();
    const { isDark, toggleTheme } = useTheme();

    const [displayName, setDisplayName] = useState('');
    const [currency, setCurrency] = useState<UserProfile['currency']>('USD');
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName || '');
            setCurrency(profile.currency || 'USD');
        }
    }, [profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setIsSaving(true);
        try {
            await updateProfile({ displayName, currency });
            setMessage('Perfil actualizado correctamente');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error al actualizar');
        } finally {
            setIsSaving(false);
        }
    };

    const getInitials = () => {
        if (!profile?.displayName) return 'U';
        return profile.displayName.charAt(0).toUpperCase();
    };

    // Stats
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const expenseCount = expenses.length;
    const totalSavingsGoals = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const currentSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const savingsProgress = totalSavingsGoals > 0 ? (currentSavings / totalSavingsGoals) * 100 : 0;

    if (isGuest) {
        return <GuestProfile setCurrentPage={setCurrentPage} />;
    }

    return (
        <PageContainer>
            <div className={styles.container}>
                <PageHeader
                    title="Mi Perfil"
                    subtitle="Gestiona tu cuenta y preferencias"
                    icon={<User size={24} />}
                    actions={
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={authService.signOut}
                            leftIcon={<LogOut size={16} />}
                        >
                            Cerrar Sesión
                        </Button>
                    }
                />

                <LoadingStateWrapper loading={profileLoading} error={profileError}>
                    {profile && (
                        <>
                            {/* Profile Header Card */}
                            <Card className={styles.profileHeaderCard} padding="lg">
                                <div className={styles.avatar}>
                                    {getInitials()}
                                </div>
                                <div className={styles.profileInfo}>
                                    <h2 className={styles.userName}>{profile.displayName || 'Usuario'}</h2>
                                    <span className={styles.userEmail}>{profile.email}</span>
                                    <span className={styles.memberSince}>
                                        <Calendar size={14} />
                                        Miembro activo
                                    </span>
                                </div>
                            </Card>

                            {/* Stats Grid */}
                            <div className={styles.statsGrid}>
                                <StatsCard
                                    label="Total Gastado"
                                    value={formatCurrency(totalExpenses)}
                                    icon={<TrendingUp size={16} />}
                                />
                                <StatsCard
                                    label="Patrimonio"
                                    value={formatCurrency(netWorth)}
                                    icon={<Wallet size={16} />}
                                    status={netWorth >= 0 ? 'success' : 'danger'}
                                />
                                <StatsCard
                                    label="Progreso Metas"
                                    value={`${savingsProgress.toFixed(0)}%`}
                                    icon={<PiggyBank size={16} />}
                                />
                                <StatsCard
                                    label="Transacciones"
                                    value={expenseCount.toString()}
                                    icon={<User size={16} />}
                                />
                            </div>

                            {/* Settings Form */}
                            <div className={styles.settingsSection}>
                                <div className={styles.sectionTitle}>
                                    <Settings size={20} />
                                    <span>Configuración</span>
                                </div>

                                <Card padding="lg" className={styles.themeCard}>
                                    <div className={styles.itemRow}>
                                        <div className={styles.itemInfo}>
                                            <span className={styles.itemLabel}>Apariencia</span>
                                            <span className={styles.itemSub}>
                                                {isDark ? 'Modo Oscuro' : 'Modo Claro'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={toggleTheme}
                                            className={`${styles.toggleBtn} ${isDark ? styles.active : ''}`}
                                        >
                                            <div className={styles.toggleThumb}>
                                                {isDark ? <Moon size={12} /> : <Sun size={12} />}
                                            </div>
                                        </button>
                                    </div>
                                </Card>

                                <Card padding="lg">
                                    <form onSubmit={handleSave} className={styles.settingsForm}>
                                        <Input
                                            label="Nombre de Usuario"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            required
                                        />

                                        {/* Create Custom Select if time permits, otherwise generic select styled */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Moneda</label>
                                            <select
                                                style={{
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-light)',
                                                    backgroundColor: 'var(--bg-card)',
                                                    color: 'var(--text-primary)'
                                                }}
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value as UserProfile['currency'])}
                                            >
                                                {CURRENCY_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className={styles.formActions}>
                                            <Button
                                                type="submit"
                                                isLoading={isSaving}
                                                leftIcon={message ? <CheckCircle size={16} /> : undefined}
                                                variant={message ? "outline" : "primary"} // Visual feedback
                                            >
                                                {message ? 'Guardado' : 'Guardar Cambios'}
                                            </Button>
                                            {message && <span className={styles.successMessage}>{message}</span>}
                                        </div>
                                    </form>
                                </Card>
                            </div>
                        </>
                    )}
                </LoadingStateWrapper>
            </div>
        </PageContainer>
    );
};

// Guest Profile Component
const GuestProfile: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
    // ... Simplified Guest Logic reusing Atoms
    return (
        <PageContainer>
            <div className={styles.guestContainer}>
                <div className={styles.guestContent}>
                    <h1>Modo Invitado</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Crea una cuenta para guardar tus datos y acceder a todas las funciones.
                    </p>
                    <Card padding="lg">
                        <Button
                            fullWidth
                            onClick={() => authService.signInWithGoogle()}
                            variant="outline"
                            style={{ marginBottom: '1rem' }}
                        >
                            Continuar con Google
                        </Button>
                        <div className={styles.divider}>O usa tu correo</div>
                        <Button fullWidth onClick={() => setCurrentPage('login' as Page)}>
                            Iniciar Sesión / Registrarse
                        </Button>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
};
