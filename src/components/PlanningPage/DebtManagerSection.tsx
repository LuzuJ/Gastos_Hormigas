import React from 'react';
import DebtManager from '../DebtManager/DebtManager';
import { ErrorBoundaryWrapper } from './ErrorBoundaryWrapper';
import type { Liability } from '../../types';

interface DebtManagerSectionProps {
  liabilities: Liability[];
  onAddLiability: (data: any) => void;
  onUpdateLiability: (id: string, data: any) => void;
  onDeleteLiability: (id: string) => void;
}

const DebtManagerErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => {
  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ff6b6b',
      borderRadius: '8px',
      backgroundColor: '#ffe0e0',
      color: '#d63031',
      margin: '10px 0'
    }}>
      <h3>Error en gestión de deudas</h3>
      <p>Hay un problema con el gestor de deudas. Los demás componentes seguirán funcionando.</p>
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

export const DebtManagerSection: React.FC<DebtManagerSectionProps> = ({
  liabilities,
  onAddLiability,
  onUpdateLiability,
  onDeleteLiability
}) => {
  // Implementación temporal del onMakePayment hasta que se integre completamente
  const handleMakePayment = (liabilityId: string, amount: number, paymentType: 'regular' | 'extra' | 'interest_only', description?: string) => {
    console.log('Payment made:', { liabilityId, amount, paymentType, description });
    // TODO: Implementar la lógica real de pagos
  };

  return (
    <ErrorBoundaryWrapper 
      componentName="DebtManager" 
      fallback={DebtManagerErrorFallback}
    >
      <DebtManager
        liabilities={liabilities}
        onAddLiability={onAddLiability}
        onUpdateLiability={onUpdateLiability}
        onDeleteLiability={onDeleteLiability}
        onMakePayment={handleMakePayment}
      />
    </ErrorBoundaryWrapper>
  );
};
