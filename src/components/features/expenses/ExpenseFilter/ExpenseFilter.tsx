import React, { useState, useMemo } from 'react';
import styles from './ExpenseFilter.module.css';
import { Search, Calendar, Tag, Clock, TrendingUp, Archive, Filter, CalendarDays, CalendarRange, ChevronDown } from 'lucide-react';
import type { Category, Expense } from '../../../../types';

export type FilterPeriod = 'today' | 'all' | 'last7days' | 'thisMonth' | 'lastMonth' | 'custom' | 'specificMonth' | 'specificYear';
export type FilterMode = 'dates' | 'categories';

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
  specificMonth?: string; // YYYY-MM format
  specificYear?: string;  // YYYY format
}

interface ExpenseFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterPeriod: FilterPeriod;
  onFilterChange: (period: FilterPeriod) => void;
  dateRange: DateRange;
  onDateChange: (range: DateRange) => void;
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
  expenses: Expense[]; // Nueva prop para generar listas dinámicas
}

export const ExpenseFilter: React.FC<ExpenseFilterProps> = ({
  searchTerm,
  onSearchChange,
  filterPeriod,
  onFilterChange,
  dateRange,
  onDateChange,
  categories,
  selectedCategoryId,
  onCategoryChange,
  expenses,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('dates');

  // Generar listas dinámicas de meses y años disponibles
  const availablePeriodsData = useMemo(() => {
    if (!expenses.length) return { months: [], years: [] };

    const monthsMap = new Map<string, number>();
    const yearsMap = new Map<string, number>();

    expenses.forEach(expense => {
      if (expense.createdAt) {
        const date = new Date(expense.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 0-based to 1-based
        
        const yearKey = year.toString();
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        
        yearsMap.set(yearKey, (yearsMap.get(yearKey) || 0) + 1);
        monthsMap.set(monthKey, (monthsMap.get(monthKey) || 0) + 1);
      }
    });

    // Ordenar años de más reciente a más antiguo
    const sortedYears = Array.from(yearsMap.keys()).sort((a, b) => parseInt(b) - parseInt(a));
    
    // Ordenar meses de más reciente a más antiguo
    const sortedMonths = Array.from(monthsMap.keys()).sort((a, b) => b.localeCompare(a));

    // Formatear nombres de meses para mostrar
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const formattedMonths = sortedMonths.map(monthKey => {
      const [year, month] = monthKey.split('-');
      const monthIndex = parseInt(month) - 1;
      const count = monthsMap.get(monthKey) || 0;
      return {
        value: monthKey,
        label: `${monthNames[monthIndex]} ${year}`,
        count: count
      };
    });

    const formattedYears = sortedYears.map(year => ({
      value: year,
      label: year,
      count: yearsMap.get(year) || 0
    }));

    return {
      months: formattedMonths,
      years: formattedYears
    };
  }, [expenses]);

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Al cambiar una fecha manualmente, el filtro se convierte en "custom"
    onFilterChange('custom'); 
    onDateChange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleSpecificMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange('specificMonth');
    onDateChange({ ...dateRange, specificMonth: e.target.value });
  };

  const handleSpecificYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange('specificYear');
    onDateChange({ ...dateRange, specificYear: e.target.value });
  };

  return (
    <div className={styles.container}>
      {/* --- Búsqueda por Texto --- */}
      <div className={styles.searchGroup}>
        <input
          type="text"
          placeholder="Buscar gastos por descripción..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.input}
        />
        <Search size={16} className={styles.icon} />
      </div>

      {/* --- Toggle de Modo de Filtro --- */}
      <div className={styles.filterModeToggle}>
        <button
          className={`${styles.toggleButton} ${filterMode === 'dates' ? styles.active : ''}`}
          onClick={() => setFilterMode('dates')}
        >
          <Calendar size={16} />
          Fechas
        </button>
        <button
          className={`${styles.toggleButton} ${filterMode === 'categories' ? styles.active : ''}`}
          onClick={() => setFilterMode('categories')}
        >
          <Tag size={16} />
          Categorías
        </button>
      </div>

      {/* --- Filtros Condicionales --- */}
      {filterMode === 'dates' ? (
        <div className={styles.dateFilters}>
          {/* Filtros Rápidos de Fecha */}
          <div className={styles.quickFilters}>
            <button
              className={filterPeriod === 'today' ? styles.active : ''}
              onClick={() => onFilterChange('today')}
            >
              <Clock size={16} />
              Hoy
            </button>
            <button
              className={filterPeriod === 'last7days' ? styles.active : ''}
              onClick={() => onFilterChange('last7days')}
            >
              <TrendingUp size={16} />
              7 Días
            </button>
            <button
              className={filterPeriod === 'thisMonth' ? styles.active : ''}
              onClick={() => onFilterChange('thisMonth')}
            >
              <Calendar size={16} />
              Este Mes
            </button>
            <button
              className={filterPeriod === 'lastMonth' ? styles.active : ''}
              onClick={() => onFilterChange('lastMonth')}
            >
              <Archive size={16} />
              Mes Anterior
            </button>
            <button
              className={filterPeriod === 'all' ? styles.active : ''}
              onClick={() => onFilterChange('all')}
            >
              <Filter size={16} />
              Todo
            </button>
            <button
              className={filterPeriod === 'specificMonth' ? styles.active : ''}
              onClick={() => onFilterChange('specificMonth')}
            >
              <CalendarDays size={16} />
              Mes
            </button>
            <button
              className={filterPeriod === 'specificYear' ? styles.active : ''}
              onClick={() => onFilterChange('specificYear')}
            >
              <CalendarRange size={16} />
              Año
            </button>
          </div>

          {/* Rango de Fechas Personalizado */}
          {filterPeriod === 'custom' && (
            <div className={styles.dateRange}>
              <div className={styles.dateInputGroup}>
                <label htmlFor="startDate">Desde</label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={dateRange.startDate || ''}
                  onChange={handleDateInputChange}
                  className={styles.dateInput}
                />
              </div>
              <div className={styles.dateInputGroup}>
                <label htmlFor="endDate">Hasta</label>
                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={dateRange.endDate || ''}
                  onChange={handleDateInputChange}
                  className={styles.dateInput}
                />
              </div>
            </div>
          )}

          {/* Filtro por Mes Específico */}
          {filterPeriod === 'specificMonth' && (
            <div className={styles.specificFilterContainer}>
              <div className={styles.dateInputGroup}>
                <label htmlFor="specificMonth">Seleccionar Mes</label>
                <div className={styles.selectWrapper}>
                  <select
                    id="specificMonth"
                    value={dateRange.specificMonth || ''}
                    onChange={handleSpecificMonthChange}
                    className={styles.customSelect}
                    disabled={availablePeriodsData.months.length === 0}
                  >
                    <option value="">
                      {availablePeriodsData.months.length === 0 
                        ? "No hay meses con gastos registrados" 
                        : "Seleccionar mes..."
                      }
                    </option>
                    {availablePeriodsData.months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label} ({month.count} gasto{month.count !== 1 ? 's' : ''})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
              </div>
            </div>
          )}

          {/* Filtro por Año Específico */}
          {filterPeriod === 'specificYear' && (
            <div className={styles.specificFilterContainer}>
              <div className={styles.dateInputGroup}>
                <label htmlFor="specificYear">Seleccionar Año</label>
                <div className={styles.selectWrapper}>
                  <select
                    id="specificYear"
                    value={dateRange.specificYear || ''}
                    onChange={handleSpecificYearChange}
                    className={styles.customSelect}
                    disabled={availablePeriodsData.years.length === 0}
                  >
                    <option value="">
                      {availablePeriodsData.years.length === 0 
                        ? "No hay años con gastos registrados" 
                        : "Seleccionar año..."
                      }
                    </option>
                    {availablePeriodsData.years.map(year => (
                      <option key={year.value} value={year.value}>
                        {year.label} ({year.count} gasto{year.count !== 1 ? 's' : ''})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.categoryFilters}>
          {/* Selector de Categoría */}
          <div className={styles.filterGroup}>
            <label htmlFor="categorySelect">Categoría</label>
            <select
              id="categorySelect"
              value={selectedCategoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              className={styles.select}
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};