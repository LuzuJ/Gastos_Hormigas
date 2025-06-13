import React from 'react';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { Summary } from '../components/Summary';
import { ExpenseChart } from '../components/ExpenseChart';
import { BarChart3, ListChecks } from 'lucide-react';

// Esta página muestra el dashboard principal
export const DashboardPage = ({ controller }) => {
    const { 
        expenses, 
        loading, 
        error, 
        addExpense, 
        deleteExpense, 
        totalExpenses, 
        chartData 
    } = controller;

    return (
        <>
            <ExpenseForm onAdd={addExpense} isSubmitting={loading} />

            {error && <p className="text-red-500 text-center mb-4 bg-red-100 p-3 rounded-lg">{error}</p>}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
                {/* Columna Izquierda: Gráfico y Resumen */}
                <aside className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
                       <BarChart3 className="mr-3 text-indigo-500" size={24}/>
                       Análisis Visual
                    </h2>
                    <ExpenseChart data={chartData} />
                     <div className="mt-6 border-t pt-4">
                       <Summary total={totalExpenses} />
                     </div>
                </aside>
                
                {/* Columna Derecha: Lista de Gastos */}
                <section className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
                     <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
                       <ListChecks className="mr-3 text-indigo-500" size={24}/>
                       Registro de Gastos
                    </h2>
                    <ExpenseList expenses={expenses} onDelete={deleteExpense} loading={loading} />
                </section>
            </div>
        </>
    );
};
