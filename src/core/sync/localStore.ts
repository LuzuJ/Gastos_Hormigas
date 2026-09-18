import { Account, Category, JournalEntry, RecurringRule, SavingsVault, SafeToSpendMetrics } from '../models/ledger';
import { SafeToSpendEngine } from '../engine/safeToSpend';
import { AntExpenseAnalytics } from '../engine/antExpenseAnalytics';
import { nanoid } from 'nanoid';

const STORAGE_KEY_PREFIX = 'gh_local_v3_';

export interface LocalState {
  accounts: Account[];
  categories: Category[];
  entries: JournalEntry[];
  recurringRules: RecurringRule[];
  savingsVaults: SavingsVault[];
  pendingSyncQueue: JournalEntry[];
  monthlyIncomeEstimate: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', userId: 'local', name: 'Café & Snacks', icon: '☕', color: '#F59E0B', budgetMonthly: 50, isFavorite: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-2', userId: 'local', name: 'Comida / Almuerzo', icon: '🍔', color: '#10B981', budgetMonthly: 200, isFavorite: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-3', userId: 'local', name: 'Transporte / Uber', icon: '🚗', color: '#3B82F6', budgetMonthly: 80, isFavorite: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-4', userId: 'local', name: 'Antojos & Varios', icon: '🍪', color: '#EC4899', budgetMonthly: 40, isFavorite: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-5', userId: 'local', name: 'Supermercado', icon: '🛒', color: '#6366F1', budgetMonthly: 300, isFavorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-6', userId: 'local', name: 'Servicios & Rent', icon: '💡', color: '#8B5CF6', budgetMonthly: 400, isFavorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc-cash', userId: 'local', name: 'Efectivo', type: 'asset', initialBalance: 100, currentBalance: 100, currency: 'USD', icon: '💵', color: '#10B981', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'acc-bank', userId: 'local', name: 'Cuenta Principal', type: 'asset', initialBalance: 1500, currentBalance: 1500, currency: 'USD', icon: '🏦', color: '#3B82F6', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'acc-card', userId: 'local', name: 'Tarjeta Crédito', type: 'credit_card', initialBalance: 0, currentBalance: 0, creditLimit: 1000, currency: 'USD', icon: '💳', color: '#EF4444', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export class LocalLedgerStore {
  private static listeners: Set<() => void> = new Set();

  static getState(): LocalState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + 'state');
      if (!raw) {
        const initial: LocalState = {
          accounts: DEFAULT_ACCOUNTS,
          categories: DEFAULT_CATEGORIES,
          entries: [],
          recurringRules: [],
          savingsVaults: [],
          pendingSyncQueue: [],
          monthlyIncomeEstimate: 1200,
        };
        this.saveState(initial);
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return {
        accounts: DEFAULT_ACCOUNTS,
        categories: DEFAULT_CATEGORIES,
        entries: [],
        recurringRules: [],
        savingsVaults: [],
        pendingSyncQueue: [],
        monthlyIncomeEstimate: 1200,
      };
    }
  }

  static saveState(state: LocalState) {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'state', JSON.stringify(state));
    this.notify();
  }

  static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notify() {
    this.listeners.forEach(fn => fn());
  }

  /**
   * Registro ultra-rápido (< 5ms) optimista en local
   */
  static addEntry(
    amount: number,
    categoryId: string | null,
    sourceAccountId?: string | null,
    description: string = '',
    customIsAnt?: boolean
  ): JournalEntry {
    const state = this.getState();
    const isAnt = customIsAnt !== undefined
      ? customIsAnt
      : AntExpenseAnalytics.isAntExpense(amount, description);

    const newEntry: JournalEntry = {
      id: nanoid(),
      userId: 'local',
      amount,
      entryType: 'expense',
      sourceAccountId: sourceAccountId || state.accounts[0]?.id || null,
      destinationAccountId: null,
      categoryId,
      timestamp: new Date().toISOString(),
      description: description || (isAnt ? 'Gasto Hormiga' : 'Gasto General'),
      tags: isAnt ? ['hormiga'] : [],
      isAntExpense: isAnt,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    // Actualizar balance de la cuenta seleccionada
    const accounts = state.accounts.map(acc => {
      if (acc.id === newEntry.sourceAccountId) {
        return {
          ...acc,
          currentBalance: acc.currentBalance - amount,
          updatedAt: new Date().toISOString(),
        };
      }
      return acc;
    });

    const updatedState: LocalState = {
      ...state,
      accounts,
      entries: [newEntry, ...state.entries],
      pendingSyncQueue: [...state.pendingSyncQueue, newEntry],
    };

    this.saveState(updatedState);
    return newEntry;
  }

  static deleteEntry(id: string) {
    const state = this.getState();
    const entryToDelete = state.entries.find(e => e.id === id);
    if (!entryToDelete) return;

    // Restaurar balance
    const accounts = state.accounts.map(acc => {
      if (acc.id === entryToDelete.sourceAccountId && entryToDelete.entryType === 'expense') {
        return {
          ...acc,
          currentBalance: acc.currentBalance + entryToDelete.amount,
          updatedAt: new Date().toISOString(),
        };
      }
      return acc;
    });

    const updatedState: LocalState = {
      ...state,
      accounts,
      entries: state.entries.filter(e => e.id !== id),
      pendingSyncQueue: state.pendingSyncQueue.filter(e => e.id !== id),
    };

    this.saveState(updatedState);
  }

  static depositToVault(vaultId: string, amount: number) {
    const state = this.getState();
    const updatedVaults = state.savingsVaults.map(v => {
      if (v.id === vaultId) {
        return {
          ...v,
          currentAmount: Math.min(v.targetAmount, v.currentAmount + amount)
        };
      }
      return v;
    });

    this.saveState({
      ...state,
      savingsVaults: updatedVaults
    });
  }

  static updateCategoryBudget(categoryId: string, newBudget: number) {
    const state = this.getState();
    const updatedCategories = state.categories.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          budgetMonthly: newBudget,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    this.saveState({
      ...state,
      categories: updatedCategories
    });
  }

  static setMonthlyIncomeEstimate(amount: number) {
    const state = this.getState();
    this.saveState({
      ...state,
      monthlyIncomeEstimate: amount,
    });
  }

  static getMetrics(): SafeToSpendMetrics {
    const state = this.getState();
    return SafeToSpendEngine.calculate({
      entries: state.entries,
      recurringRules: state.recurringRules,
      savingsVaults: state.savingsVaults,
      estimatedMonthlyIncome: state.monthlyIncomeEstimate,
    });
  }
}
