import React from 'react';
import { NetWorthSummary } from '../NetWorthSummary/NetWorthSummary';
import { LoadingStateWrapper } from '../LoadingState/LoadingState';
import { ErrorBoundaryWrapper } from './ErrorBoundaryWrapper';

interface NetWorthSectionProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  loading: boolean;
  error: string | null;
  onDismissError: () => void;
}

const NetWorthErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => {
  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ff6b6b',
      borderRadius: '8px',
      backgroundColor: '#ffe0e0',
      color: '#d63031',
      margin: '10px 0'
    }}>
      <h3>Error en el patrimonio neto</h3>
      <p>Hay un problema con los datos de patrimonio neto. Los demás componentes seguirán funcionando.</p>
      <button 
        onClick={retry}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#d63031',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Reintentar
      </button>
    </div>
  );
};

export const NetWorthSection: React.FC<NetWorthSectionProps> = ({
  totalAssets,
  totalLiabilities,
  netWorth,
  loading,
  error,
  onDismissError
}) => {
  return (
    <ErrorBoundaryWrapper 
      componentName="NetWorth" 
      fallback={NetWorthErrorFallback}
    >
      <LoadingStateWrapper
        loading={loading}
        error={error}
        onDismissError={onDismissError}
        loadingMessage="Cargando datos de patrimonio..."
      >
        <NetWorthSummary 
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          netWorth={netWorth}
        />
      </LoadingStateWrapper>
    </ErrorBoundaryWrapper>
  );
};
