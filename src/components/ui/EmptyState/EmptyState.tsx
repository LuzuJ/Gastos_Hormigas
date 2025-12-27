import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    variant?: 'default' | 'compact';
}

/**
 * Componente para mostrar estados vacíos de forma amigable
 * Mejora la experiencia cuando no hay datos para mostrar
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📭',
    title,
    description,
    action,
    variant = 'default'
}) => {
    return (
        <div className={`${styles.container} ${styles[variant]}`}>
            <div className={styles.iconWrapper}>
                <span className={styles.icon}>{icon}</span>
            </div>
            <h3 className={styles.title}>{title}</h3>
            {description && <p className={styles.description}>{description}</p>}
            {action && (
                <button className={styles.actionButton} onClick={action.onClick}>
                    {action.label}
                </button>
            )}
        </div>
    );
};

// Presets comunes para estados vacíos
export const EmptyStatePresets = {
    noExpenses: {
        icon: '💸',
        title: '¡Sin gastos registrados!',
        description: 'Empieza a registrar tus gastos para tener un mejor control de tus finanzas.'
    },
    noIncomes: {
        icon: '💰',
        title: 'No hay ingresos',
        description: 'Agrega tus fuentes de ingreso para calcular tu disponibilidad.'
    },
    noBudgets: {
        icon: '🎯',
        title: 'Sin presupuestos definidos',
        description: 'Crea presupuestos por categoría para controlar mejor tus gastos.'
    },
    noSavingsGoals: {
        icon: '🎁',
        title: '¡Aún no tienes metas!',
        description: 'Define metas de ahorro para alcanzar tus objetivos financieros.'
    },
    noCategories: {
        icon: '📂',
        title: 'Sin categorías',
        description: 'Las categorías te ayudan a organizar tus gastos.'
    },
    noReports: {
        icon: '📊',
        title: 'Sin datos para mostrar',
        description: 'Registra algunos gastos para ver tus reportes aquí.'
    }
};
