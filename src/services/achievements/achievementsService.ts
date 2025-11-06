import type { Achievement, UserStats, Expense, Category, SavingsGoal, Liability } from '../../types';

// Definición de logros disponibles
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'isUnlocked' | 'unlockedAt' | 'progress'>[] = [
  // === LOGROS DE PRESUPUESTO ===
  {
    id: 'budget-beginner',
    title: '¡Primer Mes Controlado!',
    description: 'No superaste ningún presupuesto durante un mes completo',
    category: 'budget',
    tier: 'bronze',
    icon: '🎯',
    points: 100,
    requirement: {
      type: 'budget_streak',
      value: 1,
      period: 'monthly'
    }
  },
  {
    id: 'budget-master',
    title: 'Maestro del Presupuesto',
    description: 'No superaste ningún presupuesto durante 3 meses consecutivos',
    category: 'budget',
    tier: 'silver',
    icon: '🏆',
    points: 300,
    requirement: {
      type: 'budget_streak',
      value: 3,
      period: 'monthly'
    }
  },
  {
    id: 'budget-legend',
    title: 'Leyenda del Control',
    description: 'No superaste ningún presupuesto durante 6 meses consecutivos',
    category: 'budget',
    tier: 'gold',
    icon: '👑',
    points: 600,
    requirement: {
      type: 'budget_streak',
      value: 6,
      period: 'monthly'
    }
  },
  
  // === LOGROS DE AHORRO ===
  {
    id: 'first-saver',
    title: '¡Primera Meta Alcanzada!',
    description: 'Completaste tu primera meta de ahorro',
    category: 'savings',
    tier: 'bronze',
    icon: '💰',
    points: 150,
    requirement: {
      type: 'savings_goal',
      value: 1,
      period: 'total'
    }
  },
  {
    id: 'savings-pro',
    title: 'Ahorrador Profesional',
    description: 'Completaste 5 metas de ahorro',
    category: 'savings',
    tier: 'silver',
    icon: '🌟',
    points: 400,
    requirement: {
      type: 'savings_goal',
      value: 5,
      period: 'total'
    }
  },
  {
    id: 'savings-guru',
    title: 'Gurú del Ahorro',
    description: 'Completaste 10 metas de ahorro',
    category: 'savings',
    tier: 'gold',
    icon: '💎',
    points: 800,
    requirement: {
      type: 'savings_goal',
      value: 10,
      period: 'total'
    }
  },
  
  // === LOGROS DE DEUDAS ===
  {
    id: 'debt-slayer',
    title: 'Cazador de Deudas',
    description: 'Pagaste completamente tu primera deuda',
    category: 'debt',
    tier: 'bronze',
    icon: '⚔️',
    points: 200,
    requirement: {
      type: 'debt_payment',
      value: 1,
      period: 'total'
    }
  },
  {
    id: 'debt-free',
    title: 'Libre de Deudas',
    description: 'No tienes deudas activas',
    category: 'debt',
    tier: 'platinum',
    icon: '🕊️',
    points: 1000,
    requirement: {
      type: 'debt_payment',
      value: 0, // 0 deudas activas
      period: 'total'
    }
  },
  
  // === LOGROS DE GASTOS ===
  {
    id: 'expense-cutter',
    title: 'Cortador de Gastos',
    description: 'Redujiste tus gastos en un 20% respecto al mes anterior',
    category: 'general',
    tier: 'bronze',
    icon: '✂️',
    points: 120,
    requirement: {
      type: 'expense_reduction',
      value: 20,
      period: 'monthly'
    }
  },
  {
    id: 'expense-optimizer',
    title: 'Optimizador Experto',
    description: 'Redujiste tus gastos en un 40% respecto al mes anterior',
    category: 'general',
    tier: 'gold',
    icon: '🎯',
    points: 500,
    requirement: {
      type: 'expense_reduction',
      value: 40,
      period: 'monthly'
    }
  },
  
  // === LOGROS DE PATRIMONIO ===
  {
    id: 'net-worth-growth',
    title: 'Crecimiento Patrimonial',
    description: 'Incrementaste tu patrimonio neto en un 25%',
    category: 'general',
    tier: 'silver',
    icon: '📈',
    points: 350,
    requirement: {
      type: 'net_worth_growth',
      value: 25,
      period: 'yearly'
    }
  }
];

export class AchievementsService {
  
