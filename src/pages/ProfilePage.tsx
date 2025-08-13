import React, { useState, useEffect } from 'react';
import { useExpensesController } from '../hooks/useExpensesController';
import { authService } from '../services/authService'; // Importa el servicio de auth
import styles from './ProfilePage.module.css';
import { LogOut } from 'lucide-react'; // Importa el ícono

export const ProfilePage: React.FC<{ userId: string | null }> = ({ userId }) => {
    const { profile, updateUserProfile } = useExpensesController(userId);
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
        try {
            await updateUserProfile({ displayName, currency });
            setMessage('¡Perfil guardado con éxito!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error al guardar el perfil:", error);
            setMessage('Error al guardar. Verifica los permisos en Firebase.');
        }
    };

    if (!profile) {
        return <div className="loading-screen">Cargando perfil...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className="section-title">Mi Perfil</h2>
                <button onClick={() => authService.signOut()} className={styles.logoutButton}>
                    <LogOut size={16} /> Cerrar Sesión
                </button>
            </div>
            <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Correo Electrónico</label>
                    <input id="email" type="email" value={profile.email} disabled className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="displayName">Nombre a Mostrar</label>
                    <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="currency">Moneda Principal</label>
                    <select
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as 'USD' | 'EUR')}
                        className={styles.select}
                    >
                        <option value="USD">Dólar Estadounidense (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                    </select>
                </div>
                <div className={styles.actions}>
                    <button type="submit" className={styles.button}>Guardar Cambios</button>
                    {message && <span className={styles.savedMessage}>{message}</span>}
                </div>
            </form>
        </div>
    );
};