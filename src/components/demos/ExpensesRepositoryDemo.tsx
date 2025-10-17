import React, { useState } from 'react';
import { useExpensesRepo } from '../../hooks/expenses/useExpensesRepo';
import type { ExpenseFormData, Expense } from '../../types';

/**
 * Componente de demostración que usa el patrón repositorio para gestión de gastos
 */
export const ExpensesRepositoryDemo: React.FC = () => {
  // En un escenario real, obtenemos el userId del contexto de autenticación
  // Como es una demo, usaremos un ID fijo para pruebas
  const userId = 'demo-user-123';
  const {
    expenses,
    loadingExpenses,
    expensesError,
    totalExpensesToday,
    addExpense,
    updateExpense,
    deleteExpense
  } = useExpensesRepo(userId);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [subCategory, setSubCategory] = useState('');
  
  const handleAddExpense = async () => {
    const expenseData: ExpenseFormData = {
      description,
      amount,
      categoryId,
      subCategory,
      createdAt: new Date().toISOString()
    };
    
    await addExpense(expenseData);
    
    // Limpiar formulario
    setDescription('');
    setAmount(0);
  };
  
  const handleUpdateExpense = async (expenseId: string) => {
    await updateExpense(expenseId, { description: `${description} (actualizado)` });
  };
  
  const handleDeleteExpense = async (expenseId: string) => {
    await deleteExpense(expenseId);
  };
  
  // Renderizado condicional del contenido principal
  let content: React.ReactNode;
  
  if (loadingExpenses) {
    content = <p>Cargando gastos...</p>;
  } else if (expensesError) {
    content = <p className="error">{expensesError}</p>;
  } else {
    content = (
      <div>
        <h3>Total de gastos hoy: ${totalExpensesToday.toFixed(2)}</h3>
        
        <div>
          <h3>Agregar Nuevo Gasto</h3>
          <div>
            <label>
              Descripción:
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Monto:
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </label>
          </div>
          <div>
            <label>
              Categoría ID:
            </label>
            <input 
              type="text" 
              value={categoryId} 
              onChange={(e) => setCategoryId(e.target.value)}
            />
          </div>
          <div>
            <label>
              Subcategoría:
              <input 
                type="text" 
                value={subCategory} 
                onChange={(e) => setSubCategory(e.target.value)}
              />
            </label>
          </div>
          <button onClick={handleAddExpense}>Agregar Gasto</button>
        </div>
        
        <h3>Lista de Gastos</h3>
        <ul>
          {expenses.map((expense: Expense) => (
            <li key={expense.id}>
              <div>
                <strong>{expense.description}</strong> - ${expense.amount.toFixed(2)}
              </div>
              <div>Categoría: {expense.categoryId} / {expense.subCategory}</div>
              <div>
                <button onClick={() => handleUpdateExpense(expense.id)}>
                  Actualizar
                </button>
                <button onClick={() => handleDeleteExpense(expense.id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  return (
    <div>
      <h2>Demostración del Patrón Repositorio para Gastos</h2>
      {content}
    </div>
  );
};
