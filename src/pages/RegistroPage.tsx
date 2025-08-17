import React, { useState, useMemo, useEffect } from 'react';
import { useExpensesController } from '../hooks/useExpensesController';
import { ExpenseList } from '../components/ExpenseList/ExpenseList';
import { EditExpenseModal } from '../components/modals/EditExpenseModal/EditExpenseModal';
import { ExpenseFilter, type DateRange, type FilterPeriod } from '../components/ExpenseFilter/ExpenseFilter';
import { Download } from 'lucide-react'; 
import styles from './RegistroPage.module.css';


const formatDate = (date: Date) => date.toISOString().split('T')[0];
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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('last7days');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });

  useEffect(() => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (filterPeriod) {
      case 'today':
        startDate = now;
        endDate = now;
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
        endDate = now;
        break;
      case 'all':
        break;
      case 'custom':
        return;
    }

    setDateRange({
      startDate: startDate ? formatDate(startDate) : null,
      endDate: endDate ? formatDate(endDate) : null,
    });
  }, [filterPeriod]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      if (!expense.createdAt) {
        return false;
      }
      const expenseDate = expense.createdAt.toDate();
      const searchMatch = searchTerm === '' || expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
      const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
      if (startDate) startDate.setUTCHours(0, 0, 0, 0);
      if (endDate) endDate.setUTCHours(23, 59, 59, 999);
      const dateMatch = (!startDate || expenseDate >= startDate) && (!endDate || expenseDate <= endDate);
      return searchMatch && dateMatch;
    });
  }, [expenses, searchTerm, dateRange]);

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      alert("No hay gastos para exportar.");
      return;
    }

    const headers = ["Fecha", "Descripción", "Monto", "Categoría", "Subcategoría"];
    const csvRows = [headers.join(',')];

    filteredExpenses.forEach(expense => {
      const date = expense.createdAt!.toDate().toLocaleDateString('es-EC');
      const categoryName = categories.find(c => c.id === expense.categoryId)?.name || 'N/A';
      const description = `"${expense.description.replace(/"/g, '""')}"`;
      
      csvRows.push([date, description, expense.amount, categoryName, expense.subCategory].join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'gastos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={`section-title ${styles.title}`}>Registro de Todos los Gastos</h2>
        <button onClick={handleExportCSV} className="export-button">
            <Download size={16}/> Exportar CSV
        </button>
      </div>
      
      
      {/* 1. Mueve el ExpenseFilter aquí, arriba de la lista */}
      <div style={{ marginTop: '2rem' }}>
        <ExpenseFilter 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterPeriod={filterPeriod}
          onFilterChange={setFilterPeriod}
          dateRange={dateRange}
          onDateChange={setDateRange}
        />
      </div>

      <div style={{ marginTop: '2rem' }}>
        {/* 2. Pasa la lista ya filtrada al componente ExpenseList */}
        <ExpenseList 
          expenses={filteredExpenses} 
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
}