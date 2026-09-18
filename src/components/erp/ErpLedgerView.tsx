import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { LedgerRepository } from '../../services/ledgerRepository';
import { Account, JournalEntry, JournalEntryLine, CostCenter, Contact } from '../../core/models/ledger';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Building2, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { supabase } from '../../config/supabase';

export const ErpLedgerView: React.FC = () => {
  const { activeWorkspace } = useWorkspace();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([
    { id: 'acc-cash', workspaceId: 'local', name: 'Caja Efectivo', type: 'asset', subtype: 'cash', initialBalance: 200, currentBalance: 200, currency: 'USD', icon: '💵', isActive: true, createdAt: '', updatedAt: '' },
    { id: 'acc-bank', workspaceId: 'local', name: 'Banco Operativo', type: 'asset', subtype: 'bank', initialBalance: 3500, currentBalance: 3500, currency: 'USD', icon: '🏦', isActive: true, createdAt: '', updatedAt: '' },
    { id: 'acc-exp', workspaceId: 'local', name: 'Gastos de Operación', type: 'expense', subtype: 'operating_expense', initialBalance: 0, currentBalance: 0, currency: 'USD', icon: '🛒', isActive: true, createdAt: '', updatedAt: '' },
    { id: 'acc-rev', workspaceId: 'local', name: 'Ingresos por Ventas', type: 'revenue', subtype: 'general', initialBalance: 0, currentBalance: 0, currency: 'USD', icon: '💰', isActive: true, createdAt: '', updatedAt: '' },
  ]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modales
  const [isQuickExpenseModalOpen, setIsQuickExpenseModalOpen] = useState(false);
  const [isAdvancedJournalModalOpen, setIsAdvancedJournalModalOpen] = useState(false);

  // Form State para Gasto Rápido de Negocio
  const [quickAmount, setQuickAmount] = useState('');
  const [quickType, setQuickType] = useState<'expense' | 'income'>('expense');
  const [quickSourceAccount, setQuickSourceAccount] = useState('');
  const [quickConcept, setQuickConcept] = useState('');
  const [quickVendor, setQuickVendor] = useState('');
  const [quickError, setQuickError] = useState<string | null>(null);

  // Form State para Asiento Contable Avanzado
  const [memo, setMemo] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState<JournalEntryLine[]>([
    { accountId: '', description: '', debit: 0, credit: 0 },
    { accountId: '', description: '', debit: 0, credit: 0 },
  ]);
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>('');
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const [accs, jEntries] = await Promise.all([
        LedgerRepository.fetchAccounts(activeWorkspace.id),
        LedgerRepository.fetchJournalEntries(activeWorkspace.id, 50),
      ]);
      if (accs.length > 0) setAccounts(accs);
      setEntries(jEntries);

      if (supabase) {
        const { data: ccData } = await supabase.from('cost_centers').select('*').eq('workspace_id', activeWorkspace.id);
        if (ccData) setCostCenters(ccData as any);

        const { data: ctData } = await supabase.from('contacts').select('*').eq('workspace_id', activeWorkspace.id);
        if (ctData) setContacts(ctData as any);
      }
    } catch (err) {
      console.error('Error cargando datos ERP:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspace?.id]);

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

  const handleAddLine = () => {
    setLines([...lines, { accountId: '', description: '', debit: 0, credit: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof JournalEntryLine, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  // Registro Simple / Rápido de Negocio
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError(null);
    if (!activeWorkspace) {
      setQuickError('No hay un workspace activo seleccionado.');
      return;
    }
    const amountNum = parseFloat(quickAmount);
    if (!amountNum || amountNum <= 0) {
      setQuickError('Por favor ingresa un monto válido mayor a 0.');
      return;
    }

    setIsSubmitting(true);
    const assetAccount = accounts.find((a) => a.id === quickSourceAccount) 
      || accounts.find((a) => a.type === 'asset') 
      || accounts[0] 
      || { id: 'acc-cash', name: 'Caja Efectivo', type: 'asset', currentBalance: 0 };

    const expenseAccount = accounts.find((a) => a.type === 'expense') 
      || { id: 'acc-exp', name: 'Gastos de Operación', type: 'expense', currentBalance: 0 };

    const revenueAccount = accounts.find((a) => a.type === 'revenue') 
      || { id: 'acc-rev', name: 'Ingresos por Ventas', type: 'revenue', currentBalance: 0 };

    const generatedLines: JournalEntryLine[] = quickType === 'expense' ? [
      { accountId: expenseAccount.id, description: quickConcept || 'Gasto de Negocio', debit: amountNum, credit: 0 },
      { accountId: assetAccount.id, description: quickConcept || 'Pago desde ' + assetAccount.name, debit: 0, credit: amountNum },
    ] : [
      { accountId: assetAccount.id, description: quickConcept || 'Ingreso a ' + assetAccount.name, debit: amountNum, credit: 0 },
      { accountId: revenueAccount.id, description: quickConcept || 'Venta / Ingreso', debit: 0, credit: amountNum },
    ];

    const result = await LedgerRepository.recordJournalEntry({
      workspaceId: activeWorkspace.id,
      entryDate: new Date().toISOString().split('T')[0],
      memo: quickConcept ? `${quickConcept}${quickVendor ? ` (${quickVendor})` : ''}` : (quickType === 'expense' ? 'Gasto Operativo' : 'Venta Registrada'),
      lines: generatedLines,
    });

    setIsSubmitting(false);

    if (result.error) {
      setQuickError(result.error);
      return;
    }

    // Actualizar estado local inmediato
    const newEntry: JournalEntry = {
      id: result.entryId || 'local-' + Date.now(),
      workspaceId: activeWorkspace.id,
      entryNumber: entries.length + 1,
      entryDate: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      entryType: quickType === 'expense' ? 'simple_expense' : 'simple_income',
      amount: amountNum,
      description: quickConcept || (quickType === 'expense' ? 'Gasto de Negocio' : 'Venta / Ingreso'),
      memo: quickConcept,
      tags: [],
      isAntExpense: false,
      status: 'posted',
      lines: generatedLines,
      createdAt: new Date().toISOString(),
      syncStatus: 'synced',
    };
    setEntries([newEntry, ...entries]);

    // Actualizar balances
    setAccounts(accounts.map((acc) => {
      if (acc.id === assetAccount.id) {
        return {
          ...acc,
          currentBalance: quickType === 'expense' ? acc.currentBalance - amountNum : acc.currentBalance + amountNum,
        };
      }
      return acc;
    }));

    setIsQuickExpenseModalOpen(false);
    setQuickAmount('');
    setQuickConcept('');
    setQuickVendor('');
  };

  // Registro Avanzado
  const handleAdvancedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!activeWorkspace || !isBalanced) {
      setFormError(`El asiento no está balanceado. Total Debe (${totalDebit.toFixed(2)}) != Total Haber (${totalCredit.toFixed(2)})`);
      return;
    }

    setIsSubmitting(true);
    const enrichedLines = lines.map((l) => ({
      ...l,
      costCenterId: selectedCostCenter || null,
      contactId: selectedContact || null,
    }));

    const result = await LedgerRepository.recordJournalEntry({
      workspaceId: activeWorkspace.id,
      entryDate,
      memo: memo.trim() || 'Asiento Contable',
      lines: enrichedLines,
    });

    setIsSubmitting(false);

    if (result.error) {
      setFormError(result.error);
    } else {
      setIsAdvancedJournalModalOpen(false);
      setMemo('');
      setLines([
        { accountId: '', description: '', debit: 0, credit: 0 },
        { accountId: '', description: '', debit: 0, credit: 0 },
      ]);
      loadData();
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px', color: '#fff' }}>
      {/* Header ERP */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={28} color="#818CF8" />
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>
              Panel Financiero & Contable (ERP)
            </h1>
          </div>
          <p style={{ margin: '4px 0 0 0', color: '#A1A1AA', fontSize: '0.85rem' }}>
            Partida Doble Automática • Espacio: <strong style={{ color: '#818CF8' }}>{activeWorkspace?.name}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsQuickExpenseModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Plus size={18} />
            + Registrar Gasto / Venta Fácil
          </button>

          <button
            onClick={() => setIsAdvancedJournalModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#818CF8',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <SlidersHorizontal size={16} />
            Modo Asiento Manual
          </button>
        </div>
      </div>

      {/* Cuentas y Balances */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {accounts.map((acc) => (
          <div
            key={acc.id}
            style={{
              background: 'rgba(24, 24, 27, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '16px',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#A1A1AA', fontWeight: 600 }}>{acc.name}</span>
              <span>{acc.icon || '💳'}</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: acc.currentBalance >= 0 ? '#34D399' : '#F87171' }}>
              ${acc.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#71717A', marginTop: '4px', textTransform: 'capitalize' }}>
              Tipo: {acc.type}
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de Movimientos / Asientos */}
      <div
        style={{
          background: 'rgba(24, 24, 27, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Historial de Movimientos Contables ({entries.length})</h3>
          <button
            onClick={loadData}
            style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} /> Recargar
          </button>
        </div>

        {entries.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#71717A' }}>
            No hay movimientos contables en este espacio. Haz clic en <strong>"+ Registrar Gasto / Venta Fácil"</strong> arriba.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#A1A1AA' }}>
                  <th style={{ padding: '12px 16px' }}>#</th>
                  <th style={{ padding: '12px 16px' }}>Fecha</th>
                  <th style={{ padding: '12px 16px' }}>Concepto</th>
                  <th style={{ padding: '12px 16px' }}>Partida Doble (Cuentas)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => {
                  const debitSum = (entry.lines || []).reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
                  const isExp = entry.entryType.includes('expense');

                  return (
                    <tr
                      key={entry.id || idx}
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                    >
                      <td style={{ padding: '12px 16px', color: '#818CF8', fontWeight: 600 }}>
                        #{entry.entryNumber || (idx + 1)}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#D4D4D8' }}>{entry.entryDate || entry.timestamp?.split('T')[0]}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                        {entry.memo || entry.description}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {(entry.lines || []).map((l, i) => {
                            const acc = accounts.find((a) => a.id === l.accountId);
                            return (
                              <div key={i} style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>
                                <span style={{ color: '#E4E4E7' }}>{acc?.name || 'Cuenta'}:</span>{' '}
                                {l.debit > 0 ? (
                                  <span style={{ color: '#10B981' }}>+${l.debit.toFixed(2)} (Debe)</span>
                                ) : (
                                  <span style={{ color: '#818CF8' }}>-${l.credit.toFixed(2)} (Haber)</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: isExp ? '#EF4444' : '#10B981' }}>
                        {isExp ? '-' : '+'}${debitSum.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontWeight: 700 }}>
                          CUADRADO
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Gasto / Ingreso Rápido de Negocio (FÁCIL) */}
      {isQuickExpenseModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(8px)',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#18181B',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Registrar Movimiento de Negocio</h3>
              <button
                onClick={() => setIsQuickExpenseModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#A1A1AA', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {quickError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #EF4444',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#FCA5A5',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                {quickError}
              </div>
            )}

            <form onSubmit={handleQuickSubmit}>
              {/* Selector Tipo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div
                  onClick={() => setQuickType('expense')}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: `1px solid ${quickType === 'expense' ? '#EF4444' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: quickType === 'expense' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: quickType === 'expense' ? '#F87171' : '#A1A1AA',
                  }}
                >
                  <ArrowUpRight size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Gasto de Negocio
                </div>
                <div
                  onClick={() => setQuickType('income')}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: `1px solid ${quickType === 'income' ? '#10B981' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: quickType === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: quickType === 'income' ? '#34D399' : '#A1A1AA',
                  }}
                >
                  <ArrowDownLeft size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Venta / Ingreso
                </div>
              </div>

              {/* Monto */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#A1A1AA', marginBottom: '6px' }}>
                  Monto ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#27272A',
                    border: '1px solid #6366F1',
                    color: '#fff',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Cuenta de dinero */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#A1A1AA', marginBottom: '6px' }}>
                  {quickType === 'expense' ? '¿De qué cuenta sale el dinero?' : '¿A qué cuenta entra el dinero?'}
                </label>
                <select
                  value={quickSourceAccount}
                  onChange={(e) => setQuickSourceAccount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#27272A',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                >
                  {accounts.filter((a) => a.type === 'asset' || a.subtype === 'cash' || a.subtype === 'bank').map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (Saldo: ${acc.currentBalance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Concepto */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#A1A1AA', marginBottom: '6px' }}>
                  Concepto / Descripción
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pago de nómina, Servidores AWS, Venta cliente X..."
                  value={quickConcept}
                  onChange={(e) => setQuickConcept(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#27272A',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Proveedor / Cliente */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#A1A1AA', marginBottom: '6px' }}>
                  Proveedor / Cliente (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Amazon, Proveedor Local, Factura #102..."
                  value={quickVendor}
                  onChange={(e) => setQuickVendor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#27272A',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsQuickExpenseModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#A1A1AA', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !quickAmount}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar y Cuadrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Asiento Contable Avanzado (Modo Contador) */}
      {isAdvancedJournalModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(8px)',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#18181B',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Asiento Contable Detallado (Debe / Haber)</h3>
              <button
                onClick={() => setIsAdvancedJournalModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#A1A1AA', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '10px', padding: '10px 14px', color: '#FCA5A5', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleAdvancedSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#A1A1AA', marginBottom: '6px' }}>
                    Glosa / Descripción
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Reclasificación de saldo..."
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#27272A', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#A1A1AA', marginBottom: '6px' }}>
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#27272A', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Líneas */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D4D4D8' }}>Líneas de Asiento</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    style={{ background: 'transparent', border: 'none', color: '#818CF8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + Añadir Fila
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {lines.map((line, idx) => (
                    <div
                      key={idx}
                      style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '8px', borderRadius: '10px' }}
                    >
                      <select
                        required
                        value={line.accountId}
                        onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                        style={{ padding: '8px', borderRadius: '8px', background: '#27272A', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '0.8rem' }}
                      >
                        <option value="">Seleccionar Cuenta...</option>
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.type})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Debe ($)"
                        value={line.debit || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleLineChange(idx, 'debit', val);
                          if (val > 0) handleLineChange(idx, 'credit', 0);
                        }}
                        style={{ padding: '8px', borderRadius: '8px', background: '#27272A', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#10B981', fontSize: '0.8rem', textAlign: 'right' }}
                      />

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Haber ($)"
                        value={line.credit || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleLineChange(idx, 'credit', val);
                          if (val > 0) handleLineChange(idx, 'debit', 0);
                        }}
                        style={{ padding: '8px', borderRadius: '8px', background: '#27272A', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#818CF8', fontSize: '0.8rem', textAlign: 'right' }}
                      />

                      <button
                        type="button"
                        disabled={lines.length <= 2}
                        onClick={() => handleRemoveLine(idx)}
                        style={{ background: 'transparent', border: 'none', color: lines.length <= 2 ? '#52525B' : '#EF4444', cursor: lines.length <= 2 ? 'not-allowed' : 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Balance Checker */}
              <div style={{ background: isBalanced ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${isBalanced ? '#10B981' : '#EF4444'}`, borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isBalanced ? '#34D399' : '#F87171' }}>
                  {isBalanced ? '✓ Asiento Cuadrado' : '✗ Asiento Descuadrado'}
                </span>
                <div style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: '#10B981', marginRight: '10px' }}>Debe: ${totalDebit.toFixed(2)}</span>
                  <span style={{ color: '#818CF8' }}>Haber: ${totalCredit.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAdvancedJournalModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#A1A1AA', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isBalanced}
                  style={{ padding: '10px 24px', borderRadius: '10px', background: isBalanced ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : '#3F3F46', border: 'none', color: '#fff', fontWeight: 700, cursor: isBalanced ? 'pointer' : 'not-allowed' }}
                >
                  {isSubmitting ? 'Guardando...' : 'Publicar Asiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
