import React from 'react';
import { IncomeForm } from '../components/IncomeForm/IncomeForm';
import { useExpensesController } from '../hooks/useExpensesController';

interface PlanningPageProps {
  userId: string | null;
}

export const PlanningPage: React.FC<PlanningPageProps> = ({ userId }) => {
    // Usamos el hook que ahora tiene la lógica de ingresos
    const { financials, setMonthlyIncome, error } = useExpensesController(userId);

    return (
        <div>
            <h2 className="section-title">Planificación Financiera</h2>
            {error && <p className="error-message">{error}</p>}
            
            {/* --- CORRECCIÓN AQUÍ --- */}
            {/* Pasamos la función 'setMonthlyIncome' como la prop 'onSetIncome' */}
            <IncomeForm
                currentIncome={financials?.monthlyIncome || 0}
                onSetIncome={setMonthlyIncome}
            />
            
            {/* Aquí añadiremos el componente de Gastos Fijos en la HU07 */}
            <div style={{marginTop: '2rem'}}>
                <h3 className="section-title">Gastos Fijos</h3>
                <p style={{textAlign: 'center', color: '#6b7280'}}>Próximamente...</p>
            </div>
        </div>
    );
};
