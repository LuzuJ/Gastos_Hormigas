import { Expense, Category } from '../../types';
import { 
  startOfMonth, 
  endOfMonth, 
  format, 
  subMonths,
  differenceInDays 
} from 'date-fns';

// Budget interface para el sistema avanzado
export interface Budget {
  id: string;
  categoryId: string;        // Categoría asociada
  amount: number;           // Monto presupuestado
  period: 'monthly' | 'weekly' | 'daily';
  alertThresholds: {
    warning: number;        // % para alerta amarilla (ej: 80%)
    danger: number;         // % para alerta roja (ej: 95%)
  };
  rollover: boolean;        // Permitir acumular sobrantes
  isActive: boolean;
  autoAdjust: boolean;      // Ajuste automático basado en historial
}

export interface BudgetAlert {
  id: string;
  type: 'warning' | 'danger' | 'exceeded' | 'suggestion';
  categoryId: string;
  categoryName: string;
  title: string;
  message: string;
  currentSpent: number;
  budgetAmount: number;
  percentage: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  suggestions?: string[];
  createdAt: Date;
}

export interface BudgetAnalytics {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallProgress: number;
  categoriesOnTrack: number;
  categoriesAtRisk: number;
  categoriesOverBudget: number;
  projectedMonthEnd: {
    estimatedSpent: number;
    estimatedRemaining: number;
    onTrackToMeetBudget: boolean;
  };
}