  // Calcular el progreso de los logros basado en los datos del usuario
  static calculateAchievementProgress(
    achievements: Achievement[],
    expenses: Expense[],
    categories: Category[],
    savingsGoals: SavingsGoal[],
    liabilities: Liability[],
    monthlyIncome: number
  ): Achievement[] {
    
    return achievements.map(achievement => {
      let progress = 0;
      
      switch (achievement.requirement.type) {
        case 'budget_streak':
          progress = this.calculateBudgetStreak(expenses, categories);
          break;
          
        case 'savings_goal':
          progress = this.calculateCompletedSavingsGoals(savingsGoals);
          break;
          
        case 'debt_payment':
          if (achievement.id === 'debt-free') {
            progress = liabilities.filter(l => !l.isArchived).length === 0 ? 100 : 0;
          } else {
            progress = liabilities.filter(l => l.isArchived).length;
          }
          break;
          
        case 'expense_reduction':
          progress = this.calculateExpenseReduction(expenses);
          break;
          
        case 'net_worth_growth':
          // Este cálculo requeriría datos históricos
          break;
          
        default:
          break;
      }
      
      const progressPercentage = Math.min(100, (progress / achievement.requirement.value) * 100);
      const isUnlocked = progressPercentage >= 100;
      
      return {
        ...achievement,
        progress: progressPercentage,
        isUnlocked: isUnlocked || achievement.isUnlocked,
        unlockedAt: isUnlocked && !achievement.isUnlocked ? new Date().toISOString() : achievement.unlockedAt
      };
    });
  }
  
  // Calcular racha de presupuesto (simplificado)
  private static calculateBudgetStreak(expenses: Expense[], categories: Category[]): number {
    // Esta es una implementación simplificada
    // En una implementación real, necesitarías datos históricos por mes
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const monthlyExpenses = expenses.reduce((acc, expense) => {
      const expenseMonth = expense.createdAt ? new Date(expense.createdAt).toISOString().slice(0, 7) : currentMonth;
      if (!acc[expenseMonth]) acc[expenseMonth] = {};
      if (!acc[expenseMonth][expense.categoryId]) acc[expenseMonth][expense.categoryId] = 0;
      acc[expenseMonth][expense.categoryId] += expense.amount;
      return acc;
    }, {} as Record<string, Record<string, number>>);
    
    let streak = 0;
    for (const month in monthlyExpenses) {
      let monthCompliant = true;
      for (const categoryId in monthlyExpenses[month]) {
        const category = categories.find(c => c.id === categoryId);
        if (category?.budget && monthlyExpenses[month][categoryId] > category.budget) {
          monthCompliant = false;
          break;
        }
      }
      if (monthCompliant) streak++;
    }
    
    return streak;
  }
  
  // Calcular metas de ahorro completadas
  private static calculateCompletedSavingsGoals(savingsGoals: SavingsGoal[]): number {
    return savingsGoals.filter(goal => goal.currentAmount >= goal.targetAmount).length;
  }
  
  // Calcular reducción de gastos (simplificado)
  private static calculateExpenseReduction(expenses: Expense[]): number {
    // Implementación simplificada - requiere datos históricos
    return 0;
  }
  
  // Calcular estadísticas del usuario
  static calculateUserStats(achievements: Achievement[]): UserStats {
    const unlockedAchievements = achievements.filter(a => a.isUnlocked);
    const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
    
    // Sistema de niveles: cada 500 puntos = 1 nivel
    const currentLevel = Math.floor(totalPoints / 500) + 1;
    const pointsToNextLevel = 500 - (totalPoints % 500);
    
    return {
      totalPoints,
      currentLevel,
      pointsToNextLevel,
      achievementsUnlocked: unlockedAchievements.length,
      totalAchievements: achievements.length,
      currentStreak: {
        budgetStreak: 0, // Calcular basado en datos reales
        savingsStreak: 0
      },
      monthlyStats: [] // Requiere implementación con datos históricos
    };
  }
  
  // Obtener logros recién desbloqueados
  static getNewlyUnlockedAchievements(
    previousAchievements: Achievement[],
    currentAchievements: Achievement[]
  ): Achievement[] {
    return currentAchievements.filter(current => {
      const previous = previousAchievements.find(p => p.id === current.id);
      return current.isUnlocked && (!previous || !previous.isUnlocked);
    });
  }
}
