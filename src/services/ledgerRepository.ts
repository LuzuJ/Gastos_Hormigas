import { supabase } from '../config/supabase';
import { 
  JournalEntry, 
  Account, 
  Category, 
  Workspace, 
  CostCenter, 
  Contact,
  JournalEntryLine 
} from '../core/models/ledger';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_ERP_ENTRIES_PREFIX = 'gh_local_erp_entries_';

export class LedgerRepository {
  /**
   * Obtiene todos los workspaces accesibles por el usuario
   */
  static async fetchWorkspaces(): Promise<Workspace[]> {
    if (!supabase) return [];
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return [];

      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data) return [];

      return data.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        currency: row.currency,
        planTier: row.plan_tier,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Obtiene el plan de cuentas de un workspace
   */
  static async fetchAccounts(workspaceId: string): Promise<Account[]> {
    if (!supabase || !workspaceId) return [];
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        // Fallback a cuentas locales
        return this.getLocalAccounts(workspaceId);
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return this.getLocalAccounts(workspaceId);
      }

      return data.map((row) => ({
        id: row.id,
        workspaceId: row.workspace_id,
        code: row.code,
        name: row.name,
        type: row.type,
        subtype: row.subtype,
        initialBalance: Number(row.initial_balance),
        currentBalance: Number(row.current_balance),
        creditLimit: Number(row.credit_limit || 0),
        currency: row.currency,
        icon: row.icon || undefined,
        color: row.color || undefined,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch {
      return this.getLocalAccounts(workspaceId);
    }
  }

  private static getLocalAccounts(workspaceId: string): Account[] {
    return [
      { id: 'acc-cash', workspaceId, name: 'Caja Efectivo', type: 'asset', subtype: 'cash', initialBalance: 200, currentBalance: 200, currency: 'USD', icon: '💵', color: '#10B981', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'acc-bank', workspaceId, name: 'Banco Operativo', type: 'asset', subtype: 'bank', initialBalance: 3500, currentBalance: 3500, currency: 'USD', icon: '🏦', color: '#3B82F6', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'acc-exp', workspaceId, name: 'Gastos de Operación', type: 'expense', subtype: 'operating_expense', initialBalance: 0, currentBalance: 0, currency: 'USD', icon: '🛒', color: '#EF4444', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'acc-rev', workspaceId, name: 'Ingresos por Ventas', type: 'revenue', subtype: 'general', initialBalance: 0, currentBalance: 0, currency: 'USD', icon: '💰', color: '#8B5CF6', isActive: true, createdAt: '', updatedAt: '' },
    ];
  }

  /**
   * Obtiene categorías de un workspace
   */
  static async fetchCategories(workspaceId: string): Promise<Category[]> {
    if (!supabase || !workspaceId) return [];
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('name', { ascending: true });

      if (error || !data) return [];

      return data.map((row) => ({
        id: row.id,
        workspaceId: row.workspace_id,
        name: row.name,
        parentId: row.parent_id,
        icon: row.icon || '📦',
        color: row.color || '#10B981',
        budgetMonthly: Number(row.budget_monthly),
        isAntExpenseDefault: Boolean(row.is_ant_expense_default),
        isFavorite: Boolean(row.is_favorite),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Registra un gasto/ingreso simple mediante la función RPC atómica
   */
  static async recordSimpleEntry(params: {
    workspaceId: string;
    amount: number;
    entryType: 'expense' | 'income' | 'transfer';
    sourceAccountId?: string | null;
    destAccountId?: string | null;
    categoryId?: string | null;
    memo?: string;
    isAntExpense?: boolean;
    date?: string;
  }): Promise<{ entryId: string | null; error: string | null }> {
    if (!supabase) return { entryId: null, error: 'Supabase no inicializado' };

    try {
      const { data, error } = await supabase.rpc('record_simple_entry', {
        p_workspace_id: params.workspaceId,
        p_amount: params.amount,
        p_entry_type: params.entryType,
        p_source_account_id: params.sourceAccountId || null,
        p_dest_account_id: params.destAccountId || null,
        p_category_id: params.categoryId || null,
        p_memo: params.memo || null,
        p_is_ant: params.isAntExpense || false,
        p_date: params.date || new Date().toISOString().split('T')[0],
      });

      if (error) {
        return { entryId: null, error: error.message };
      }

      return { entryId: data, error: null };
    } catch (err: any) {
      return { entryId: null, error: err.message || 'Error de red desconocido' };
    }
  }

  /**
   * Registra un Asiento Contable de Partida Doble (Modo ERP)
   * Soporta tanto Supabase Auth como persistencia local offline / invitado
   */
  static async recordJournalEntry(params: {
    workspaceId: string;
    entryDate: string;
    memo: string;
    isAntExpense?: boolean;
    lines: JournalEntryLine[];
  }): Promise<{ entryId: string | null; error: string | null }> {
    const totalDebit = params.lines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
    const totalCredit = params.lines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      return { entryId: null, error: `Asiento desbalanceado: Total Debe (${totalDebit.toFixed(2)}) != Total Haber (${totalCredit.toFixed(2)})` };
    }

    // Si hay usuario autenticado en Supabase y el workspace es un UUID válido
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.workspaceId);

    if (supabase && isValidUUID) {
      try {
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user) {
          const { data: entryData, error: entryError } = await supabase
            .from('journal_entries')
            .insert({
              workspace_id: params.workspaceId,
              entry_date: params.entryDate,
              entry_type: 'manual_journal',
              memo: params.memo,
              is_ant_expense: params.isAntExpense || false,
              status: 'posted',
              created_by: userData.user.id,
            })
            .select('id')
            .single();

          if (!entryError && entryData) {
            const linesToInsert = params.lines.map((l) => ({
              entry_id: entryData.id,
              account_id: l.accountId,
              category_id: l.categoryId || null,
              cost_center_id: l.costCenterId || null,
              contact_id: l.contactId || null,
              description: l.description || params.memo,
              debit: l.debit || 0,
              credit: l.credit || 0,
            }));

            await supabase.from('journal_entry_lines').insert(linesToInsert);
            return { entryId: entryData.id, error: null };
          }
        }
      } catch (err) {
        console.warn('Fallo guardado remoto en Supabase, guardando localmente:', err);
      }
    }

    // Persistencia Local garantizada
    try {
      const entryId = 'entry-' + uuidv4().substring(0, 8);
      const newEntry: JournalEntry = {
        id: entryId,
        workspaceId: params.workspaceId,
        entryNumber: Date.now() % 10000,
        entryDate: params.entryDate,
        timestamp: new Date().toISOString(),
        entryType: 'manual_journal',
        amount: totalDebit,
        description: params.memo,
        memo: params.memo,
        tags: [],
        isAntExpense: params.isAntExpense || false,
        status: 'posted',
        lines: params.lines,
        createdAt: new Date().toISOString(),
        syncStatus: 'synced',
      };

      const existing = this.getLocalJournalEntries(params.workspaceId);
      const updated = [newEntry, ...existing];
      localStorage.setItem(LOCAL_ERP_ENTRIES_PREFIX + params.workspaceId, JSON.stringify(updated));

      return { entryId, error: null };
    } catch (err: any) {
      return { entryId: null, error: err.message || 'Error guardando en almacenamiento local' };
    }
  }

  /**
   * Obtiene el historial de asientos y líneas del libro diario
   */
  static async fetchJournalEntries(workspaceId: string, limit: number = 50): Promise<JournalEntry[]> {
    if (!workspaceId) return [];

    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId);

    if (supabase && isValidUUID) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data, error } = await supabase
            .from('journal_entries')
            .select(`
              id,
              workspace_id,
              entry_number,
              entry_date,
              entry_type,
              memo,
              is_ant_expense,
              status,
              created_by,
              created_at,
              updated_at,
              journal_entry_lines (
                id,
                account_id,
                category_id,
                cost_center_id,
                contact_id,
                description,
                debit,
                credit
              )
            `)
            .eq('workspace_id', workspaceId)
            .order('entry_date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit);

          if (!error && data && data.length > 0) {
            return data.map((row: any) => {
              const lines = (row.journal_entry_lines || []).map((l: any) => ({
                id: l.id,
                entryId: row.id,
                accountId: l.account_id,
                categoryId: l.category_id,
                costCenterId: l.cost_center_id,
                contactId: l.contact_id,
                description: l.description,
                debit: Number(l.debit),
                credit: Number(l.credit),
              }));
              const totalAmount = lines.reduce((sum: number, l: any) => sum + (l.debit > 0 ? l.debit : 0), 0);

              return {
                id: row.id,
                workspaceId: row.workspace_id,
                entryNumber: row.entry_number,
                entryDate: row.entry_date,
                timestamp: row.created_at || new Date().toISOString(),
                entryType: row.entry_type,
                amount: totalAmount,
                description: row.memo || '',
                memo: row.memo || '',
                tags: [],
                isAntExpense: Boolean(row.is_ant_expense),
                status: row.status,
                lines,
                createdBy: row.created_by,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                syncStatus: 'synced' as const,
              };
            });
          }
        }
      } catch (err) {
        console.warn('Error obteniendo asientos remotos:', err);
      }
    }

    // Fallback a almacenamiento local del workspace
    return this.getLocalJournalEntries(workspaceId);
  }

  private static getLocalJournalEntries(workspaceId: string): JournalEntry[] {
    try {
      const raw = localStorage.getItem(LOCAL_ERP_ENTRIES_PREFIX + workspaceId);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  }
}
