import React from 'react';
import styles from './RecurringIncomeManager.module.css';

// COMPONENTE DESHABILITADO - El servicio de automatización financiera fue movido a legacy-firebase
// TODO: Reimplementar con Supabase cuando se necesite

interface RecurringIncomeManagerProps {
  userId: string | null;
  paymentSources: { id: string; name: string; type: string }[];
  className?: string;
}

export const RecurringIncomeManager: React.FC<RecurringIncomeManagerProps> = ({
  userId,
  paymentSources,
  className = ''
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.disabledMessage}>
        <h3>⚠️ Funcionalidad No Disponible</h3>
        <p>El módulo de ingresos recurrentes está temporalmente deshabilitado.</p>
        <p>Será reimplementado con Supabase en futuras versiones.</p>
      </div>
    </div>
  );
};

export default RecurringIncomeManager;
