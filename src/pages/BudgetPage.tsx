import React, { useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer/PageContainer';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { Card } from '../components/ui/Card/Card';
import { StatsCard } from '../components/ui/StatsCard/StatsCard';
import { CategoryDetailsSheet } from '../components/modals/CategoryDetailsSheet/CategoryDetailsSheet';
import {
  useCategoriesContext,
  useExpensesContext
} from '../contexts/AppContext';
import { formatCurrency } from '../utils/formatters';
import { PieChart, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './BudgetPage.module.css';

const ProgressBar: React.FC<{ current: number; max: number; color?: string }> = ({ current, max, color = 'var(--primary)' }) => {
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <div style={{ height: '8px', background: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
      <div style={{ width: `${percentage}%`, height: '100%', background: color, transition: 'width 0.5s ease' }} />
    </div>
  );
};

export const BudgetPage: React.FC<{ isGuest?: boolean }> = () => {
  // Add missing deleteCategory and addCategory destructuring
  const { categories, updateCategoryBudget, addSubCategory, deleteSubCategory, deleteCategory, addCategory } = useCategoriesContext();
  const { expenses } = useExpensesContext();

  const [selectedCategory, setSelectedCategory] = React.useState<any>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');

  // Handler for adding category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName);
      setNewCatName('');
      setIsAdding(false);
    }
  };

  // Calculate totals
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = expenses.filter(e => {
    if (!e.createdAt) return false;
    const d = new Date(e.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const categorySpend = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthExpenses.forEach(e => {
      // Safe access to category id
      const catId = e.categoryId;
      if (catId) {
        map[catId] = (map[catId] || 0) + e.amount;
      }
    });
    return map;
  }, [currentMonthExpenses]);

  // Use 'budget' property as per Category type
  const totalBudget = categories.reduce((sum, cat) => sum + (cat.budget || 0), 0); // Changed from monthlyBudget to budget
  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = Math.max(0, totalBudget - totalSpent);
  const spendingPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <PageContainer>
      <div className={styles.container}>
        <PageHeader
          title="Categorías"
          subtitle="Gestiona tu presupuesto y categorías"
          icon={<PieChart size={24} />}
        />

        {/* Add Category Section */}
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--bg-card)', border: '1px dashed var(--border-light)',
              padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
              cursor: 'pointer', width: '100%', justifyContent: 'center', fontWeight: 500
            }}
          >
            + Nueva Categoría
          </button>
        ) : (
          <div style={{ marginBottom: 'var(--space-md)' }}>
            {/* Manual inline style Card because Card component might have strict props */}
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '8px' }}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Nombre de categoría..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0 16px', borderRadius: '8px', cursor: 'pointer' }}>Guardar</button>
                <button type="button" onClick={() => setIsAdding(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', padding: '0 8px', cursor: 'pointer' }}>Cancelar</button>
              </form>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-md)' }}>
          <StatsCard
            label="Presupuesto Total"
            value={formatCurrency(totalBudget)}
            icon={<PieChart size={16} />}
          />
          <StatsCard
            label="Gastado"
            value={formatCurrency(totalSpent)}
            icon={<TrendingUp size={16} />}
            // Fix status type mismatch
            status={spendingPercentage > 100 ? 'danger' : spendingPercentage > 85 ? 'warning' : undefined}
          />
          <StatsCard
            label="Disponible"
            value={formatCurrency(remaining)}
            icon={remaining > 0 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            status={remaining > 0 ? 'success' : 'danger'}
          />
        </div>

        {/* Category List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 'var(--space-sm) 0 0' }}>Desglose por Categoría (Toca para editar)</h3>

          {categories.map(cat => {
            const spent = categorySpend[cat.id] || 0;
            const budget = cat.budget || 0; // Changed from monthlyBudget
            const percent = budget > 0 ? (spent / budget) * 100 : 0;
            const statusColor = percent > 100 ? 'var(--danger)' : percent > 85 ? 'var(--warning)' : 'var(--primary)';

            return (
              <div key={cat.id} onClick={() => setSelectedCategory(cat)} style={{ cursor: 'pointer' }}>
                <Card padding="md" className={styles.clickableCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{cat.icon || '🏷️'}</span>
                      <span style={{ fontWeight: 600 }}>{cat.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{formatCurrency(spent)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>de {formatCurrency(budget)}</div>
                    </div>
                  </div>
                  <ProgressBar current={spent} max={budget || 1} color={statusColor} />
                </Card>
              </div>
            );
          })}
        </div>

        {/* Details Sheet / Modal */}
        <CategoryDetailsSheet
          isOpen={!!selectedCategory}
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
          onUpdateBudget={updateCategoryBudget}
          onAddSubCategory={addSubCategory}
          onDeleteSubCategory={deleteSubCategory}
          onDeleteCategory={deleteCategory} // Pass delete function
        />
      </div>
    </PageContainer>
  );
};

export default BudgetPage;
