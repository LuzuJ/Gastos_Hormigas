import React, { useState } from 'react';
import { Card } from '../common/Card/Card';
import { Button } from '../common/Button/Button';
import styles from './ReportsFilter.module.css';
import { Calendar, Tag, RotateCcw, Filter } from 'lucide-react';
import type { Category } from '../../types';

export type ReportsFilterPeriod = 'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear' | 'lastYear' | 'custom';

export interface ReportsDateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface ReportsFilterState {
  period: ReportsFilterPeriod;
  dateRange: ReportsDateRange;
  selectedCategoryId: string;
}

interface ReportsFilterProps {
  filterState: ReportsFilterState;
  onFilterChange: (newState: ReportsFilterState) => void;
  categories: Category[];
  onReset: () => void;
}

export const ReportsFilter: React.FC<ReportsFilterProps> = ({
  filterState,
  onFilterChange,
  categories,
  onReset
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePeriodChange = (period: ReportsFilterPeriod) => {
    onFilterChange({
      ...filterState,
      period,
      // Limpiar fechas personalizadas cuando se selecciona un período predefinido
      dateRange: period === 'custom' ? filterState.dateRange : { startDate: null, endDate: null }
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newDateRange = { ...filterState.dateRange, [field]: value };
    onFilterChange({
      ...filterState,
      period: 'custom',
      dateRange: newDateRange
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    onFilterChange({
      ...filterState,
      selectedCategoryId: categoryId
    });
  };

  const getPeriodLabel = (period: ReportsFilterPeriod): string => {
    switch (period) {
      case 'thisMonth': return 'Este Mes';
      case 'lastMonth': return 'Mes Anterior';
      case 'last3Months': return 'Últimos 3 Meses';
      case 'last6Months': return 'Últimos 6 Meses';
      case 'thisYear': return 'Este Año';
      case 'lastYear': return 'Año Anterior';
      case 'custom': return 'Personalizado';
      default: return period;
    }
  };

  const getSelectedCategoryName = (): string => {
    if (filterState.selectedCategoryId === 'all') return 'Todas las categorías';
    const category = categories.find(c => c.id === filterState.selectedCategoryId);
    return category?.name || 'Categoría desconocida';
  };

  const hasActiveFilters = filterState.period !== 'thisMonth' || filterState.selectedCategoryId !== 'all';

  const getFilterSummary = (): string => {
    const parts: string[] = [];
    
    if (filterState.period === 'custom' && (filterState.dateRange.startDate || filterState.dateRange.endDate)) {
      const start = filterState.dateRange.startDate ? new Date(filterState.dateRange.startDate).toLocaleDateString() : 'Inicio';
      const end = filterState.dateRange.endDate ? new Date(filterState.dateRange.endDate).toLocaleDateString() : 'Ahora';
      parts.push(`${start} - ${end}`);
    } else if (filterState.period !== 'thisMonth') {
      parts.push(getPeriodLabel(filterState.period));
    }
    
    if (filterState.selectedCategoryId !== 'all') {
      parts.push(getSelectedCategoryName());
    }
    
    return parts.length > 0 ? `Filtros activos: ${parts.join(' • ')}` : 'Mostrando: Este mes • Todas las categorías';
  };

  return (
    <Card className={styles.filterCard}>
      <div className={styles.filterHeader}>
        <div className={styles.headerLeft}>
          <Filter size={20} className={styles.filterIcon} />
          <div>
            <h3 className={styles.filterTitle}>Filtros de Análisis</h3>
            <p className={styles.filterSummary}>{getFilterSummary()}</p>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          {hasActiveFilters && (
            <Button
              onClick={onReset}
              variant="outline"
              size="small"
              className={styles.resetButton}
            >
              <RotateCcw size={16} />
              Reiniciar
            </Button>
          )}
          
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="secondary"
            size="small"
            className={styles.toggleButton}
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.filterContent}>
          {/* Filtros de Período */}
          <div className={styles.filterSection}>
            <div className={styles.sectionHeader}>
              <Calendar size={16} />
              <span>Período de Análisis</span>
            </div>
            
            <div className={styles.periodButtons}>
              {([
                'thisMonth',
                'lastMonth', 
                'last3Months',
                'last6Months',
                'thisYear',
                'lastYear',
                'custom'
              ] as ReportsFilterPeriod[]).map(period => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`${styles.periodButton} ${filterState.period === period ? styles.active : ''}`}
                >
                  {getPeriodLabel(period)}
                </button>
              ))}
            </div>

            {/* Selector de fechas personalizado */}
            {filterState.period === 'custom' && (
              <div className={styles.customDateRange}>
                <div className={styles.dateInputGroup}>
                  <label htmlFor="reportsStartDate">Fecha de inicio</label>
                  <input
                    id="reportsStartDate"
                    type="date"
                    value={filterState.dateRange.startDate || ''}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                    className={styles.dateInput}
                  />
                </div>
                
                <div className={styles.dateInputGroup}>
                  <label htmlFor="reportsEndDate">Fecha de fin</label>
                  <input
                    id="reportsEndDate"
                    type="date"
                    value={filterState.dateRange.endDate || ''}
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                    className={styles.dateInput}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Filtros de Categoría */}
          <div className={styles.filterSection}>
            <div className={styles.sectionHeader}>
              <Tag size={16} />
              <span>Categoría</span>
            </div>
            
            <div className={styles.categorySelect}>
              <select
                value={filterState.selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
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
        </div>
      )}
    </Card>
  );
};
