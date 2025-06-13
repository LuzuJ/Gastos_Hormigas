import { useState, useEffect, useMemo, useCallback } from 'react';
import { expensesService } from '../services/expensesService';

export const useExpensesController = (userId) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = expensesService.onExpensesUpdate(userId, (data, err) => {
            if (err) {
                setError("No se pudieron cargar los datos.");
            } else {
                setExpenses(data || []);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);
    
    // --- MODIFICADO: Ahora acepta 'category' ---
    const addExpense = useCallback(async (description, amount, category) => {
        if (!description.trim() || !amount) {
            return { success: false, error: 'Por favor, ingresa una descripción y un monto.' };
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return { success: false, error: 'Por favor, ingresa un monto válido y mayor a cero.' };
        }

        try {
            // Pasamos el objeto de gasto completo al servicio
            await expensesService.addExpense(userId, { 
                description: description.trim(), 
                amount: parsedAmount,
                category: category 
            });
            return { success: true };
        } catch (err) {
            console.error("Error al agregar el gasto:", err);
            return { success: false, error: "Ocurrió un error al guardar el gasto." };
        }
    }, [userId]);

    const deleteExpense = useCallback(async (expenseId) => {
        try {
            await expensesService.deleteExpense(userId, expenseId);
        } catch (err) {
            console.error("Error al eliminar el gasto:", err);
            setError("No se pudo eliminar el gasto.");
        }
    }, [userId]);

    const totalExpenses = useMemo(() => {
        return expenses.reduce((total, expense) => total + expense.amount, 0);
    }, [expenses]);
    
    // --- NUEVO: Prepara los datos para el gráfico ---
    const chartData = useMemo(() => {
        const categoryColors = {
            'Comida': '#8884d8',
            'Transporte': '#82ca9d',
            'Ocio': '#ffc658',
            'Hogar': '#ff8042',
            'Salud': '#d0ed57',
            'Otros': '#a4de6c',
        };

        const grouped = expenses.reduce((acc, expense) => {
            const category = expense.category || 'Otros';
            if (!acc[category]) {
                acc[category] = { name: category, total: 0, fill: categoryColors[category] || categoryColors['Otros'] };
            }
            acc[category].total += expense.amount;
            return acc;
          }, {});

        return Object.values(grouped);

    }, [expenses]);
    
    // Devuelve los datos del gráfico junto con el resto
    return { expenses, loading, error, addExpense, deleteExpense, totalExpenses, chartData };
};
