import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

// --- NUEVO: Definimos las categorías disponibles ---
const categories = ['Comida', 'Transporte', 'Ocio', 'Hogar', 'Salud', 'Otros'];

export const ExpenseForm = ({ onAdd, isSubmitting }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    // --- NUEVO: Estado para la categoría seleccionada ---
    const [category, setCategory] = useState(categories[0]);
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // --- MODIFICADO: Pasamos la categoría a la función onAdd ---
        const result = await onAdd(description, amount, category);
        if (result.success) {
            setDescription('');
            setAmount('');
            setFormError('');
            setCategory(categories[0]); // Resetea la categoría
        } else {
            setFormError(result.error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
                <PlusCircle className="mr-3 text-green-500" size={24}/>
                Añadir Nuevo Gasto
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
                    <input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Café, pasaje..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                </div>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-600 mb-1">Monto ($)</label>
                    <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                </div>
                {/* --- NUEVO: Selector de categoría --- */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">Categoría</label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                {formError && <p className="text-red-500 text-sm md:col-span-3">{formError}</p>}
                <div className="md:col-span-3">
                    <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                        Agregar Gasto
                    </button>
                </div>
            </form>
        </div>
    );
};
