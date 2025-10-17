// Tipos de base de datos generados automáticamente para Supabase
// Estos tipos representan la estructura exacta de las tablas en PostgreSQL

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string;
          email: string | null;
          currency: 'USD' | 'EUR';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          email?: string | null;
          currency?: 'USD' | 'EUR';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          email?: string | null;
          currency?: 'USD' | 'EUR';
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string | null;
          color: string | null;
          is_default: boolean;
          budget: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string | null;
          color?: string | null;
          is_default?: boolean;
          budget?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string | null;
          color?: string | null;
          is_default?: boolean;
          budget?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subcategories: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_sources: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'cash' | 'checking' | 'savings' | 'credit_card' | 'debit_card' | 'loan' | 'income_salary' | 'income_extra' | 'investment' | 'other';
          balance: number;
          description: string | null;
          is_active: boolean;
          icon: string | null;
          color: string | null;
          auto_update: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: 'cash' | 'checking' | 'savings' | 'credit_card' | 'debit_card' | 'loan' | 'income_salary' | 'income_extra' | 'investment' | 'other';
          balance?: number;
          description?: string | null;
          is_active?: boolean;
          icon?: string | null;
          color?: string | null;
          auto_update?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: 'cash' | 'checking' | 'savings' | 'credit_card' | 'debit_card' | 'loan' | 'income_salary' | 'income_extra' | 'investment' | 'other';
          balance?: number;
          description?: string | null;
          is_active?: boolean;
          icon?: string | null;
          color?: string | null;
          auto_update?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          category_id: string;
          sub_category: string;
          payment_source_id: string | null;
          balance_after_transaction: number | null;
          is_automatic: boolean;
          parent_transaction_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          amount: number;
          category_id: string;
          sub_category: string;
          payment_source_id?: string | null;
          balance_after_transaction?: number | null;
          is_automatic?: boolean;
          parent_transaction_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          amount?: number;
          category_id?: string;
          sub_category?: string;
          payment_source_id?: string | null;
          balance_after_transaction?: number | null;
          is_automatic?: boolean;
          parent_transaction_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      fixed_expenses: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          category: string;
          day_of_month: number;
          last_posted_month: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          amount: number;
          category: string;
          day_of_month: number;
          last_posted_month?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          amount?: number;
          category?: string;
          day_of_month?: number;
          last_posted_month?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      financials: {
        Row: {
          id: string;
          user_id: string;
          monthly_income: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          monthly_income?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          monthly_income?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          value: number;
          type: 'cash' | 'investment' | 'property';
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          value: number;
          type: 'cash' | 'investment' | 'property';
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          value?: number;
          type?: 'cash' | 'investment' | 'property';
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      liabilities: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          original_amount: number | null;
          type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other';
          interest_rate: number | null;
          monthly_payment: number | null;
          duration: number | null;
          due_date: string | null;
          description: string | null;
          is_archived: boolean;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          original_amount?: number | null;
          type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other';
          interest_rate?: number | null;
          monthly_payment?: number | null;
          duration?: number | null;
          due_date?: string | null;
          description?: string | null;
          is_archived?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          original_amount?: number | null;
          type?: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other';
          interest_rate?: number | null;
          monthly_payment?: number | null;
          duration?: number | null;
          due_date?: string | null;
          description?: string | null;
          is_archived?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      debt_payments: {
        Row: {
          id: string;
          user_id: string;
          liability_id: string;
          amount: number;
          payment_date: string;
          description: string | null;
          payment_type: 'regular' | 'extra' | 'interest_only';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          liability_id: string;
          amount: number;
          payment_date: string;
          description?: string | null;
          payment_type?: 'regular' | 'extra' | 'interest_only';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          liability_id?: string;
          amount?: number;
          payment_date?: string;
          description?: string | null;
          payment_type?: 'regular' | 'extra' | 'interest_only';
          created_at?: string;
          updated_at?: string;
        };
      };
      // Agregar más tablas según sea necesario...
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      initialize_default_categories: {
        Args: { user_id: string };
        Returns: void;
      };
      // Agregar más funciones según sea necesario...
    };
    Enums: {
      payment_source_type: 'cash' | 'checking' | 'savings' | 'credit_card' | 'debit_card' | 'loan' | 'income_salary' | 'income_extra' | 'investment' | 'other';
      asset_type: 'cash' | 'investment' | 'property';
      liability_type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other';
      debt_payment_type: 'regular' | 'extra' | 'interest_only';
      recurring_frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
      income_category: 'salary' | 'freelance' | 'business' | 'investment' | 'other';
      transaction_type: 'income' | 'expense';
      transaction_history_type: 'income' | 'expense' | 'transfer';
      alert_type: 'low_balance' | 'upcoming_payment' | 'debt_reminder' | 'budget_exceeded' | 'savings_opportunity' | 'income_received' | 'goal_achieved';
      alert_severity: 'low' | 'medium' | 'high' | 'critical';
      achievement_category: 'budget' | 'savings' | 'debt' | 'income' | 'general';
      achievement_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
      achievement_requirement_type: 'budget_streak' | 'savings_goal' | 'debt_payment' | 'expense_reduction' | 'income_increase' | 'net_worth_growth';
      achievement_period: 'monthly' | 'yearly' | 'total';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Tipos de utilidad para trabajar con Supabase
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Alias de tipos para facilitar el uso
export type SupabaseUser = Tables<'users'>;
export type SupabaseCategory = Tables<'categories'>;
export type SupabaseSubcategory = Tables<'subcategories'>;
export type SupabaseExpense = Tables<'expenses'>;
export type SupabasePaymentSource = Tables<'payment_sources'>;
export type SupabaseFixedExpense = Tables<'fixed_expenses'>;
export type SupabaseFinancials = Tables<'financials'>;
export type SupabaseSavingsGoal = Tables<'savings_goals'>;
export type SupabaseAsset = Tables<'assets'>;
export type SupabaseLiability = Tables<'liabilities'>;
export type SupabaseDebtPayment = Tables<'debt_payments'>;
