import React from 'react';
import { ExpenseForm } from '../components/ExpenseForm/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList/ExpenseList';
import { Summary } from '../components/Summary/Summary';
import { ExpensesController } from '../hooks/useExpensesController';

interface DashboardPageProps {
  controller: ExpensesController;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ controller }) => {
    const { 
        expenses, 
        loading, 
        error, 
        addExpense, 
        deleteExpense, 
        totalExpensesToday,
    } = controller;

    return (
        <div>
            <ExpenseForm onAdd={addExpense} isSubmitting={loading} />
            <Summary total={totalExpensesToday} />
            
            {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}

            <div style={{marginTop: '2rem'}}>
              <ExpenseList expenses={expenses} onDelete={deleteExpense} loading={loading} />
            </div>
        </div>
    );
};