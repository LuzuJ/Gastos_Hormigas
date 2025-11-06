import React, { useState, useMemo, useEffect } from 'react';
// 1. Eliminamos el controlador antiguo e importamos los hooks de contexto.
import { useExpensesContext, useCategoriesContext } from '../contexts/AppContext';
import { ExpenseList } from '../components/features/expenses/ExpenseList/ExpenseList';
import { EditExpenseModal } from '../components/modals/EditExpenseModal/EditExpenseModal';
import { ExpenseFilter, type DateRange, type FilterPeriod } from '../components/features/expenses/ExpenseFilter/ExpenseFilter';
import { LoadingStateWrapper } from '../components/LoadingState/LoadingState';
import { BarChart3, TrendingUp } from 'lucide-react'; 
import styles from './RegistroPage.module.css';

const formatDate = (date: Date) => date.toISOString().split('T')[0];

interface RegistroPageProps {
  // No necesita userId ya que usa contextos
}

export const RegistroPage: React.FC<RegistroPageProps> = () => {
  // 2. Consumimos los datos y funciones directamente de sus respectivos contextos.
  const { 
    expenses, 
    loadingExpenses, // Usamos el nuevo estado de carga
    expensesError, // Agregamos manejo de errores
    updateExpense, 
    deleteExpense,
    isEditing, 
    setIsEditing,
    clearExpensesError, // Para limpiar errores
  } = useExpensesContext();
  
  const { categories, addSubCategory } = useCategoriesContext();

  // El resto del estado local y la lógica del componente se mantiene intacta.
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('last7days');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  useEffect(() => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (filterPeriod) {
      case 'today':
        // Para "hoy" necesitamos el inicio y fin del día actual
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last7days':
        startDate = new Date();
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0); // Inicio del día hace 7 días
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999); // Fin del día actual
        break;
      case 'all':
        break;
      case 'custom':
        return;
      case 'specificMonth':
        if (dateRange.specificMonth) {
          const [year, month] = dateRange.specificMonth.split('-').map(Number);
          startDate = new Date(year, month - 1, 1);
          endDate = new Date(year, month, 0);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      case 'specificYear':
        if (dateRange.specificYear) {
          const year = parseInt(dateRange.specificYear);
          startDate = new Date(year, 0, 1);
          endDate = new Date(year, 11, 31);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
    }

    setDateRange({
      ...dateRange,
      startDate: startDate ? formatDate(startDate) : null,
      endDate: endDate ? formatDate(endDate) : null,
    });
  }, [filterPeriod, dateRange.specificMonth, dateRange.specificYear]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      if (!expense.createdAt) {
        return false;
      }
      const expenseDate = new Date(expense.createdAt);
      const searchMatch = searchTerm === '' || expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de fecha: comparación directa sin manipulación UTC
      let dateMatch = true;
      if (dateRange.startDate || dateRange.endDate) {
        const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
        
        if (startDate) {
          dateMatch = dateMatch && expenseDate >= startDate;
        }
        if (endDate) {
          dateMatch = dateMatch && expenseDate <= endDate;
        }
      }
      
      const categoryMatch = selectedCategoryId === 'all' || expense.categoryId === selectedCategoryId;
      return searchMatch && dateMatch && categoryMatch;
    });
  }, [expenses, searchTerm, dateRange, selectedCategoryId]);

  return (
    <div className={styles.registroPage}>
      {/* Header compacto */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>
              <BarChart3 size={28} className={styles.titleIcon} />
              Registro de Gastos
            </h1>
          </div>
          
          <div className={styles.headerStats}>
            <span className={styles.stat}>
              <BarChart3 size={16} />
              <strong>{filteredExpenses.length}</strong> {filteredExpenses.length === 1 ? 'gasto' : 'gastos'}
            </span>
            <span className={styles.stat}>
              <TrendingUp size={16} />
              <strong>${filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}</strong> total
            </span>
          </div>
        </div>
      </header>

      {/* Filtros compactos */}
      <div className={styles.filtersContainer}>
        <ExpenseFilter 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterPeriod={filterPeriod}
          onFilterChange={setFilterPeriod}
          dateRange={dateRange}
          onDateChange={setDateRange}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
          expenses={expenses}
        />
      </div>

      {/* Lista de resultados */}
      <LoadingStateWrapper
        loading={loadingExpenses}
        error={expensesError}
        onDismissError={clearExpensesError}
        retryButtonText="Reintentar Carga de Gastos"
        loadingMessage="Cargando gastos..."
      >
        <div className={styles.resultsContainer}>
          {filteredExpenses.length > 0 && (
            <div className={styles.resultsInfo}>
              <span className={styles.resultsCount}>
                {filteredExpenses.length} {filteredExpenses.length === 1 ? 'resultado' : 'resultados'}
              </span>
            </div>
          )}
          
          <ExpenseList 
            expenses={filteredExpenses} 
            categories={categories}
            onDelete={deleteExpense} 
            loading={false} // Quitamos loading del ExpenseList ya que LoadingStateWrapper lo maneja
            onEdit={(expense) => setIsEditing(expense)} 
          />
        </div>
      </LoadingStateWrapper>

      {isEditing && (
        <EditExpenseModal
            expense={isEditing}
            categories={categories}
            onClose={() => setIsEditing(null)}
            onSave={updateExpense}
            onAddSubCategory={async (categoryId, subCategoryName) => {
              await addSubCategory(categoryId, subCategoryName);
            }}
        />
      )}
    </div>
  );
};
