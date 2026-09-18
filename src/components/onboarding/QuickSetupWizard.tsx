import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { LocalLedgerStore } from '../../core/sync/localStore';
import { Settings, DollarSign, Wallet, CheckCircle2, Building, Sparkles } from 'lucide-react';

interface QuickSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSetupWizard: React.FC<QuickSetupWizardProps> = ({ isOpen, onClose }) => {
  const { activeWorkspace } = useWorkspace();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currency, setCurrency] = useState('USD');
  const [monthlyIncome, setMonthlyIncome] = useState('1500');
  const [cashBalance, setCashBalance] = useState('100');
  const [bankBalance, setBankBalance] = useState('1500');

  if (!isOpen) return null;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const inc = parseFloat(monthlyIncome) || 1200;
    LocalLedgerStore.setMonthlyIncomeEstimate(inc);

    // Actualizar balances locales
    const state = LocalLedgerStore.getState();
    const updatedAccounts = state.accounts.map((acc) => {
      if (acc.name.toLowerCase().includes('efectivo') || acc.subtype === 'cash') {
        return { ...acc, currentBalance: parseFloat(cashBalance) || 0, currency };
      }
      if (acc.name.toLowerCase().includes('banco') || acc.subtype === 'bank') {
        return { ...acc, currentBalance: parseFloat(bankBalance) || 0, currency };
      }
      return { ...acc, currency };
    });

    LocalLedgerStore.saveState({
      ...state,
      accounts: updatedAccounts,
      monthlyIncomeEstimate: inc,
    });

    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(12px)',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#18181B',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '28px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings size={20} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Configuración Rápida del Sistema</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#A1A1AA' }}>
              Paso {step} de 3 • {activeWorkspace?.name || 'Tu Espacio'}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: '6px', margin: '16px 0 24px 0' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: s <= step ? 'linear-gradient(90deg, #0ea5e9, #6366f1)' : 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        <form onSubmit={handleFinish}>
          {step === 1 && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#38bdf8' }}>1. Elige tu Moneda Principal</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#A1A1AA' }}>
                Selecciona la divisa en la que registrarás tus gastos y balances contables.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                {[
                  { code: 'USD', name: 'Dólar ($)', flag: '🇺🇸' },
                  { code: 'COP', name: 'Peso Col ($)', flag: '🇨🇴' },
                  { code: 'MXN', name: 'Peso Mex ($)', flag: '🇲🇽' },
                  { code: 'EUR', name: 'Euro (€)', flag: '🇪🇺' },
                  { code: 'ARS', name: 'Peso Arg ($)', flag: '🇦🇷' },
                  { code: 'PEN', name: 'Sol (S/)', flag: '🇵🇪' },
                ].map((cur) => (
                  <div
                    key={cur.code}
                    onClick={() => setCurrency(cur.code)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '12px',
                      border: `1px solid ${currency === cur.code ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                      background: currency === cur.code ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{cur.flag}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{cur.code}</div>
                    <div style={{ fontSize: '0.7rem', color: '#A1A1AA' }}>{cur.name}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Siguiente: Cuentas →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#38bdf8' }}>2. Saldos Iniciales de tus Cuentas</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#A1A1AA' }}>
                Indica cuánto dinero tienes disponible actualmente para arrancar el control de gastos.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#D4D4D8', marginBottom: '6px' }}>
                    💵 Saldo en Efectivo / Billetera
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={cashBalance}
                    onChange={(e) => setCashBalance(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#27272A',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#10B981',
                      fontSize: '1rem',
                      fontWeight: 700,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#D4D4D8', marginBottom: '6px' }}>
                    🏦 Saldo en Banco Principal / Cuenta de Ahorros
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={bankBalance}
                    onChange={(e) => setBankBalance(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#27272A',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#38bdf8',
                      fontSize: '1rem',
                      fontWeight: 700,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#A1A1AA',
                    cursor: 'pointer',
                  }}
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Siguiente: Ingresos →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#38bdf8' }}>3. Ingreso Mensual Estimado</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#A1A1AA' }}>
                El algoritmo calculará automáticamente tu <strong>Safe-to-Spend Diario</strong> para evitar que te sobregires.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#D4D4D8', marginBottom: '6px' }}>
                  💰 Ingreso / Presupuesto Total del Mes ({currency})
                </label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#27272A',
                    border: '1px solid #38bdf8',
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#A1A1AA',
                    cursor: 'pointer',
                  }}
                >
                  ← Atrás
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle2 size={16} /> Guardar y Comenzar
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
