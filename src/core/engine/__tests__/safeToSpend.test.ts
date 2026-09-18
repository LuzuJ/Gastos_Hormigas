import { describe, it, expect } from 'vitest';
import { SafeToSpendEngine } from '../safeToSpend';
import { AntExpenseAnalytics } from '../antExpenseAnalytics';
import { JournalEntry, RecurringRule, SavingsVault } from '../../models/ledger';

describe('SafeToSpendEngine', () => {
  it('calculates daily safe to spend correctly', () => {
    const fixedRules: RecurringRule[] = [
      {
        id: 'r1',
        userId: 'u1',
        name: 'Renta',
        amount: 500,
        entryType: 'expense',
        frequency: 'monthly',
        nextRunAt: new Date().toISOString(),
        isActive: true,
      },
    ];

    const vaults: SavingsVault[] = [
      {
        id: 'v1',
        userId: 'u1',
        name: 'Fondo Emergencia',
        targetAmount: 600,
        currentAmount: 0,
        isActive: true,
      },
    ];

    const entries: JournalEntry[] = [
      {
        id: 'e1',
        userId: 'u1',
        amount: 5,
        entryType: 'expense',
        timestamp: new Date().toISOString(),
        description: 'Café',
        tags: ['hormiga'],
        isAntExpense: true,
        createdAt: new Date().toISOString(),
      },
    ];

    const metrics = SafeToSpendEngine.calculate({
      entries,
      recurringRules: fixedRules,
      savingsVaults: vaults,
      estimatedMonthlyIncome: 1200,
    });

    expect(metrics.totalMonthlyIncome).toBe(1200);
    expect(metrics.fixedMonthlyCommitments).toBe(500);
    expect(metrics.savingsTargetMonthly).toBe(100); // 600 / 6
    expect(metrics.spentSoFarThisMonth).toBe(5);
    expect(metrics.antExpensesTotalMonth).toBe(5);
    expect(metrics.antExpensesCount).toBe(1);
    expect(metrics.dailySafeToSpend).toBeGreaterThan(0);
    expect(metrics.burnRatePercentage).toBeGreaterThanOrEqual(0);
  });
});

describe('AntExpenseAnalytics', () => {
  it('classifies small amounts or keywords as ant expenses', () => {
    expect(AntExpenseAnalytics.isAntExpense(3.5, 'Agua mineral')).toBe(true);
    expect(AntExpenseAnalytics.isAntExpense(8.0, 'Café latte')).toBe(true);
    expect(AntExpenseAnalytics.isAntExpense(250, 'Televisor')).toBe(false);
  });
});
