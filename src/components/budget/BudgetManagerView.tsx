import React, { useState } from 'react';
import { Category, JournalEntry, SafeToSpendMetrics } from '../../core/models/ledger';
import { Sliders, AlertTriangle, CheckCircle, TrendingUp, Sparkles, Plus, Edit2, X } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';

interface BudgetManagerViewProps {
  categories: Category[];
  entries: JournalEntry[];
  metrics: SafeToSpendMetrics;
  onUpdateCategoryBudget?: (categoryId: string, newBudget: number) => void;
}

export const BudgetManagerView: React.FC<BudgetManagerViewProps> = ({
  categories,
  entries,
  metrics,
  onUpdateCategoryBudget,
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [budgetInput, setBudgetInput] = useState<string>('');

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const currentMonthEntries = entries.filter(e => {
    const d = new Date(e.timestamp);
    return e.entryType === 'expense' && d >= monthStart && d <= monthEnd;
  });

  const categorySpentMap = new Map<string, number>();
  for (const entry of currentMonthEntries) {
    const catId = entry.categoryId || 'uncategorized';
    categorySpentMap.set(catId, (categorySpentMap.get(catId) || 0) + entry.amount);
  }

  const totalBudget = categories.reduce((sum, c) => sum + (c.budgetMonthly || 0), 0);
  const totalSpent = currentMonthEntries.reduce((sum, e) => sum + e.amount, 0);

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setBudgetInput(String(cat.budgetMonthly || 0));
  };

  const handleSaveCategoryBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !onUpdateCategoryBudget) return;
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateCategoryBudget(editingCategory.id, val);
      setEditingCategory(null);
    }
  };

  return (
    <div className="animate-pop-in" style={{ maxWidth: '520px', margin: '0 auto' }}>
      {/* Top Budget Summary Card */}
      <div className="glass-card" style={{
        padding: '24px',
        marginBottom: '16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              padding: '8px',
              borderRadius: '12px'
            }}>
              <Sliders size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Presupuestos por Categoría
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                Toca cualquier categoría para ajustar su límite mensual
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 800,
            color: '#818cf8'
          }}>
            {categories.length} Categorías
          </div>
        </div>

        {/* Global Budget Progress */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px' }}>
            <span>Gastado: <b>${totalSpent.toFixed(0)}</b></span>
            <span>Límite Total: <b>${totalBudget.toFixed(0)}</b></span>
          </div>
          <div style={{
            width: '100%',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0}%`,
              height: '100%',
              background: totalSpent > totalBudget
                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                : 'linear-gradient(90deg, #10b981, #6366f1)',
              borderRadius: '999px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Categories Detailed Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {categories.map(cat => {
          const spent = categorySpentMap.get(cat.id) || 0;
          const budget = cat.budgetMonthly || 0;
          const percent = budget > 0 ? (spent / budget) * 100 : 0;
          const isOver = percent > 100;
          const isNear = percent >= 80 && percent <= 100;

          const barColor = isOver ? '#f43f5e' : (isNear ? '#f59e0b' : (cat.color || '#10b981'));

          return (
            <div
              key={cat.id}
              onClick={() => handleOpenEdit(cat)}
              className="glass-card tactile-btn"
              style={{
                padding: '16px 18px',
                borderRadius: '18px',
                border: isOver ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: `${cat.color}22`,
                    border: `1px solid ${cat.color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {cat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {cat.name} <Edit2 size={11} color="#64748b" />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {isOver ? '¡Presupuesto superado!' : (isNear ? 'Cerca del límite' : 'Dentro del rango')}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono-num" style={{ fontSize: '15px', fontWeight: 900, color: isOver ? '#f43f5e' : '#ffffff' }}>
                    ${spent.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    de ${budget.toFixed(0)} ({percent.toFixed(0)}%)
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '7px',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(100, percent)}%`,
                  height: '100%',
                  background: barColor,
                  borderRadius: '999px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Category Budget Modal */}
      {editingCategory && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="glass-card animate-pop-in" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            position: 'relative'
          }}>
            <button
              onClick={() => setEditingCategory(null)}
              type="button"
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>{editingCategory.icon}</span>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Editar Presupuesto: {editingCategory.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Límite máximo de gasto mensual</span>
              </div>
            </div>

            <form onSubmit={handleSaveCategoryBudget}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                Monto Mensual ($)
              </label>
              <input
                type="number"
                step="5"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                autoFocus
                className="font-mono-num"
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '14px',
                  color: '#ffffff',
                  padding: '12px 16px',
                  fontSize: '20px',
                  fontWeight: 800,
                  outline: 'none',
                  marginBottom: '20px'
                }}
              />

              <button
                type="submit"
                className="tactile-btn"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Guardar Límite
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
