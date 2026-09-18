
import React, { useState, useEffect } from 'react';
import { X, HandCoins, TrendingUp, Target } from 'lucide-react';

export const WelcomeGuide = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has seen welcome guide
        const hasSeen = localStorage.getItem('hasSeenWelcomeGuide_v1');
        if (!hasSeen) {
            // Delay slightly for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('hasSeenWelcomeGuide_v1', 'true');
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            zIndex: 9999,
            maxWidth: '320px',
            animation: 'slideUp 0.5s ease-out'
        }}>
            <button
                onClick={handleClose}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                }}
            >
                <X size={18} />
            </button>

            <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.1rem' }}>👋 ¡Hola! Bienvenido</h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Para empezar a tomar el control, te sugerimos 3 pasos rápidos:
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '6px', borderRadius: '8px', color: '#3b82f6' }}>
                        <HandCoins size={16} />
                    </div>
                    <span>Registra tu primer <strong>Gasto</strong> con el botón "+".</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '6px', borderRadius: '8px', color: '#10b981' }}>
                        <TrendingUp size={16} />
                    </div>
                    <span>Configura tus <strong>Activos</strong> en Planificación.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '6px', borderRadius: '8px', color: '#f59e0b' }}>
                        <Target size={16} />
                    </div>
                    <span>Define una <strong>Meta de Ahorro</strong>.</span>
                </li>
            </ul>

            <button
                onClick={handleClose}
                style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '10px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                }}
            >
                ¡Entendido!
            </button>
        </div>
    );
};
