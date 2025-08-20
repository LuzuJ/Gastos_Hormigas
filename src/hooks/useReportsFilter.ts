import { useMemo, useCallback } from 'react';
import type { Expense, Category } from '../types';
import type { ReportsFilterPeriod, ReportsDateRange } from '../components/ReportsFilter';

export interface UseReportsFilterParams {
  expenses: Expense[];
  categories: Category[];
  filterPeriod: ReportsFilterPeriod;
  dateRange: ReportsDateRange;
  selectedCategoryId: string;
}

export interface FilteredReportsData {
  filteredExpenses: Expense[];
  totalAmount: number;
  categoryCount: number;
  dateRangeLabel: string;
}

export const useReportsFilter = ({
  expenses,
  categories,
  filterPeriod,
  dateRange,
  selectedCategoryId
}: UseReportsFilterParams): FilteredReportsData => {
  
  // Función para obtener las fechas de inicio y fin basadas en el período
  const getDateRangeForPeriod = useCallback((period: ReportsFilterPeriod): { start: Date; end: Date } => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    switch (period) {
      case 'thisMonth': {
        const start = new Date(currentYear, currentMonth, 1);
        const end = new Date(currentYear, currentMonth + 1, 0);
        return { start, end };
      }
      case 'lastMonth': {
        const start = new Date(currentYear, currentMonth - 1, 1);
        const end = new Date(currentYear, currentMonth, 0);
        return { start, end };
      }
      case 'last3Months': {
        const start = new Date(currentYear, currentMonth - 2, 1);
        const end = new Date(currentYear, currentMonth + 1, 0);
        return { start, end };
      }
      case 'last6Months': {
        const start = new Date(currentYear, currentMonth - 5, 1);
        const end = new Date(currentYear, currentMonth + 1, 0);
        return { start, end };
      }
      case 'thisYear': {
        const start = new Date(currentYear, 0, 1);
        const end = new Date(currentYear, 11, 31);
        return { start, end };
      }
      case 'lastYear': {
        const start = new Date(currentYear - 1, 0, 1);
        const end = new Date(currentYear - 1, 11, 31);
        return { start, end };
      }
      case 'custom': {
        const start = dateRange.startDate ? new Date(dateRange.startDate) : new Date(2020, 0, 1);
        const end = dateRange.endDate ? new Date(dateRange.endDate) : new Date();
        return { start, end };
      }
      default:
        return { start: new Date(2020, 0, 1), end: new Date() };
    }
  }, [dateRange]);

  // Función para generar la etiqueta del rango de fechas
  const getDateRangeLabel = useCallback((period: ReportsFilterPeriod): string => {
    const { start, end } = getDateRangeForPeriod(period);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };
    
    switch (period) {
      case 'thisMonth':
        return 'Este mes';
      case 'lastMonth':
        return 'Mes anterior';
      case 'last3Months':
        return 'Últimos 3 meses';
      case 'last6Months':
        return 'Últimos 6 meses';
      case 'thisYear':
        return 'Este año';
      case 'lastYear':
        return 'Año anterior';
      case 'custom':
        return `${formatDate(start)} - ${formatDate(end)}`;
      default:
        return 'Período seleccionado';
    }
  }, [getDateRangeForPeriod]);

  // Datos filtrados memoizados
  const filteredData = useMemo((): FilteredReportsData => {
    const { start, end } = getDateRangeForPeriod(filterPeriod);
    
    // Filtrar por fecha
    let filtered = expenses.filter(expense => {
      if (!expense.createdAt) return false;
      
      const expenseDate = expense.createdAt.toDate();
      return expenseDate >= start && expenseDate <= end;
    });
    
    // Filtrar por categoría
    if (selectedCategoryId !== 'all') {
      filtered = filtered.filter(expense => expense.categoryId === selectedCategoryId);
    }
    
    // Calcular totales
    const totalAmount = filtered.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Contar categorías únicas
    const uniqueCategories = new Set(filtered.map(expense => expense.categoryId));
    const categoryCount = uniqueCategories.size;
    
    return {
      filteredExpenses: filtered,
      totalAmount,
      categoryCount,
      dateRangeLabel: getDateRangeLabel(filterPeriod)
    };
  }, [expenses, filterPeriod, selectedCategoryId, getDateRangeForPeriod, getDateRangeLabel]);

  return filteredData;
};
