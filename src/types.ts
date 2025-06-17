import type { Timestamp } from 'firebase/firestore';

// Interfaz para las categorías personalizadas
export interface Category {
  id: string;
  name: string;
  isDefault?: boolean; // Indica si es una categoría por defecto
}

// Interfaz para cada gasto
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  createdAt: Timestamp;
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
  dayOfMonth: number; // El día del mes que se cobra (ej. 1, 15, 30)
}

// Tipo de dato para el formulario, omitiendo campos generados automáticamente
export type ExpenseFormData = Omit<Expense, 'id' | 'createdAt'>;