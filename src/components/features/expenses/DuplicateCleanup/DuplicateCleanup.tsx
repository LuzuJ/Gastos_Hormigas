import React from 'react';
import { Check } from 'lucide-react';
import styles from './DuplicateCleanup.module.css';

// COMPONENTE DESHABILITADO - Servicio movido a legacy-firebase
// Con Supabase, las restricciones UNIQUE en la base de datos previenen duplicados automáticamente
// Ya no es necesario este componente de limpieza manual

interface DuplicateCleanupProps {
  userId: string | null;
  onCleanupComplete?: () => void;
}

export const DuplicateCleanup: React.FC<DuplicateCleanupProps> = () => {
  // Componente deshabilitado - Las restricciones de base de datos Supabase previenen duplicados
  return (
    <div className={styles.container}>
      <div className={styles.message}>
        <Check className={styles.successIcon} size={20} />
        <span>
          La prevención de duplicados está integrada en la base de datos. 
          No es necesaria limpieza manual.
        </span>
      </div>
    </div>
  );
};

export default DuplicateCleanup;
