import React from 'react';
import { DiagnosticPanel } from '../components/pages/PlanningPage/DiagnosticPanel';
import {
    useCategoriesContext,
    useFinancialsContext,
    useSavingsGoalsContext,
    useNetWorthContext
} from '../contexts/AppContext';
import styles from './PlanningPage.module.css';

export interface SimplePlanningPageProps {
    isGuest: boolean;
}

export const SimplePlanningPage: React.FC<SimplePlanningPageProps> = ({ isGuest }) => {
    
    const { 
        categories, 
        loadingCategories, 
        categoriesError, 
        clearCategoriesError 
    } = useCategoriesContext();
    
    const { 
        financials, 
        loadingFinancials,
        financialsError,
        clearFinancialsError
    } = useFinancialsContext();
    
    const { 
        savingsGoals, 
        loadingSavingsGoals,
        savingsGoalsError,
        clearSavingsGoalsError
    } = useSavingsGoalsContext();
    
    const { 
        assets, 
        liabilities, 
        netWorth, 
        loadingNetWorth,
        netWorthError,
        clearNetWorthError
    } = useNetWorthContext();

    // Log de información para debugging
    console.log('SimplePlanningPage render:', {
        isGuest,
        categoriesError,
        financialsError,
        savingsGoalsError,
        netWorthError,
        loading: {
            categories: loadingCategories,
            financials: loadingFinancials,
            savings: loadingSavingsGoals,
            netWorth: loadingNetWorth
        }
    });

    return (
        <div className={styles.container}>
            <DiagnosticPanel isGuest={isGuest} />
            <div className={styles.header}>
                <h2 className={`section-title ${styles.title}`}>Planificación Financiera (Modo Simple)</h2>
            </div>
            
            {categoriesError && (
                <div style={{ background: '#ffe0e0', color: '#d63031', padding: '10px', margin: '10px 0' }}>
                    Error en categorías: {categoriesError}
                    <button onClick={clearCategoriesError}>Dismissar</button>
                </div>
            )}
            
            {financialsError && (
                <div style={{ background: '#ffe0e0', color: '#d63031', padding: '10px', margin: '10px 0' }}>
                    Error en financieros: {financialsError}
                    <button onClick={clearFinancialsError}>Dismissar</button>
                </div>
            )}
            
            {savingsGoalsError && (
                <div style={{ background: '#ffe0e0', color: '#d63031', padding: '10px', margin: '10px 0' }}>
                    Error en metas de ahorro: {savingsGoalsError}
                    <button onClick={clearSavingsGoalsError}>Dismissar</button>
                </div>
            )}
            
            {netWorthError && (
                <div style={{ background: '#ffe0e0', color: '#d63031', padding: '10px', margin: '10px 0' }}>
                    Error en patrimonio neto: {netWorthError}
                    <button onClick={clearNetWorthError}>Dismissar</button>
                </div>
            )}

            <div className={styles.section}>
                <h3>Estado básico:</h3>
                <p>Categorías: {categories?.length || 0}</p>
                <p>Ingresos: {financials?.monthlyIncome || 0}</p>
                <p>Metas de ahorro: {savingsGoals?.length || 0}</p>
                <p>Activos: {assets?.length || 0}</p>
                <p>Pasivos: {liabilities?.length || 0}</p>
                <p>Patrimonio neto: {netWorth || 0}</p>
            </div>

            {isGuest ? (
                <div className={styles.section}>
                    <p>Modo invitado activo</p>
                </div>
            ) : (
                <div className={styles.section}>
                    <p>Usuario autenticado</p>
                </div>
            )}
        </div>
    );
};
