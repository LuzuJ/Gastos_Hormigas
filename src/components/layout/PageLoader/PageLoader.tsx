import React from 'react';
import { LoadingSpinner } from '../../LoadingState/LoadingState';

interface PageLoaderProps {
  message?: string;
}

/**
 * Componente de loading específico para páginas lazy-loaded
 */
export const PageLoader: React.FC<PageLoaderProps> = ({ message = "Cargando página..." }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '400px',
      width: '100%'
    }}>
      <LoadingSpinner size="large" message={message} />
    </div>
  );
};