export interface BudgetSuggestion {
  id: string;
  type: 'increase' | 'decrease' | 'redistribute' | 'new_category';
  categoryId?: string;
  categoryName?: string;
  currentAmount?: number;
  suggestedAmount: number;
  reason: string;
  impact: string;
  confidence: 'low' | 'medium' | 'high';
  basedOnData: {
    months: number;
    averageSpending: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

export class BudgetIntelligenceService {
  /**
   * Genera alertas inteligentes basadas en el progreso actual del presupuesto
   */
  static generateAlerts(
    categories: Category[], 
    expenses: Expense[], 
    currentDate: Date = new Date()
  ): BudgetAlert[] {
    const alerts: BudgetAlert[] = [];
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Filtrar gastos del mes actual
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = expense.createdAt ? new Date(expense.createdAt) : new Date();
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });

    // Agrupar gastos por categoría
    const expensesByCategory = this.groupExpensesByCategory(monthlyExpenses);

    categories.forEach(category => {
      if (!category.budget || category.budget <= 0) return;

      const spent = expensesByCategory[category.id] || 0;
      const percentage = (spent / category.budget) * 100;
      const remaining = category.budget - spent;

      // Alert por porcentaje de presupuesto usado
      if (percentage >= 100) {
        alerts.push({
          id: `exceeded_${category.id}`,
          type: 'exceeded',
          categoryId: category.id,
          categoryName: category.name,
          title: `Presupuesto Excedido - ${category.name}`,
          message: `Has excedido tu presupuesto en ${this.formatCurrency(spent - category.budget)}`,
          currentSpent: spent,
          budgetAmount: category.budget,
          percentage,
          severity: 'critical',
          actionable: true,
          suggestions: [
            'Reduce gastos en esta categoría el resto del mes',
            'Transfiere presupuesto de otra categoría',
            'Considera aumentar el presupuesto para el próximo mes'
          ],
          createdAt: new Date()
        });
      } else if (percentage >= 90) {
        alerts.push({
          id: `danger_${category.id}`,
          type: 'danger',
          categoryId: category.id,
          categoryName: category.name,
          title: `Presupuesto Crítico - ${category.name}`,
          message: `Solo tienes ${this.formatCurrency(remaining)} restante (${(100 - percentage).toFixed(1)}%)`,
          currentSpent: spent,
          budgetAmount: category.budget,
          percentage,
          severity: 'high',
          actionable: true,
          suggestions: [
            'Limita gastos no esenciales en esta categoría',
            'Busca alternativas más económicas'
          ],
          createdAt: new Date()
        });
      } else if (percentage >= 70) {
        alerts.push({
          id: `warning_${category.id}`,
          type: 'warning',
          categoryId: category.id,
          categoryName: category.name,
          title: `Alerta Temprana - ${category.name}`,
          message: `Has usado el ${percentage.toFixed(1)}% de tu presupuesto`,
          currentSpent: spent,
          budgetAmount: category.budget,
          percentage,
          severity: 'medium',
          actionable: false,
          createdAt: new Date()
        });
      }

      // Proyección de fin de mes
      const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
      const daysPassed = differenceInDays(currentDate, monthStart) + 1;
      const daysRemaining = differenceInDays(monthEnd, currentDate);
      
      if (daysPassed > 5) { // Solo hacer proyecciones después de algunos días
        const dailyAverage = spent / daysPassed;
        const projectedSpent = dailyAverage * daysInMonth;
        const projectedPercentage = (projectedSpent / category.budget) * 100;

        if (projectedPercentage > 120 && percentage < 70) {
          alerts.push({
            id: `projection_${category.id}`,
            type: 'suggestion',
            categoryId: category.id,
            categoryName: category.name,
            title: `Proyección de Exceso - ${category.name}`,
            message: `Al ritmo actual, podrías exceder tu presupuesto en ${this.formatCurrency(projectedSpent - category.budget)}`,
            currentSpent: spent,
            budgetAmount: category.budget,
            percentage: projectedPercentage,
            severity: 'medium',
            actionable: true,
            suggestions: [
              `Reduce gastos diarios a ${this.formatCurrency((category.budget - spent) / daysRemaining)}`,
              'Considera ajustar tu presupuesto para el próximo mes'
            ],
            createdAt: new Date()
          });
        }
      }
    });

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Genera análisis completo del presupuesto
   */
  static generateAnalytics(
    categories: Category[], 
    expenses: Expense[], 
    currentDate: Date = new Date()
  ): BudgetAnalytics {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Filtrar gastos del mes actual
    const monthlyExpenses = expenses.filter(expense => {
      // Convertir string ISO a objeto Date
      const expenseDate = expense.createdAt 
        ? new Date(expense.createdAt) 
        : new Date();
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });

    const expensesByCategory = this.groupExpensesByCategory(monthlyExpenses);
    const budgetedCategories = categories.filter(c => c.budget && c.budget > 0);

    const totalBudget = budgetedCategories.reduce((sum, cat) => sum + (cat.budget || 0), 0);
    const totalSpent = budgetedCategories.reduce((sum, cat) => {
      return sum + (expensesByCategory[cat.id] || 0);
    }, 0);

    const totalRemaining = totalBudget - totalSpent;
    const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Análisis por categoría
    let categoriesOnTrack = 0;
    let categoriesAtRisk = 0;
    let categoriesOverBudget = 0;

    budgetedCategories.forEach(category => {
      const spent = expensesByCategory[category.id] || 0;
      const percentage = (spent / category.budget!) * 100;
      
      if (percentage >= 100) {
        categoriesOverBudget++;
      } else if (percentage >= 80) {
        categoriesAtRisk++;
      } else {
        categoriesOnTrack++;
      }
    });

    // Proyección de fin de mes
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
    const daysPassed = differenceInDays(currentDate, monthStart) + 1;
    const dailyAverage = totalSpent / daysPassed;
    const estimatedSpent = dailyAverage * daysInMonth;
    const estimatedRemaining = totalBudget - estimatedSpent;
    const onTrackToMeetBudget = estimatedSpent <= totalBudget;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      overallProgress,
      categoriesOnTrack,
      categoriesAtRisk,
      categoriesOverBudget,
      projectedMonthEnd: {
        estimatedSpent,
        estimatedRemaining,
        onTrackToMeetBudget
      }
    };
  }

