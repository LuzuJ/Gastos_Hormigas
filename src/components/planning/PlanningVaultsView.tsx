import React from 'react';
import { SavingsVault, Account } from '../../core/models/ledger';
import { Target, PiggyBank, CreditCard, Plus, Check } from 'lucide-react';

interface PlanningVaultsViewProps {
  vaults: SavingsVault[];
  accounts: Account[];
  onDepositToVault?: (vaultId: string, amount: number) => void;
}

const DEFAULT_VAULTS: SavingsVault[] = [
  { id: 'v-1', userId: 'local', name: 'Fondo de Emergencia (3 Meses)', targetAmount: 2500, currentAmount: 850, targetDate: '2026-12-31', icon: '🛡️', color: '#10b981', isActive: true },
  { id: 'v-2', userId: 'local', name: 'Vacaciones / Viaje', targetAmount: 800, currentAmount: 420, targetDate: '2026-11-15', icon: '✈️', color: '#38bdf8', isActive: true },
  { id: 'v-3', userId: 'local', name: 'Inversión & Educación', targetAmount: 1200, currentAmount: 300, targetDate: '2027-02-28', icon: '📚', color: '#8b5cf6', isActive: true },
];

export const PlanningVaultsView: React.FC<PlanningVaultsViewProps> = ({
  vaults,
  accounts,
  onDepositToVault,
}) => {
  const activeVaults = vaults.length > 0 ? vaults : DEFAULT_VAULTS;
  const totalSaved = activeVaults.reduce((sum, v) => sum + v.currentAmount, 0);
  const totalTarget = activeVaults.reduce((sum, v) => sum + v.targetAmount, 0);
  const globalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const debtAccounts = accounts.filter(a => a.type === 'credit_card' || a.type === 'liability');

  return (
    <div className="animate-pop-in" style={{ maxWidth: '520px', margin: '0 auto' }}>
      {/* Top Vault Summary Card */}
      <div className="glass-card" style={{
        padding: '24px',
        marginBottom: '16px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              padding: '8px',
              borderRadius: '12px'
            }}>
              <PiggyBank size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Bóvedas de Ahorro & Metas
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                Protección contra imprevistos y capitalización
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 800,
            color: '#10b981'
          }}>
            {globalProgress.toFixed(0)}% Completado
          </div>
        </div>

        {/* Big Numbers */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#10b981' }}>$</span>
          <span className="font-mono-num" style={{ fontSize: '38px', fontWeight: 900, color: '#ffffff' }}>
            {totalSaved.toFixed(0)}
          </span>
          <span style={{ fontSize: '14px', color: '#94a3b8', marginLeft: '4px' }}>
            de ${totalTarget.toFixed(0)}
          </span>
        </div>

        {/* Global Progress Bar */}
        <div style={{
          width: '100%',
          height: '10px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(100, globalProgress)}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10b981, #38bdf8)',
            borderRadius: '999px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Vaults List */}
      <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Target size={16} color="#10b981" /> Metas Activas
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {activeVaults.map(vault => {
          const progress = vault.targetAmount > 0 ? (vault.currentAmount / vault.targetAmount) * 100 : 0;
          const remaining = Math.max(0, vault.targetAmount - vault.currentAmount);
          const isCompleted = vault.currentAmount >= vault.targetAmount;

          return (
            <div
              key={vault.id}
              className="glass-card"
              style={{
                padding: '18px',
                borderRadius: '18px',
                border: isCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: vault.color ? `${vault.color}22` : 'rgba(255, 255, 255, 0.06)',
                    border: `1px solid ${vault.color || '#10b981'}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {vault.icon || '🎯'}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                      {vault.name}
                    </div>
                    {vault.targetDate && (
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Fecha: {vault.targetDate}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono-num" style={{ fontSize: '16px', fontWeight: 900, color: '#10b981' }}>
                    ${vault.currentAmount.toFixed(0)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Meta: ${vault.targetAmount.toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '999px',
                overflow: 'hidden',
                marginBottom: '10px'
              }}>
                <div style={{
                  width: `${Math.min(100, progress)}%`,
                  height: '100%',
                  background: vault.color || '#10b981',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {progress.toFixed(0)}% ({isCompleted ? '¡Meta lograda!' : `Faltan $${remaining.toFixed(0)}`})
                </span>

                {/* Quick Deposit Chips */}
                {!isCompleted && onDepositToVault && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[10, 25, 50].map(amt => (
                      <button
                        key={amt}
                        onClick={() => onDepositToVault(vault.id, amt)}
                        type="button"
                        className="tactile-btn"
                        style={{
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#10b981',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        +${amt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Debt Strategy Section */}
      {debtAccounts.length > 0 && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CreditCard size={16} color="#f43f5e" /> Compromisos de Deuda
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {debtAccounts.map(acc => (
              <div key={acc.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                background: 'rgba(244, 63, 94, 0.06)',
                borderRadius: '12px',
                border: '1px solid rgba(244, 63, 94, 0.15)'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{acc.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Límite: ${acc.creditLimit || 0}</div>
                </div>
                <div className="font-mono-num" style={{ fontSize: '15px', fontWeight: 800, color: '#f43f5e' }}>
                  -${acc.currentBalance.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
