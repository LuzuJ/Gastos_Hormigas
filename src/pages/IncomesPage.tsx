import React from 'react';
import { IncomeManager } from '../components/features/incomes/IncomeManager/IncomeManager';
import { useAuth } from '../contexts/AuthContext';
import styles from './IncomesPage.module.css';

export const IncomesPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Debes iniciar sesión para ver esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <IncomeManager userId={user.id} />
    </div>
  );
};
