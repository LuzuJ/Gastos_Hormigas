export type WorkspaceType = 'personal' | 'business';
export type WorkspaceRole = 'owner' | 'admin' | 'accountant' | 'member';

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  currency: string;
  planTier: 'free' | 'pro' | 'enterprise';
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'credit_card';
export type AccountSubtype = 'cash' | 'bank' | 'credit_card' | 'savings_vault' | 'receivable' | 'payable' | 'general' | 'cost_of_goods' | 'operating_expense';

export interface Account {
  id: string;
  workspaceId?: string;
  userId?: string;
  code?: string | null;
  name: string;
  type: AccountType;
  subtype?: AccountSubtype;
  initialBalance: number;
  currentBalance: number;
  creditLimit?: number;
  currency: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  workspaceId?: string;
  userId?: string;
  name: string;
  parentId?: string | null;
  icon: string;
  color: string;
  budgetMonthly: number;
  isAntExpenseDefault?: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CostCenter {
  id: string;
  workspaceId: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Contact {
  id: string;
  workspaceId: string;
  name: string;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
  type: 'vendor' | 'customer' | 'both';
  createdAt: string;
}

export type EntryType = 
  | 'expense' 
  | 'income' 
  | 'transfer' 
  | 'simple_expense' 
  | 'simple_income' 
  | 'simple_transfer' 
  | 'manual_journal' 
  | 'recurring';

export type EntryStatus = 'draft' | 'posted' | 'void';

export interface JournalEntryLine {
  id?: string;
  entryId?: string;
  accountId: string;
  accountName?: string;
  categoryId?: string | null;
  costCenterId?: string | null;
  contactId?: string | null;
  description?: string | null;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  workspaceId?: string;
  userId?: string;
  entryNumber?: number;
  entryDate?: string;
  timestamp: string;
  entryType: EntryType;
  amount: number;
  sourceAccountId?: string | null;
  destinationAccountId?: string | null;
  categoryId?: string | null;
  description: string;
  memo?: string;
  tags: string[];
  isAntExpense: boolean;
  status?: EntryStatus;
  lines?: JournalEntryLine[];
  createdBy?: string | null;
  createdAt: string;
  updatedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'failed';
}

export interface RecurringRule {
  id: string;
  workspaceId?: string;
  userId?: string;
  name: string;
  amount: number;
  entryType: 'expense' | 'income' | 'transfer';
  sourceAccountId?: string | null;
  destinationAccountId?: string | null;
  categoryId?: string | null;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  dayOfMonth?: number;
  nextRunAt: string;
  isActive: boolean;
}

export interface SavingsVault {
  id: string;
  workspaceId?: string;
  userId?: string;
  accountId?: string | null;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

export interface SafeToSpendMetrics {
  dailySafeToSpend: number;
  totalMonthlyIncome: number;
  fixedMonthlyCommitments: number;
  savingsTargetMonthly: number;
  spentSoFarThisMonth: number;
  remainingPoolThisMonth: number;
  daysRemainingInMonth: number;
  antExpensesTotalMonth: number;
  antExpensesCount: number;
  burnRatePercentage: number;
}
