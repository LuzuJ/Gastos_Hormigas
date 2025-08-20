import React from 'react';
import { SavingsGoals } from '../SavingsGoals/SavingsGoals';
import { LoadingStateWrapper } from '../LoadingState/LoadingState';
import { ErrorBoundaryWrapper } from './ErrorBoundaryWrapper';
import type { SavingsGoal, SavingsGoalFormData } from '../../types';

interface AsyncOperationResult {
  success: boolean;
  error?: string;
}

interface SavingsGoalsSectionProps {
  savingsGoals: SavingsGoal[];
  onAdd: (goal: SavingsGoalFormData) => Promise<AsyncOperationResult>;
  onDelete: (id: string) => Promise<AsyncOperationResult>;
  onAddFunds: (goalId: string, amount: number) => Promise<{ success: boolean; error?: string }>;
  onRemoveFunds: (goalId: string, amount: number) => Promise<{ success: boolean; error?: any }>;
  loading: boolean;
  error: string | null;
  onDismissError: () => void;
  isGuest: boolean;
}

const SavingsGoalsErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => {
  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ff6b6b',
      borderRadius: '8px',
      backgroundColor: '#ffe0e0',
      color: '#d63031',
      margin: '10px 0'
    }}>
      <h3>Error en metas de ahorro</h3>
      <p>Hay un problema con los datos de metas de ahorro. Los demás componentes seguirán funcionando.</p>
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

export const SavingsGoalsSection: React.FC<SavingsGoalsSectionProps> = ({
  savingsGoals,
  onAdd,
  onDelete,
  onAddFunds,
  onRemoveFunds,
  loading,
  error,
  onDismissError,
  isGuest
}) => {
  // Wrapper functions to handle the different return types
  const handleAdd = async (data: SavingsGoalFormData) => {
    const result = await onAdd(data);
    return result;
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
  };

  const handleAddFunds = async (id: string, amount: number) => {
    const result = await onAddFunds(id, amount);
    return result;
  };

  const handleRemoveFunds = async (id: string, amount: number) => {
    const result = await onRemoveFunds(id, amount);
    return result;
  };

  return (
    <ErrorBoundaryWrapper 
      componentName="SavingsGoals" 
      fallback={SavingsGoalsErrorFallback}
    >
      <LoadingStateWrapper
        loading={loading}
        error={error}
        onDismissError={onDismissError}
        loadingMessage="Cargando metas de ahorro..."
        retryButtonText="Reintentar Carga de Metas de Ahorro"
      >
        <SavingsGoals 
          savingsGoals={savingsGoals}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onAddFunds={handleAddFunds}
          onRemoveFunds={handleRemoveFunds}
          isGuest={isGuest}
        />
      </LoadingStateWrapper>
    </ErrorBoundaryWrapper>
  );
};
