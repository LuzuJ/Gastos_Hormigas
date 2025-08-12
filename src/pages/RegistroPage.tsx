import React from 'react';
import { useExpensesController } from '../hooks/useExpensesController';
import { ExpenseList } from '../components/ExpenseList/ExpenseList';
import { EditExpenseModal } from '../components/modals/EditExpenseModal/EditExpenseModal';

interface RegistroPageProps {
  userId: string | null;
}

export const RegistroPage: React.FC<RegistroPageProps> = ({ userId }) => {
  const { 
    expenses, 
    categories, 
    loading, 
    updateExpense, 
    deleteExpense,
    isEditing, 
    setIsEditing,
    addSubCategory
  } = useExpensesController(userId);

  return (
    <div>
      <h2 className="section-title">Registro de Todos los Gastos</h2>
      <p className="section-subtitle">Aquí puedes ver, editar y eliminar cada uno de tus gastos registrados.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <ExpenseList 
          expenses={expenses} 
          categories={categories}
          onDelete={deleteExpense} 
          loading={loading}
          onEdit={(expense) => setIsEditing(expense)} 
        />
      </div>

      {isEditing && (
        <EditExpenseModal
            expense={isEditing}
            categories={categories}
            onClose={() => setIsEditing(null)}
            onSave={updateExpense}
            onAddSubCategory={addSubCategory}
        />
      )}
    </div>
  );
};