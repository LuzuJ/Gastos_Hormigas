import React from 'react';
import { 
  useCategoriesContext,
  useFinancialsContext,
  useSavingsGoalsContext,
  useNetWorthContext
} from '../../contexts/AppContext';

export const DiagnosticPanel: React.FC<{ isGuest: boolean }> = ({ isGuest }) => {
  const {
    categories,
    loadingCategories,
    categoriesError
  } = useCategoriesContext();

  const {
    financials,
    loadingFinancials,
    financialsError
  } = useFinancialsContext();

  const {
    savingsGoals,
    loadingSavingsGoals,
    savingsGoalsError
  } = useSavingsGoalsContext();

  const {
    assets,
    liabilities,
    loadingNetWorth,
    netWorthError
  } = useNetWorthContext();

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h4>Estado de Diagnóstico</h4>
      <div><strong>Usuario:</strong> {isGuest ? 'Invitado' : 'Autenticado'}</div>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Categorías:</strong>
        <div>Loading: {loadingCategories ? 'Sí' : 'No'}</div>
        <div>Error: {categoriesError || 'Ninguno'}</div>
        <div>Count: {categories?.length || 0}</div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <strong>Financials:</strong>
        <div>Loading: {loadingFinancials ? 'Sí' : 'No'}</div>
        <div>Error: {financialsError || 'Ninguno'}</div>
        <div>Income: {financials?.monthlyIncome || 0}</div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <strong>SavingsGoals:</strong>
        <div>Loading: {loadingSavingsGoals ? 'Sí' : 'No'}</div>
        <div>Error: {savingsGoalsError || 'Ninguno'}</div>
        <div>Count: {savingsGoals?.length || 0}</div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <strong>NetWorth:</strong>
        <div>Loading: {loadingNetWorth ? 'Sí' : 'No'}</div>
        <div>Error: {netWorthError || 'Ninguno'}</div>
        <div>Assets: {assets?.length || 0}</div>
        <div>Liabilities: {liabilities?.length || 0}</div>
      </div>
    </div>
  );
};
