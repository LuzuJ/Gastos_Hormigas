import type { Timestamp } from 'firebase/firestore';

// Interfaz para las categorías personalizadas
export interface Category {
  id: string;
  name: string;
  isDefault?: boolean; // Indica si es una categoría por defecto
  budget?: number;
  subcategories: SubCategory[];
  icon?: string; 
  color?: string; 
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
  lastPostedMonth?: string; 
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

export interface Asset {
  id: string;
  name: string;
  value: number;
  type: 'cash' | 'investment' | 'property'; // Tipos de ejemplo
  description?: string; // Descripción opcional del activo
  lastUpdated?: Timestamp; // Fecha de última actualización
}
export type AssetFormData = Omit<Asset, 'id' | 'lastUpdated'>;

export interface Liability {
  id: string;
  name: string;
  amount: number;
  originalAmount?: number; // Monto original de la deuda
  type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other';
  interestRate?: number; // Tasa de interés anual
  monthlyPayment?: number; // Pago mensual mínimo
  dueDate?: string; // Fecha de vencimiento (YYYY-MM-DD)
  description?: string; // Descripción adicional
  lastUpdated?: Timestamp; // Fecha de última actualización
}
export type LiabilityFormData = Omit<Liability, 'id' | 'lastUpdated'>;

// Nueva interfaz para pagos de deuda
export interface DebtPayment {
  id: string;
  liabilityId: string;
  amount: number;
  paymentDate: Timestamp;
  description?: string;
  paymentType: 'regular' | 'extra' | 'interest_only';
}

// Nueva interfaz para estrategias de pago de deudas
export interface DebtPaymentStrategy {
  id: string;
  name: string;
  type: 'snowball' | 'avalanche' | 'custom';
  priorityOrder: string[]; // IDs de deudas en orden de prioridad
  monthlyExtraBudget: number;
  isActive: boolean;
  description?: string;
  createdAt: Timestamp;
  lastUpdated: Timestamp;
}