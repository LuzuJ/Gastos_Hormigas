import React from 'react';
import styles from './FinancialDashboard.module.css';

// DESHABILITADO: useFinancialAutomation fue movido a legacy-firebase

interface FinancialDashboardProps {
  userId: string | null;
  className?: string;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ 
  userId, 
  className = '' 
}) => {
  // COMPONENTE DESHABILITADO - El servicio de automatización financiera fue movido a legacy-firebase
  // TODO: Reimplementar con Supabase cuando se necesite
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.disabledMessage}>
        <h3>⚠️ Funcionalidad No Disponible</h3>
        <p>El panel de automatización financiera está temporalmente deshabilitado.</p>
        <p>Será reimplementado con Supabase en futuras versiones.</p>
      </div>
    </div>
  );
};

export default FinancialDashboard;
