import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { authService } from '../services/authService';
import { LoadingStateWrapper } from '../components/LoadingState/LoadingState';
import { ExportManager } from '../components/ExportManager';
import styles from './ProfilePage.module.css';
import { LogOut, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useProfileContext } from '../contexts/AppContext';
import type { Page } from '../components/Layout/Layout';
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
    const [displayName, setDisplayName] = useState('');
    const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName);
            setCurrency(profile.currency);
        }
    }, [profile]);

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
                                // Error ya manejado en authService, no necesitamos hacer nada
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
                    <form onSubmit={handleSave} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Correo Electrónico</label>
                            <input id="email" type="email" value={profile.email} disabled className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="displayName">Nombre a Mostrar</label>
                            <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={styles.input}/>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="currency">Moneda Principal</label>
                            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as 'USD' | 'EUR')} className={styles.select}>
                                <option value="USD">Dólar Estadounidense (USD)</option>
                                <option value="EUR">Euro (EUR)</option>
                            </select>
                        </div>
                        <div className={styles.actions}>
                            <button type="submit" className={styles.button}>Guardar Cambios</button>
                            {message && <span className={styles.savedMessage}>{message}</span>}
                        </div>
                    </form>
                )}

                {/* Sección de Exportación para usuarios registrados */}
                {profile && (
                    <div className={styles.exportSection}>
                        <ExportManager />
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
    const [showPassword, setShowPassword] = useState(false);

    const getFriendlyErrorMessage = (errorCode: string): string => {
        // ... (misma función de LoginPage)
        return "Error";
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        setError('');
        const result = await authService.signInWithGoogle(auth.currentUser);
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
        const result = await authService.signUpWithEmail(email, password, auth.currentUser);
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
                    <div className={styles.passwordWrapper}>
                        <input className={styles.input} type={showPassword ? 'text' : 'password'} placeholder="Crea una contraseña" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.passwordToggleInForm}>
                            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.button} disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta con correo'}</button>
                </form>

                <div className={styles.divider}>o</div>
                <button onClick={handleGoogleSignUp} className={styles.googleButton} disabled={loading}>
                    Continuar con Google
                </button>
            </div>
        </>
    );
};

// Componente principal que decide cuál de los dos anteriores renderizar
export const ProfilePage: React.FC<ProfilePageProps> = ({ isGuest, setCurrentPage, userId }) => {
    return (
        <div className={styles.container}>
            {isGuest 
                ? <GuestProfile setCurrentPage={setCurrentPage} /> 
                : <RegisteredUserProfile />
            }
        </div>
    );
};
