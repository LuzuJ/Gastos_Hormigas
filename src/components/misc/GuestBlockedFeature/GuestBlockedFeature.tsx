import React from 'react';
import { Lock } from 'lucide-react';
import styles from './GuestBlockedFeature.module.css';

interface GuestBlockedFeatureProps {
  message: string;
}

export const GuestBlockedFeature: React.FC<GuestBlockedFeatureProps> = ({ message }) => {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <Lock size={24} />
      </div>
      <div className={styles.textWrapper}>
        <h4>Función para usuarios registrados</h4>
        <p>{message}</p>
      </div>
    </div>
  );
};