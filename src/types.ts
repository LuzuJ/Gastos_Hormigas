import type { Timestamp } from 'firebase/firestore';

// Interfaz para las categorías personalizadas
export interface Category {
  id: string;
  name: string;
}

// Interfaz para cada gasto
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  createdAt: Timestamp;
}

export interface LayoutProps {
    children: React.ReactNode;
    currentPage: 'dashboard' | 'categories';
    setCurrentPage: React.Dispatch<React.SetStateAction<'dashboard' | 'categories'>>;
}

// Tipo de dato para el formulario, omitiendo campos generados automáticamente
export type ExpenseFormData = Omit<Expense, 'id' | 'createdAt'>;