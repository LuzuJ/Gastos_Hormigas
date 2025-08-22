import React, { useState } from 'react';
import { Button } from '../../../common';
import { duplicateCleanupService } from '../../../../services/expenses/duplicateCleanupService';
import { Trash2, AlertTriangle, Check } from 'lucide-react';
import styles from './DuplicateCleanup.module.css';

interface DuplicateCleanupProps {
  userId: string | null;
  onCleanupComplete?: () => void;
}

export const DuplicateCleanup: React.FC<DuplicateCleanupProps> = ({
  userId,
  onCleanupComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [cleanupResult, setCleanupResult] = useState<{ removed: number; success: boolean } | null>(null);

  const analyzeDuplicates = async () => {
    if (!userId) return;

    setIsAnalyzing(true);
    try {
      const result = await duplicateCleanupService.listDuplicatePaymentSources(userId);
      if (result.success) {
        setDuplicates(result.duplicates);
      }
    } catch (error) {
      console.error('Error analyzing duplicates:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const cleanupDuplicates = async () => {
    if (!userId) return;

    setIsCleaning(true);
    try {
      const result = await duplicateCleanupService.removeDuplicatePaymentSources(userId);
      setCleanupResult(result);
      
      if (result.success && onCleanupComplete) {
        onCleanupComplete();
      }
      
      // Limpiar la lista de duplicados después de la limpieza
      setDuplicates([]);
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
    } finally {
      setIsCleaning(false);
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Trash2 size={20} />
          Limpiar Duplicados
        </h3>
        <p className={styles.description}>
          Detecta y elimina fuentes de pago duplicadas para mantener tu lista organizada.
        </p>
      </div>

      <div className={styles.actions}>
        <Button
          variant="outline"
          size="small"
          onClick={analyzeDuplicates}
          disabled={isAnalyzing || isCleaning}
          icon={AlertTriangle}
        >
          {isAnalyzing ? 'Analizando...' : 'Analizar Duplicados'}
        </Button>

        {duplicates.length > 0 && (
          <Button
            variant="danger"
            size="small"
            onClick={cleanupDuplicates}
            disabled={isCleaning}
            icon={Trash2}
          >
            {isCleaning ? 'Limpiando...' : `Eliminar ${duplicates.reduce((acc, d) => acc + (d.count - 1), 0)} Duplicados`}
          </Button>
        )}
      </div>

      {duplicates.length > 0 && (
        <div className={styles.duplicatesList}>
          <h4 className={styles.listTitle}>
            Duplicados encontrados ({duplicates.length} grupos):
          </h4>
          {duplicates.map((duplicate) => (
            <div key={`${duplicate.name}-${duplicate.type}`} className={styles.duplicateItem}>
              <div className={styles.duplicateInfo}>
                <span className={styles.duplicateName}>
                  {duplicate.sources[0].icon} {duplicate.name}
                </span>
                <span className={styles.duplicateType}>
                  {duplicate.type}
                </span>
                <span className={styles.duplicateCount}>
                  {duplicate.count} copias
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {duplicates.length === 0 && !isAnalyzing && cleanupResult === null && (
        <div className={styles.noResults}>
          <p>Haz clic en "Analizar Duplicados" para buscar fuentes de pago duplicadas.</p>
        </div>
      )}

      {duplicates.length === 0 && !isAnalyzing && cleanupResult === null && (
        <div className={styles.message}>
          <Check className={styles.successIcon} size={20} />
          <span>No se encontraron duplicados. Tu lista está limpia.</span>
        </div>
      )}

      {cleanupResult && (
        <div className={`${styles.result} ${cleanupResult.success ? styles.success : styles.error}`}>
          {cleanupResult.success ? (
            <div className={styles.successResult}>
              <Check size={20} />
              <span>
                ¡Limpieza completada! Se eliminaron {cleanupResult.removed} fuentes duplicadas.
              </span>
            </div>
          ) : (
            <div className={styles.errorResult}>
              <AlertTriangle size={20} />
              <span>Error durante la limpieza. Inténtalo de nuevo.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DuplicateCleanup;