  /**
   * Genera sugerencias inteligentes basadas en el historial
   */
  static generateSuggestions(
    categories: Category[], 
    expenses: Expense[], 
    currentDate: Date = new Date()
  ): BudgetSuggestion[] {
    const suggestions: BudgetSuggestion[] = [];
    const monthsToAnalyze = 3; // Analizar últimos 3 meses

    // Analizar tendencias por categoría
    categories.forEach(category => {
      if (!category.budget || category.budget <= 0) return;

      const monthlyData = this.getMonthlySpendingData(
        category.id, 
        expenses, 
        currentDate, 
        monthsToAnalyze
      );

      if (monthlyData.length < 2) return; // Necesitamos al menos 2 meses de datos

      const averageSpending = monthlyData.reduce((sum, month) => sum + month.spent, 0) / monthlyData.length;
      const trend = this.calculateTrend(monthlyData);
      
      // Sugerencia para ajustar presupuesto
      const difference = Math.abs(averageSpending - category.budget);
      const percentageDifference = (difference / category.budget) * 100;

      if (percentageDifference > 20) {
        if (averageSpending > category.budget) {
          suggestions.push({
            id: `increase_${category.id}`,
            type: 'increase',
            categoryId: category.id,
            categoryName: category.name,
            currentAmount: category.budget,
            suggestedAmount: Math.ceil(averageSpending * 1.1), // 10% buffer
            reason: `Tu gasto promedio (${this.formatCurrency(averageSpending)}) supera consistentemente tu presupuesto`,
            impact: `Esto te dará un presupuesto más realista y reducirá el estrés financiero`,
            confidence: trend === 'increasing' ? 'high' : 'medium',
            basedOnData: {
              months: monthsToAnalyze,
              averageSpending,
              trend
            }
          });
        } else {
          suggestions.push({
            id: `decrease_${category.id}`,
            type: 'decrease',
            categoryId: category.id,
            categoryName: category.name,
            currentAmount: category.budget,
            suggestedAmount: Math.floor(averageSpending * 1.05), // 5% buffer
            reason: `Consistentemente gastas menos (${this.formatCurrency(averageSpending)}) que tu presupuesto`,
            impact: `Podrías reasignar ${this.formatCurrency(category.budget - averageSpending)} a otras categorías`,
            confidence: trend === 'decreasing' ? 'high' : 'medium',
            basedOnData: {
              months: monthsToAnalyze,
              averageSpending,
              trend
            }
          });
        }
      }
    });

    // Detectar categorías sin presupuesto pero con gastos recurrentes
    const uncategorizedExpenses = this.findUncategorizedExpenses(categories, expenses, currentDate);
    if (uncategorizedExpenses.length > 0) {
      uncategorizedExpenses.forEach(categoryData => {
        suggestions.push({
          id: `new_category_${categoryData.categoryId}`,
          type: 'new_category',
          categoryId: categoryData.categoryId,
          categoryName: categoryData.categoryName,
          suggestedAmount: Math.ceil(categoryData.averageSpending * 1.1),
          reason: `Gastas regularmente ${this.formatCurrency(categoryData.averageSpending)} en ${categoryData.categoryName} pero no tienes presupuesto`,
          impact: 'Crear un presupuesto te ayudará a controlar mejor estos gastos',
          confidence: 'medium',
          basedOnData: {
            months: monthsToAnalyze,
            averageSpending: categoryData.averageSpending,
            trend: categoryData.trend
          }
        });
      });
    }

    return suggestions.sort((a, b) => {
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    });
  }

  // Helper methods
  private static groupExpensesByCategory(expenses: Expense[]): Record<string, number> {
    return expenses.reduce((acc, expense) => {
      acc[expense.categoryId] = (acc[expense.categoryId] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private static getMonthlySpendingData(
    categoryId: string, 
    expenses: Expense[], 
    currentDate: Date, 
    months: number
  ) {
    const data = [];
    for (let i = 0; i < months; i++) {
      const targetMonth = subMonths(currentDate, i);
      const monthStart = startOfMonth(targetMonth);
      const monthEnd = endOfMonth(targetMonth);
      
      const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = expense.createdAt 
          ? new Date(expense.createdAt) 
          : new Date();
        return expense.categoryId === categoryId && 
               expenseDate >= monthStart && 
               expenseDate <= monthEnd;
      });

      const spent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      data.push({
        month: format(targetMonth, 'yyyy-MM'),
        spent
      });
    }
    
    return data.reverse(); // Más antiguo primero
  }

  private static calculateTrend(monthlyData: Array<{ month: string; spent: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (monthlyData.length < 2) return 'stable';
    
    const firstHalf = monthlyData.slice(0, Math.floor(monthlyData.length / 2));
    const secondHalf = monthlyData.slice(Math.floor(monthlyData.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.spent, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.spent, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    const threshold = firstAvg * 0.1; // 10% threshold
    
    if (difference > threshold) return 'increasing';
    if (difference < -threshold) return 'decreasing';
    return 'stable';
  }

  private static findUncategorizedExpenses(
    categories: Category[], 
    expenses: Expense[], 
    currentDate: Date
  ) {
    const monthsToAnalyze = 3;
    const categoriesWithoutBudget = categories.filter(c => !c.budget || c.budget <= 0);
    
    return categoriesWithoutBudget.map(category => {
      const monthlyData = this.getMonthlySpendingData(
        category.id, 
        expenses, 
        currentDate, 
        monthsToAnalyze
      );
      
      const averageSpending = monthlyData.reduce((sum, month) => sum + month.spent, 0) / monthlyData.length;
      const trend = this.calculateTrend(monthlyData);
      
      return {
        categoryId: category.id,
        categoryName: category.name,
        averageSpending,
        trend
      };
    }).filter(data => data.averageSpending > 0); // Solo categorías con gastos
  }

  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}
