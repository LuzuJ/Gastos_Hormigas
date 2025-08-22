import React, { useState, useEffect } from 'react';
import { 
  PiggyBank, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Target,
  Settings,
  BarChart3
} from 'lucide-react';
import styles from './BudgetManager.module.css';
import { BudgetAlerts } from '../BudgetAlerts';
import { Button } from '../common/Button/Button';
import { 
  BudgetAnalytics, 
  BudgetSuggestion,
  BudgetIntelligenceService 
} from '../../services/budget/budgetIntelligenceService';
import { Category, Expense } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface BudgetManagerProps {
  categories: Category[];
  expenses: Expense[];
  monthlyExpensesByCategory: Array<{ name: string; value: number }>;
  onCategoryBudgetUpdate?: (categoryId: string, budget: number) => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  categories,
  expenses,
  monthlyExpensesByCategory,
  onCategoryBudgetUpdate
}) => {
  const [analytics, setAnalytics] = useState<BudgetAnalytics | null>(null);
  const [suggestions, setSuggestions] = useState<BudgetSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'suggestions' | 'settings'>('overview');

  const getConfidenceText = (confidence: string): string => {
    if (confidence === 'high') return 'Alta confianza';
    if (confidence === 'medium') return 'Confianza media';
    return 'Baja confianza';
  };

  const getTrendText = (trend: string): string => {
    if (trend === 'increasing') return '↗️ Aumentando';
    if (trend === 'decreasing') return '↘️ Disminuyendo';
    return '➡️ Estable';
  };

  const getConfidenceClass = (confidence: string): string => {
    const baseClass = styles.confidence;
    const confidenceClass = styles[`confidence${confidence.charAt(0).toUpperCase() + confidence.slice(1)}`];
    return `${baseClass} ${confidenceClass}`;
  };

  useEffect(() => {
    // Generar analytics
    const budgetAnalytics = BudgetIntelligenceService.generateAnalytics(categories, expenses);
    setAnalytics(budgetAnalytics);

    // Generar sugerencias
    const budgetSuggestions = BudgetIntelligenceService.generateSuggestions(categories, expenses);
    setSuggestions(budgetSuggestions);
  }, [categories, expenses]);

  const budgetedCategories = categories.filter(c => c.budget && c.budget > 0);
  const hasAnyBudgets = budgetedCategories.length > 0;

  const applySuggestion = (suggestion: BudgetSuggestion) => {
    if (suggestion.categoryId && onCategoryBudgetUpdate) {
      onCategoryBudgetUpdate(suggestion.categoryId, suggestion.suggestedAmount);
    }
  };

  const renderOverview = () => (
    <div className={styles.overviewContent}>
      {/* Cards de resumen */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>
            <DollarSign />
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardLabel}>Presupuesto Total</span>
            <span className={styles.cardValue}>
              {analytics ? formatCurrency(analytics.totalBudget) : '-'}
            </span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>
            <TrendingUp />
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardLabel}>Gastado este Mes</span>
            <span className={styles.cardValue}>
              {analytics ? formatCurrency(analytics.totalSpent) : '-'}
            </span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>
            <Target />
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardLabel}>Disponible</span>
            <span className={`${styles.cardValue} ${analytics && analytics.totalRemaining >= 0 ? styles.positive : styles.negative}`}>
              {analytics ? formatCurrency(analytics.totalRemaining) : '-'}
            </span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>
            <BarChart3 />
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardLabel}>Progreso General</span>
            <span className={styles.cardValue}>
              {analytics ? `${analytics.overallProgress.toFixed(1)}%` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Progreso de categorías */}
      {hasAnyBudgets && (
        <div className={styles.progressSection}>
          <h3 className={styles.sectionTitle}>
            <PiggyBank size={20} />
            Progreso por Categoría
          </h3>
          <div className={styles.simpleBudgetSummary}>
            {categories.filter(c => c.budget && c.budget > 0).map(category => {
              const spent = monthlyExpensesByCategory.find(e => e.name === category.name)?.value || 0;
              const progress = category.budget! > 0 ? (spent / category.budget!) * 100 : 0;
              let backgroundColor = '#10b981';
              if (progress > 100) {
                backgroundColor = '#ef4444';
              } else if (progress > 80) {
                backgroundColor = '#f59e0b';
              }
              return (
                <div key={category.id} className={styles.budgetItem}>
                  <div className={styles.budgetInfo}>
                    <span>{category.name}</span>
                    <span>{formatCurrency(spent)} / {formatCurrency(category.budget!)}</span>
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div 
                      className={styles.progressBar}
                      style={{ 
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estadísticas adicionales */}
      {analytics && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h4>Categorías en Buen Rumbo</h4>
            <span className={styles.statNumber}>{analytics.categoriesOnTrack}</span>
          </div>
          <div className={styles.statCard}>
            <h4>Categorías en Riesgo</h4>
            <span className={styles.statNumber}>{analytics.categoriesAtRisk}</span>
          </div>
          <div className={styles.statCard}>
            <h4>Presupuestos Excedidos</h4>
            <span className={styles.statNumber}>{analytics.categoriesOverBudget}</span>
          </div>
        </div>
      )}

      {/* Proyección de fin de mes */}
      {analytics && analytics.projectedMonthEnd && (
        <div className={styles.projectionCard}>
          <h3 className={styles.sectionTitle}>
            <TrendingUp size={20} />
            Proyección de Fin de Mes
          </h3>
          <div className={styles.projectionContent}>
            <div className={styles.projectionStat}>
              <span className={styles.projectionLabel}>Gasto Estimado:</span>
              <span className={styles.projectionValue}>
                {formatCurrency(analytics.projectedMonthEnd.estimatedSpent)}
              </span>
            </div>
            <div className={styles.projectionStat}>
              <span className={styles.projectionLabel}>Disponible Estimado:</span>
              <span className={`${styles.projectionValue} ${analytics.projectedMonthEnd.estimatedRemaining >= 0 ? styles.positive : styles.negative}`}>
                {formatCurrency(analytics.projectedMonthEnd.estimatedRemaining)}
              </span>
            </div>
            <div className={styles.projectionStatus}>
              {analytics.projectedMonthEnd.onTrackToMeetBudget ? (
                <span className={styles.onTrack}>✅ En camino de cumplir el presupuesto</span>
              ) : (
                <span className={styles.offTrack}>⚠️ Riesgo de exceder el presupuesto</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSuggestions = () => (
    <div className={styles.suggestionsContent}>
      {suggestions.length > 0 ? (
        <>
          <div className={styles.suggestionsHeader}>
            <h3>Sugerencias Inteligentes</h3>
            <p>Basadas en tu historial de gastos de los últimos 3 meses</p>
          </div>
          <div className={styles.suggestionsList}>
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className={styles.suggestionCard}>
                <div className={styles.suggestionHeader}>
                  <div className={styles.suggestionType}>
                    {suggestion.type === 'increase' && '📈'}
                    {suggestion.type === 'decrease' && '📉'}
                    {suggestion.type === 'redistribute' && '🔄'}
                    {suggestion.type === 'new_category' && '➕'}
                    <span className={styles.suggestionTypeText}>
                      {suggestion.type === 'increase' && 'Aumentar Presupuesto'}
                      {suggestion.type === 'decrease' && 'Reducir Presupuesto'}
                      {suggestion.type === 'redistribute' && 'Redistribuir'}
                      {suggestion.type === 'new_category' && 'Nuevo Presupuesto'}
                    </span>
                  </div>
                  <span className={getConfidenceClass(suggestion.confidence)}>
                    {getConfidenceText(suggestion.confidence)}
                  </span>
                </div>
                
                <div className={styles.suggestionDetails}>
                  <h4>{suggestion.categoryName}</h4>
                  <p className={styles.suggestionReason}>{suggestion.reason}</p>
                  <p className={styles.suggestionImpact}>{suggestion.impact}</p>
                  
                  <div className={styles.suggestionNumbers}>
                    {suggestion.currentAmount && (
                      <span>Actual: {formatCurrency(suggestion.currentAmount)}</span>
                    )}
                    <span>Sugerido: {formatCurrency(suggestion.suggestedAmount)}</span>
                  </div>
                  
                  <div className={styles.suggestionData}>
                    <small>
                      Basado en {suggestion.basedOnData.months} meses de datos • 
                      Promedio: {formatCurrency(suggestion.basedOnData.averageSpending)} • 
                      Tendencia: {getTrendText(suggestion.basedOnData.trend)}
                    </small>
                  </div>
                </div>
                
                <div className={styles.suggestionActions}>
                  <Button 
                    variant="primary" 
                    size="small"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    Aplicar Sugerencia
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.noSuggestions}>
          <div className={styles.noSuggestionsIcon}>💡</div>
          <h3>No hay sugerencias disponibles</h3>
          <p>Necesitas al menos 2 meses de datos para generar sugerencias inteligentes</p>
        </div>
      )}
    </div>
  );

  if (!hasAnyBudgets) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <PiggyBank size={64} />
        </div>
        <h3 className={styles.emptyTitle}>No tienes presupuestos configurados</h3>
        <p className={styles.emptyDescription}>
          Configura presupuestos para tus categorías para comenzar a aprovechar las alertas inteligentes y sugerencias automáticas.
        </p>
        <Button variant="primary" onClick={() => setActiveTab('settings')}>
          <Settings size={16} />
          Configurar Presupuestos
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>
            <PiggyBank />
            Gestión de Presupuestos
          </h2>
          <p className={styles.subtitle}>
            Control inteligente de tus finanzas con alertas y sugerencias automáticas
          </p>
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          Resumen
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'alerts' ? styles.active : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <AlertTriangle size={16} />
          Alertas
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'suggestions' ? styles.active : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          <TrendingUp size={16} />
          Sugerencias ({suggestions.length})
        </button>
      </div>

      {/* Contenido de las pestañas */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'alerts' && (
          <BudgetAlerts 
            categories={categories} 
            expenses={expenses}
          />
        )}
        {activeTab === 'suggestions' && renderSuggestions()}
      </div>
    </div>
  );
};
