import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider, useWorkspace } from './contexts/WorkspaceContext';
import { LocalLedgerStore, LocalState } from './core/sync/localStore';
import { SafeToSpendMetrics } from './core/models/ledger';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { QuickCapturePad } from './components/QuickCapturePad';
import { LeakRadarView } from './components/LeakRadarView';
import { StatsChartView } from './components/stats/StatsChartView';
import { BudgetManagerView } from './components/budget/BudgetManagerView';
import { PlanningVaultsView } from './components/planning/PlanningVaultsView';
import { AccountsView } from './components/AccountsView';
import { ErpLedgerView } from './components/erp/ErpLedgerView';
import { WorkspaceSwitcher } from './components/navigation/WorkspaceSwitcher';
import { UserMenu } from './components/navigation/UserMenu';
import { BottomNavigation, NavTab } from './components/navigation/BottomNavigation';
import { QuickSetupWizard } from './components/onboarding/QuickSetupWizard';
import { Sparkles, DollarSign, Zap, Building2, User, Sliders, X } from 'lucide-react';

function AppContent() {
  const { activeWorkspace, switchWorkspace, workspaces } = useWorkspace();
  const [state, setState] = useState<LocalState>(LocalLedgerStore.getState());
  const [metrics, setMetrics] = useState<SafeToSpendMetrics>(LocalLedgerStore.getMetrics());
  const [currentTab, setCurrentTab] = useState<NavTab>(
    activeWorkspace?.type === 'business' ? 'erp' : 'dashboard'
  );
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState<boolean>(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState<boolean>(false);
  const [incomeInput, setIncomeInput] = useState<string>(String(state.monthlyIncomeEstimate || 1200));

  useEffect(() => {
    const unsubscribe = LocalLedgerStore.subscribe(() => {
      const updated = LocalLedgerStore.getState();
      setState(updated);
      setMetrics(LocalLedgerStore.getMetrics());
    });
    return () => unsubscribe();
  }, []);

  // Sincronización automática de tab según el tipo de workspace
  useEffect(() => {
    if (activeWorkspace?.type === 'business') {
      setCurrentTab('erp');
    } else {
      if (currentTab === 'erp') {
        setCurrentTab('dashboard');
      }
    }
  }, [activeWorkspace?.id, activeWorkspace?.type]);

  const handleCapture = (amount: number, categoryId: string, accountId: string, description: string) => {
    LocalLedgerStore.addEntry(amount, categoryId, accountId, description);
  };

  const handleDelete = (id: string) => {
    LocalLedgerStore.deleteEntry(id);
  };

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(incomeInput);
    if (!isNaN(val) && val >= 0) {
      LocalLedgerStore.setMonthlyIncomeEstimate(val);
      setIsIncomeModalOpen(false);
    }
  };

  const isBusinessMode = activeWorkspace?.type === 'business' || currentTab === 'erp';

  return (
    <div style={{
      minHeight: '100vh',
      padding: '16px 14px 90px 14px',
      boxSizing: 'border-box'
    }}>
      {/* Top Navbar */}
      <header style={{
        maxWidth: isBusinessMode ? '1200px' : '560px',
        margin: '0 auto 18px auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        transition: 'max-width 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: isBusinessMode 
              ? 'linear-gradient(135deg, #6366f1, #4f46e5)' 
              : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            boxShadow: isBusinessMode 
              ? '0 8px 20px -4px rgba(99, 102, 241, 0.55)' 
              : '0 8px 20px -4px rgba(14, 165, 233, 0.45)'
          }}>
            {isBusinessMode ? '🏢' : '🐜'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 900, margin: 0, letterSpacing: '-0.3px', color: '#ffffff' }}>
                Gastos Hormigas <span style={{ color: isBusinessMode ? '#a5b4fc' : '#38bdf8' }}>
                  {isBusinessMode ? 'ERP Pro' : 'Personal'}
                </span>
              </h1>
              <span style={{
                background: 'rgba(16, 185, 129, 0.18)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#10b981',
                padding: '2px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Zap size={10} /> Supabase Cloud
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '2px 0 0 0', fontWeight: 500 }}>
              {isBusinessMode 
                ? 'Sistema Contable • Partida Doble • Centros de Costo' 
                : 'Control de micro-fugas y presupuesto diario inteligente'}
            </p>
          </div>
        </div>

        {/* Workspace Switcher, Setup & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <WorkspaceSwitcher />
          <UserMenu />

          <button
            onClick={() => setIsSetupWizardOpen(true)}
            type="button"
            className="tactile-btn"
            title="Configurar Moneda, Cuentas e Ingresos"
            style={{
              color: '#f8fafc',
              padding: '7px 14px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.16)',
            }}
          >
            <Sliders size={14} color="#38bdf8" />
            <span>Configurar</span>
          </button>

          {!isBusinessMode && (
            <button
              onClick={() => setIsIncomeModalOpen(true)}
              type="button"
              className="tactile-btn glass-pill"
              title="Ajustar Ingreso Mensual"
              style={{
                color: '#f8fafc',
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.16)',
              }}
            >
              <DollarSign size={14} color="#38bdf8" />
              ${state.monthlyIncomeEstimate}
            </button>
          )}
        </div>
      </header>

      {/* Selector de Modo Principal (Tabs Visuales Tipo Segmented Control) */}
      <div style={{
        maxWidth: isBusinessMode ? '1200px' : '560px',
        margin: '0 auto 20px auto',
        display: 'flex',
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '5px',
        gap: '6px',
        boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5)',
      }}>
        <button
          type="button"
          onClick={() => {
            const personalWs = workspaces.find((w) => w.type === 'personal') || workspaces[0];
            if (personalWs) switchWorkspace(personalWs.id);
            setCurrentTab('dashboard');
          }}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '12px',
            border: 'none',
            background: !isBusinessMode ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'transparent',
            color: !isBusinessMode ? '#fff' : '#94a3b8',
            fontWeight: !isBusinessMode ? 800 : 600,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: !isBusinessMode ? '0 4px 14px rgba(14, 165, 233, 0.4)' : 'none',
          }}
        >
          <User size={16} />
          <span>👤 Modo Personal (Gastos Hormiga)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const bizWs = workspaces.find((w) => w.type === 'business');
            if (bizWs) switchWorkspace(bizWs.id);
            setCurrentTab('erp');
          }}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '12px',
            border: 'none',
            background: isBusinessMode ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
            color: isBusinessMode ? '#fff' : '#94a3b8',
            fontWeight: isBusinessMode ? 800 : 600,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isBusinessMode ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
          }}
        >
          <Building2 size={16} />
          <span>🏢 Modo Empresa / ERP Contable</span>
        </button>
      </div>

      {/* Quick Setup Wizard Modal */}
      <QuickSetupWizard
        isOpen={isSetupWizardOpen}
        onClose={() => {
          setIsSetupWizardOpen(false);
          const updated = LocalLedgerStore.getState();
          setState(updated);
          setMetrics(LocalLedgerStore.getMetrics());
        }}
      />

      {/* View Switcher */}
      {currentTab === 'erp' ? (
        <ErpLedgerView />
      ) : (
        <>
          {currentTab === 'dashboard' && (
            <DashboardOverview
              state={state}
              metrics={metrics}
              onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
              onNavigateToCapture={() => setCurrentTab('capture')}
              onDeleteEntry={handleDelete}
            />
          )}

          {currentTab === 'capture' && (
            <div className="animate-pop-in" style={{ maxWidth: '520px', margin: '0 auto' }}>
              <QuickCapturePad
                categories={state.categories}
                accounts={state.accounts}
                onCapture={handleCapture}
              />
            </div>
          )}

          {currentTab === 'radar' && (
            <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <LeakRadarView
                entries={state.entries}
                categories={state.categories}
                accounts={state.accounts}
                monthlyIncome={state.monthlyIncomeEstimate}
              />
              <StatsChartView
                entries={state.entries}
                categories={state.categories}
              />
            </div>
          )}

          {currentTab === 'budget' && (
            <BudgetManagerView
              categories={state.categories}
              entries={state.entries}
              metrics={metrics}
              onUpdateCategoryBudget={(catId, newBudget) => LocalLedgerStore.updateCategoryBudget(catId, newBudget)}
            />
          )}

          {currentTab === 'planning' && (
            <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <PlanningVaultsView
                vaults={state.savingsVaults}
                accounts={state.accounts}
                onDepositToVault={(vaultId, amount) => LocalLedgerStore.depositToVault(vaultId, amount)}
              />
              <AccountsView
                accounts={state.accounts}
                vaults={state.savingsVaults}
              />
            </div>
          )}
        </>
      )}

      {/* Floating Bottom Navigation */}
      <BottomNavigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        antBadgeCount={metrics.antExpensesCount}
        isErpWorkspace={isBusinessMode}
      />

      {/* Income Modal Overlay */}
      {isIncomeModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="glass-card animate-pop-in" style={{
            maxWidth: '380px',
            width: '100%',
            padding: '24px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} color="#38bdf8" /> Ingreso Mensual Estimado
              </h3>
              <button
                onClick={() => setIsIncomeModalOpen(false)}
                type="button"
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4, margin: '0 0 16px 0' }}>
              Define tu ingreso recurrente para calibrar el algoritmo del <strong>Safe to Spend Diario</strong> y el radar de gastos hormiga.
            </p>

            <form onSubmit={handleSaveIncome}>
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#38bdf8'
                }}>$</span>
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '16px',
                    padding: '14px 16px 14px 38px',
                    fontSize: '22px',
                    fontWeight: 900,
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsIncomeModalOpen(false)}
                  className="tactile-btn"
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    padding: '12px',
                    borderRadius: '14px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="tactile-btn"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '12px',
                    borderRadius: '14px',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 8px 16px -4px rgba(14, 165, 233, 0.5)'
                  }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <AppContent />
      </WorkspaceProvider>
    </AuthProvider>
  );
}