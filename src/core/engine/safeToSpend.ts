import { JournalEntry, RecurringRule, SavingsVault, SafeToSpendMetrics } from '../models/ledger';
import { getDaysInMonth, getDate, startOfMonth, endOfMonth } from 'date-fns';

export interface SafeToSpendInput {
  entries: JournalEntry[];
  recurringRules: RecurringRule[];
  savingsVaults: SavingsVault[];
  estimatedMonthlyIncome?: number;
  currentDate?: Date;
}

export class SafeToSpendEngine {
  /**
   * Calcula el monto disponible seguro para gastar hoy (Safe-to-Spend diario)
   * basado en ingresos proyectados, compromisos fijos y gasto acumulado.
   */
  static calculate(input: SafeToSpendInput): SafeToSpendMetrics {
    const now = input.currentDate || new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const daysInMonth = getDaysInMonth(now);
    const currentDay = getDate(now);
    const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

    // 1. Ingreso Mensual Proyectado (Reglas activas de ingreso o fallback estimado)
    const recurringIncome = input.recurringRules
      .filter(r => r.isActive && r.entryType === 'income')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalMonthlyIncome = Math.max(
      input.estimatedMonthlyIncome || 0,
      recurringIncome
    );

    // 2. Compromisos Fijos Mensuales (Reglas recurrentes de gasto activo)
    const fixedMonthlyCommitments = input.recurringRules
      .filter(r => r.isActive && r.entryType === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);

    // 3. Ahorro Objetivo Mensual
    const savingsTargetMonthly = input.savingsVaults
      .filter(v => v.isActive)
      .reduce((sum, v) => sum + (v.targetAmount > v.currentAmount ? (v.targetAmount - v.currentAmount) / 6 : 0), 0);

    // 4. Filtrar entradas del mes actual
    const currentMonthEntries = input.entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    // 5. Gastos Totales del Mes y Gastos Hormiga
    let spentSoFarThisMonth = 0;
    let antExpensesTotalMonth = 0;
    let antExpensesCount = 0;

    for (const entry of currentMonthEntries) {
      if (entry.entryType === 'expense') {
        spentSoFarThisMonth += entry.amount;
        if (entry.isAntExpense) {
          antExpensesTotalMonth += entry.amount;
          antExpensesCount += 1;
        }
      }
    }

    // 6. Pool Disponible y Safe to Spend Diario
    const discretionaryPool = Math.max(0, totalMonthlyIncome - fixedMonthlyCommitments - savingsTargetMonthly);
    const remainingPoolThisMonth = Math.max(0, discretionaryPool - spentSoFarThisMonth);
    const dailySafeToSpend = remainingPoolThisMonth > 0 ? remainingPoolThisMonth / daysRemaining : 0;

    const burnRatePercentage = discretionaryPool > 0
      ? Math.min(100, (spentSoFarThisMonth / discretionaryPool) * 100)
      : (spentSoFarThisMonth > 0 ? 100 : 0);

    return {
      dailySafeToSpend: Math.round(dailySafeToSpend * 100) / 100,
      totalMonthlyIncome,
      fixedMonthlyCommitments,
      savingsTargetMonthly: Math.round(savingsTargetMonthly * 100) / 100,
      spentSoFarThisMonth,
      remainingPoolThisMonth: Math.round(remainingPoolThisMonth * 100) / 100,
      daysRemainingInMonth: daysRemaining,
      antExpensesTotalMonth,
      antExpensesCount,
      burnRatePercentage: Math.round(burnRatePercentage * 10) / 10,
    };
  }
}
