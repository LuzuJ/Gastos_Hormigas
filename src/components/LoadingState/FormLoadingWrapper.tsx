import React from 'react';
import { ErrorMessage } from './LoadingState';
import styles from './FormLoadingWrapper.module.css';

interface FormLoadingWrapperProps {
  children: React.ReactNode;
  isSubmitting?: boolean;
  submitError?: string | null;
  onDismissError?: () => void;
  submitButtonText?: string;
  submitButtonLoadingText?: string;
}

/**
 * Componente wrapper específico para formularios que maneja:
 * - Estados de envío (botón loading)
 * - Errores de validación/envío
 * - Prevención de envío múltiple
 */
export const FormLoadingWrapper: React.FC<FormLoadingWrapperProps> = ({
  children,
  isSubmitting = false,
  submitError,
  onDismissError,
  submitButtonText = 'Guardar',
  submitButtonLoadingText = 'Guardando...'
}) => {
  return (
    <div className={styles.formWrapper}>
      {children}
      
      {submitError && (
        <div className={styles.errorSection}>
          <ErrorMessage 
            error={submitError} 
            onDismiss={onDismissError} 
          />
        </div>
      )}
      
      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingText}>
            {submitButtonLoadingText}
          </div>
        </div>
      )}
    </div>
  );
};

interface SubmitButtonProps {
  isSubmitting: boolean;
  children: React.ReactNode;
  submitButtonLoadingText?: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

/**
 * Botón de envío que maneja automáticamente el estado de loading
 */
export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  children,
  submitButtonLoadingText = 'Guardando...',
  disabled = false,
  className = '',
  onClick,
  type = 'submit'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isSubmitting || disabled}
      className={`${styles.submitButton} ${className} ${isSubmitting ? styles.submitting : ''}`}
    >
      {isSubmitting ? (
        <>
          <div className={styles.spinner}></div>
          {submitButtonLoadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};
