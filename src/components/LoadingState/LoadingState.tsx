import React from 'react';
import styles from './LoadingState.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Cargando...' 
}) => {
  return (
    <div className={`${styles.loadingContainer} ${styles[size]}`}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingMessage}>{message}</p>
    </div>
  );
};

interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryButtonText?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onRetry, 
  onDismiss,
  retryButtonText = 'Reintentar'
}) => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>⚠️</div>
      <div className={styles.errorContent}>
        <p className={styles.errorMessage}>{error}</p>
        <div className={styles.errorActions}>
          {onRetry && (
            <button 
              className={styles.retryButton} 
              onClick={onRetry}
            >
              {retryButtonText}
            </button>
          )}
          {onDismiss && (
            <button 
              className={styles.dismissButton} 
              onClick={onDismiss}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface LoadingStateWrapperProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onDismissError?: () => void;
  loadingMessage?: string;
  retryButtonText?: string;
  children: React.ReactNode;
}

/**
 * Componente wrapper que maneja estados de loading y error de forma consistente
 */
export const LoadingStateWrapper: React.FC<LoadingStateWrapperProps> = ({
  loading,
  error,
  onRetry,
  onDismissError,
  loadingMessage,
  retryButtonText,
  children
}) => {
  if (loading) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  if (error) {
    return (
      <ErrorMessage 
        error={error} 
        onRetry={onRetry} 
        onDismiss={onDismissError}
        retryButtonText={retryButtonText}
      />
    );
  }

  return <>{children}</>;
};

// Re-exportar componentes de formulario
export { FormLoadingWrapper, SubmitButton } from './FormLoadingWrapper';
