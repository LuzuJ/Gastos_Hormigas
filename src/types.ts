import type { Timestamp } from 'firebase/firestore';

// Interfaz para las categorías personalizadas
export interface Category {
  id: string;
  name: string;
  isDefault?: boolean; // Indica si es una categoría por defecto
  budget?: number;
  subcategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
}

// Interfaz para cada gasto
export interface Expense {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  subCategory: string;
  createdAt: Timestamp | null;
}

export interface Financials {
  monthlyIncome: number;
}

export interface LayoutProps {
    children: React.ReactNode;
    currentPage: 'dashboard' | 'categories';
    setCurrentPage: React.Dispatch<React.SetStateAction<'dashboard' | 'categories'>>;
}

export interface FixedExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  dayOfMonth: number; 
  lastPostedMonth?: string; // Formato "YYYY-MM", ej: "2025-07"
}

export type ExpenseFormData = {
  description: string;
  amount: number;
  categoryId: string;
  subCategory: string;
  createdAt: Timestamp;
};

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export type SavingsGoalFormData = Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>;

export interface UserProfile {
  displayName: string;
  email: string;
  currency: 'USD' | 'EUR' ; // Puedes añadir más monedas en el futuro
}