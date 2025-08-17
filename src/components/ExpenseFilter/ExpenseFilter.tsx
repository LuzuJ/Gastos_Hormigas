import React from 'react';
import styles from './ExpenseFilter.module.css';
import { Search } from 'lucide-react';
import type { Category } from '../../types';

export type FilterPeriod = 'today' | 'all' | 'last7days' | 'thisMonth' | 'lastMonth' | 'custom';

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
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
}) => {

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Al cambiar una fecha manualmente, el filtro se convierte en "custom"
    onFilterChange('custom'); 
    onDateChange({ ...dateRange, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.container}>
      {/* --- Búsqueda por Texto --- */}
      <div className={styles.searchGroup}>
        <input
          type="text"
          placeholder="Buscar por descripción..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.input}
        />
        <Search className={styles.icon} size={20} />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="categoryFilter">Categoría</label>
        <select 
          id="categoryFilter"
          className={styles.select}
          value={selectedCategoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      
      {/* --- Filtros Rápidos (ahora son botones) --- */}
      <div className={styles.quickFilters}>
        <button onClick={() => onFilterChange('last7days')} className={filterPeriod === 'last7days' ? styles.active : ''}>7 Días</button>
        <button onClick={() => onFilterChange('today')} className={filterPeriod === 'today' ? styles.active : ''}>Hoy</button>
        <button onClick={() => onFilterChange('thisMonth')} className={filterPeriod === 'thisMonth' ? styles.active : ''}>Este Mes</button>
        <button onClick={() => onFilterChange('lastMonth')} className={filterPeriod === 'lastMonth' ? styles.active : ''}>Mes Anterior</button>
        <button onClick={() => onFilterChange('all')} className={filterPeriod === 'all' ? styles.active : ''}>Todo</button>
      </div>

      {/* --- Filtros por Rango de Fecha Personalizado --- */}
      <div className={styles.dateRange}>
        <div className={styles.dateInputGroup}>
          <label htmlFor="startDate">Desde</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={dateRange.startDate || ''}
            onChange={handleDateInputChange}
            className={styles.dateInput}
          />
        </div>
        <div className={styles.dateInputGroup}>
          <label htmlFor="endDate">Hasta</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={dateRange.endDate || ''}
            onChange={handleDateInputChange}
            className={styles.dateInput}
          />
        </div>
      </div>
    </div>
  );
};