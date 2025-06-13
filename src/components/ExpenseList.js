import React from 'react';
import { Trash2, Loader2, Tag } from 'lucide-react';

const categoryColors = {
    'Comida': 'bg-blue-100 text-blue-800',
    'Transporte': 'bg-green-100 text-green-800',
    'Ocio': 'bg-yellow-100 text-yellow-800',
    'Hogar': 'bg-orange-100 text-orange-800',
    'Salud': 'bg-red-100 text-red-800',
    'Otros': 'bg-gray-100 text-gray-800',
};

export const ExpenseList = ({ expenses, onDelete, loading }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700">¡Todo en orden!</h3>
                <p className="text-gray-500">Aún no has registrado ningún gasto.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3">
            {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex-1 mr-4">
                        <p className="font-medium capitalize text-gray-800">{expense.description}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                             {/* --- NUEVO: Muestra la categoría con un estilo de etiqueta --- */}
                            <span className={`mr-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[expense.category] || categoryColors['Otros']}`}>
                                {expense.category || 'Sin categoría'}
                            </span>
                            <span>
                                {expense.createdAt ? new Date(expense.createdAt.seconds * 1000).toLocaleDateString() : 'Justo ahora'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-md font-semibold text-gray-900 mr-4">${expense.amount.toFixed(2)}</span>
                        <button onClick={() => onDelete(expense.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors" aria-label="Eliminar gasto">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
