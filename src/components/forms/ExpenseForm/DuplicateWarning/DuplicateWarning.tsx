import React from 'react';
import { AlertTriangle, Clock, DollarSign, Tag, X } from 'lucide-react';
import styles from './DuplicateWarning.module.css';
import type { Expense } from '../../../../types';

interface DuplicateExpense {
  expense: Expense;
  similarity: number;
  daysDifference: number;
}

interface DuplicateWarningProps {
  isVisible: boolean;
  confidence: 'low' | 'medium' | 'high';
  message: string;
  duplicates: DuplicateExpense[];
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}

export const DuplicateWarning: React.FC<DuplicateWarningProps> = ({
  isVisible,
  confidence,
  message,
  duplicates,
  onConfirm,
  onCancel,
  onClose
}) => {
  if (!isVisible) return null;

  const getSimilarityColor = (similarity: number): string => {
    if (similarity > 0.9) return 'var(--danger-color)';
    if (similarity > 0.7) return 'var(--warning-color)';
    return 'var(--info-color)';
  };

  const getConfidenceConfig = () => {
    switch (confidence) {
      case 'high':
        return {
          icon: '🚨',
          color: 'var(--danger-color)',
          bgColor: 'var(--danger-color-light)',
          borderColor: 'var(--danger-color)'
        };
      case 'medium':
        return {
          icon: '⚠️',
          color: 'var(--warning-color)',
          bgColor: 'var(--warning-color-light)',
          borderColor: 'var(--warning-color)'
        };
      default:
        return {
          icon: '💡',
          color: 'var(--info-color)',
          bgColor: 'var(--info-color-light)',
          borderColor: 'var(--info-color)'
        };
    }
  };

  const config = getConfidenceConfig();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Fecha desconocida';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header} style={{ borderLeftColor: config.borderColor }}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon} style={{ color: config.color }}>
              <AlertTriangle size={24} />
            </div>
            <div className={styles.headerText}>
              <h3 className={styles.title}>
                {config.icon} Posible Gasto Duplicado
              </h3>
              <p className={styles.subtitle}>{message}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={styles.closeButton}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.duplicatesList}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>
                🔍
              </span>
              {' '}
              Gastos similares encontrados:
            </h4>
            
            {duplicates.slice(0, 3).map((duplicate, index) => (
              <div key={duplicate.expense.id} className={styles.duplicateItem}>
                <div className={styles.duplicateHeader}>
                  <div className={styles.duplicateInfo}>
                    <span className={styles.duplicateDescription}>
                      {duplicate.expense.description}
                    </span>
                    <div className={styles.duplicateMeta}>
                      <span className={styles.metaItem}>
                        <DollarSign size={14} />
                        {formatCurrency(duplicate.expense.amount)}
                      </span>
                      <span className={styles.metaItem}>
                        <Clock size={14} />
                        {formatDate(duplicate.expense.createdAt)}
                      </span>
                      {duplicate.expense.subCategory && (
                        <span className={styles.metaItem}>
                          <Tag size={14} />
                          {duplicate.expense.subCategory}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.similarityBadge}>
                    <span className={styles.similarityLabel}>Similitud</span>
                    <span 
                      className={styles.similarityValue}
                      style={{ 
                        backgroundColor: getSimilarityColor(duplicate.similarity)
                      }}
                    >
                      {Math.round(duplicate.similarity * 100)}%
                    </span>
                  </div>
                </div>
                
                <div className={styles.duplicateDetails}>
                  <span className={styles.timeInfo}>
                    Registrado hace {duplicate.daysDifference} {duplicate.daysDifference === 1 ? 'día' : 'días'}
                  </span>
                </div>
              </div>
            ))}

            {duplicates.length > 3 && (
              <div className={styles.moreItems}>
                <span>Y {duplicates.length - 3} gastos similares más...</span>
              </div>
            )}
          </div>

          <div className={styles.advice}>
            <div className={styles.adviceIcon}>💡</div>
            <div className={styles.adviceText}>
              <strong>Consejo:</strong> Revisa si este gasto ya fue registrado anteriormente. 
              Los gastos duplicados pueden afectar la precisión de tus reportes financieros.
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={onCancel}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            <X size={16} />
            Cancelar Registro
          </button>
          <button 
            onClick={onConfirm}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            ✅ Registrar de Todas Formas
          </button>
        </div>
      </div>
    </div>
  );
};
