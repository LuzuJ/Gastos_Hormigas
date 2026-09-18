import React from 'react';
import { Account, SavingsVault } from '../core/models/ledger';
import { Wallet, CreditCard, Landmark, Target, Plus, ShieldCheck } from 'lucide-react';

interface AccountsViewProps {
  accounts: Account[];
  vaults: SavingsVault[];
}

export const AccountsView: React.FC<AccountsViewProps> = ({ accounts, vaults }) => {
  const totalAssets = accounts
    .filter(a => a.type === 'asset')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalLiabilities = accounts
    .filter(a => a.type === 'liability')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="animate-pop-in" style={{ maxWidth: '520px', margin: '0 auto' }}>
      {/* Net Worth Summary Card */}
      <div className="glass-card" style={{
        padding: '24px',
        marginBottom: '16px',
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
      }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, letterSpacing: '1px' }}>
          Patrimonio Neto Líquido
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
          <span style={{ fontSize: '24px', color: '#38bdf8', fontWeight: 800 }}>$</span>
          <span className="font-mono-num" style={{ fontSize: '42px', fontWeight: 900, color: '#ffffff' }}>
            {netWorth.toFixed(2)}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Activos Totales</span>
            <div className="font-mono-num" style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>
              ${totalAssets.toFixed(2)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Deudas / Tarjetas</span>
            <div className="font-mono-num" style={{ fontSize: '16px', fontWeight: 800, color: '#f43f5e' }}>
              ${totalLiabilities.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wallet size={16} color="#38bdf8" /> Cuentas & Tarjetas
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {accounts.map(acc => (
            <div
              key={acc.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: acc.color ? `${acc.color}22` : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${acc.color || '#38bdf8'}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  {acc.icon || '💳'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                    {acc.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>
                    {acc.type === 'credit_card' ? `Límite: $${acc.creditLimit || 0}` : 'Cuenta de Débito/Efectivo'}
                  </div>
                </div>
              </div>

              <div className="font-mono-num" style={{
                fontSize: '17px',
                fontWeight: 800,
                color: acc.type === 'credit_card' ? '#f43f5e' : '#f8fafc'
              }}>
                ${acc.currentBalance.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
