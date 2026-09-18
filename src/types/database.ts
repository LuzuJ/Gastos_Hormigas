export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          display_name?: string | null;
          avatar_url: string | null;
          theme?: string | null;
          language?: string | null;
          currency?: string | null;
          default_workspace_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          theme?: string | null;
          language?: string | null;
          currency?: string | null;
          default_workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          theme?: string | null;
          language?: string | null;
          currency?: string | null;
          default_workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string | null;
          display_name?: string | null;
          full_name?: string | null;
          avatar_url: string | null;
          theme?: string | null;
          language?: string | null;
          currency?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          theme?: string | null;
          language?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          theme?: string | null;
          language?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          type: 'personal' | 'business';
          currency: string;
          plan_tier: 'free' | 'pro' | 'enterprise';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'personal' | 'business';
          currency?: string;
          plan_tier?: 'free' | 'pro' | 'enterprise';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'personal' | 'business';
          currency?: string;
          plan_tier?: 'free' | 'pro' | 'enterprise';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'accountant' | 'member';
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'accountant' | 'member';
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'accountant' | 'member';
          created_at?: string;
        };
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          workspace_id: string;
          code: string | null;
          name: string;
          type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
          subtype: 'cash' | 'bank' | 'credit_card' | 'savings_vault' | 'receivable' | 'payable' | 'general' | 'cost_of_goods' | 'operating_expense';
          currency: string;
          initial_balance: number;
          current_balance: number;
          credit_limit: number;
          icon: string | null;
          color: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          code?: string | null;
          name: string;
          type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
          subtype?: 'cash' | 'bank' | 'credit_card' | 'savings_vault' | 'receivable' | 'payable' | 'general' | 'cost_of_goods' | 'operating_expense';
          currency?: string;
          initial_balance?: number;
          current_balance?: number;
          credit_limit?: number;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          code?: string | null;
          name?: string;
          type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
          subtype?: 'cash' | 'bank' | 'credit_card' | 'savings_vault' | 'receivable' | 'payable' | 'general' | 'cost_of_goods' | 'operating_expense';
          currency?: string;
          initial_balance?: number;
          current_balance?: number;
          credit_limit?: number;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          parent_id: string | null;
          icon: string | null;
          color: string | null;
          budget_monthly: number;
          is_ant_expense_default: boolean;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          parent_id?: string | null;
          icon?: string | null;
          color?: string | null;
          budget_monthly?: number;
          is_ant_expense_default?: boolean;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          parent_id?: string | null;
          icon?: string | null;
          color?: string | null;
          budget_monthly?: number;
          is_ant_expense_default?: boolean;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cost_centers: {
        Row: {
          id: string;
          workspace_id: string;
          code: string;
          name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          code: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          code?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          tax_id: string | null;
          email: string | null;
          phone: string | null;
          type: 'vendor' | 'customer' | 'both';
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          tax_id?: string | null;
          email?: string | null;
          phone?: string | null;
          type?: 'vendor' | 'customer' | 'both';
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          tax_id?: string | null;
          email?: string | null;
          phone?: string | null;
          type?: 'vendor' | 'customer' | 'both';
          created_at?: string;
        };
        Relationships: [];
      };
      journal_entries: {
        Row: {
          id: string;
          workspace_id: string;
          entry_number: number;
          entry_date: string;
          entry_type: 'simple_expense' | 'simple_income' | 'simple_transfer' | 'manual_journal' | 'recurring';
          memo: string | null;
          is_ant_expense: boolean;
          status: 'draft' | 'posted' | 'void';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          entry_number?: number;
          entry_date?: string;
          entry_type?: 'simple_expense' | 'simple_income' | 'simple_transfer' | 'manual_journal' | 'recurring';
          memo?: string | null;
          is_ant_expense?: boolean;
          status?: 'draft' | 'posted' | 'void';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          entry_number?: number;
          entry_date?: string;
          entry_type?: 'simple_expense' | 'simple_income' | 'simple_transfer' | 'manual_journal' | 'recurring';
          memo?: string | null;
          is_ant_expense?: boolean;
          status?: 'draft' | 'posted' | 'void';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      journal_entry_lines: {
        Row: {
          id: string;
          entry_id: string;
          account_id: string;
          category_id: string | null;
          cost_center_id: string | null;
          contact_id: string | null;
          description: string | null;
          debit: number;
          credit: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          account_id: string;
          category_id?: string | null;
          cost_center_id?: string | null;
          contact_id?: string | null;
          description?: string | null;
          debit?: number;
          credit?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          entry_id?: string;
          account_id?: string;
          category_id?: string | null;
          cost_center_id?: string | null;
          contact_id?: string | null;
          description?: string | null;
          debit?: number;
          credit?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      recurring_rules: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          amount: number;
          entry_type: 'expense' | 'income' | 'transfer';
          source_account_id: string | null;
          destination_account_id: string | null;
          category_id: string | null;
          frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
          day_of_month: number | null;
          next_run_at: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          amount: number;
          entry_type: 'expense' | 'income' | 'transfer';
          source_account_id?: string | null;
          destination_account_id?: string | null;
          category_id?: string | null;
          frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
          day_of_month?: number | null;
          next_run_at: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          amount?: number;
          entry_type?: 'expense' | 'income' | 'transfer';
          source_account_id?: string | null;
          destination_account_id?: string | null;
          category_id?: string | null;
          frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
          day_of_month?: number | null;
          next_run_at?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      savings_vaults: {
        Row: {
          id: string;
          workspace_id: string;
          account_id: string | null;
          name: string;
          target_amount: number;
          current_amount: number;
          target_date: string | null;
          icon: string | null;
          color: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          account_id?: string | null;
          name: string;
          target_amount: number;
          current_amount?: number;
          target_date?: string | null;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          account_id?: string | null;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          target_date?: string | null;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      record_simple_entry: {
        Args: {
          p_workspace_id: string;
          p_amount: number;
          p_entry_type: 'expense' | 'income' | 'transfer';
          p_source_account_id?: string | null;
          p_dest_account_id?: string | null;
          p_category_id?: string | null;
          p_memo?: string | null;
          p_is_ant?: boolean;
          p_date?: string;
        };
        Returns: string;
      };
      user_has_workspace_access: {
        Args: {
          ws_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Aliases de compatibilidad
export type SupabaseUser = Database['public']['Tables']['profiles']['Row'];
export type SupabaseProfile = Database['public']['Tables']['profiles']['Row'];
export type SupabaseAccount = Database['public']['Tables']['accounts']['Row'];
export type SupabaseCategory = Database['public']['Tables']['categories']['Row'];
export type SupabaseSubcategory = Database['public']['Tables']['categories']['Row'];
export type SupabaseWorkspace = Database['public']['Tables']['workspaces']['Row'];
export type SupabaseJournalEntry = Database['public']['Tables']['journal_entries']['Row'];
export type SupabaseJournalLine = Database['public']['Tables']['journal_entry_lines']['Row'];
export type SupabaseRecurringRule = Database['public']['Tables']['recurring_rules']['Row'];
export type SupabaseSavingsVault = Database['public']['Tables']['savings_vaults']['Row'];
