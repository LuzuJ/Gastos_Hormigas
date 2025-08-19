import React, { useState } from 'react';
import type { Liability } from '../../types';
import { Trash2, CreditCard, DollarSign, Calendar, Plus, Edit3, Target, TrendingDown, List, BarChart3 } from 'lucide-react';
import { DebtPaymentPlanner } from './DebtPaymentPlanner';
import styles from './DebtManager.module.css';

type PaymentType = 'regular' | 'extra' | 'interest_only';
type ViewMode = 'list' | 'planner';

interface DebtManagerProps {
  liabilities: Liability[];
  onAddLiability: (data: any) => void;
  onDeleteLiability: (id: string) => void;
  onUpdateLiability: (id: string, data: any) => void;
  onMakePayment: (liabilityId: string, amount: number, paymentType: PaymentType, description?: string) => void;
  getDebtAnalysis?: () => any[];
  monthlyExtraBudget?: number;
  onUpdateExtraBudget?: (amount: number) => void;
}

interface DebtFormData {
  name: string;
  amount: number;
  type: string;
  interestRate: number;
  monthlyPayment: number;
  description?: string;
}

const DebtManager: React.FC<DebtManagerProps> = ({ 
  liabilities, 
  onAddLiability, 
  onDeleteLiability,  
  onUpdateLiability,
  onMakePayment,
  getDebtAnalysis,
  monthlyExtraBudget = 0,
  onUpdateExtraBudget = () => {}
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [formData, setFormData] = useState<DebtFormData>({
    name: '',
    amount: 0,
    type: 'credit_card',
    interestRate: 0,
    monthlyPayment: 0,
    description: ''
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  };

  const getDebtTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card': return <CreditCard size={20} />;
      case 'mortgage': return <Calendar size={20} />;
      case 'loan': return <DollarSign size={20} />;
      case 'student_loan': return <Target size={20} />;
      default: return <DollarSign size={20} />;
    }
  };

  const getDebtTypeLabel = (type: string) => {
    const labels = {
      credit_card: 'Tarjeta de Crédito',
      loan: 'Préstamo Personal',
      mortgage: 'Hipoteca',
      student_loan: 'Préstamo Estudiantil',
      other: 'Otro'
    };
    return labels[type as keyof typeof labels] || 'Deuda';
  };

  const calculateMonthsToPayOff = (debt: Liability) => {
    if (!debt.monthlyPayment || !debt.interestRate || debt.monthlyPayment <= 0) {
      return Infinity;
    }

    const monthlyRate = (debt.interestRate || 0) / 100 / 12;
    const monthlyPayment = debt.monthlyPayment;
    const balance = debt.amount;

    if (monthlyRate === 0) {
      return Math.ceil(balance / monthlyPayment);
    }

    if (monthlyPayment <= balance * monthlyRate) {
      return Infinity; // Nunca se pagará
    }

    const months = -Math.log(1 - (balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate);
    return Math.ceil(months);
  };

  const formatTimeToPayOff = (months: number) => {
    if (months === Infinity) return 'Nunca';
    if (months <= 12) return `${months} meses`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    }
    
    return `${years}a ${remainingMonths}m`;
  };

  const getTotalDebt = () => {
    return liabilities.reduce((total, debt) => total + debt.amount, 0);
  };

  const getTotalMonthlyPayments = () => {
    return liabilities.reduce((total, debt) => total + (debt.monthlyPayment || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDebt) {
      onUpdateLiability(editingDebt, formData);
      setEditingDebt(null);
    } else {
      onAddLiability({
        ...formData,
        id: Date.now().toString(),
        category: 'debt'
      });
    }
    
    setFormData({
      name: '',
      amount: 0,
      type: 'credit_card',
      interestRate: 0,
      monthlyPayment: 0,
      description: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (debt: Liability) => {
    setFormData({
      name: debt.name,
      amount: debt.amount,
      type: debt.type,
      interestRate: debt.interestRate || 0,
      monthlyPayment: debt.monthlyPayment || 0,
      description: debt.description || ''
    });
    setEditingDebt(debt.id);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingDebt(null);
    setFormData({
      name: '',
      amount: 0,
      type: 'credit_card',
      interestRate: 0,
      monthlyPayment: 0,
      description: ''
    });
  };

  const getMotivationalMessage = () => {
    const totalDebt = getTotalDebt();
    if (totalDebt === 0) return "¡Felicidades! No tienes deudas registradas.";
    if (liabilities.length === 1) return "¡Excelente! Una sola deuda es más fácil de manejar.";
    if (totalDebt < 5000) return "¡Vas por buen camino! Esta cantidad es manejable.";
    if (totalDebt < 20000) return "¡Mantén el enfoque! Cada pago te acerca a la libertad financiera.";
    return "¡No te rindas! Los grandes objetivos requieren determinación.";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <CreditCard size={24} />
          Gestión de Deudas
        </h3>
        
        {liabilities.length > 0 && (
          <div className={styles.viewToggle}>
            <button 
              onClick={() => setViewMode('list')}
              className={`${styles.toggleButton} ${viewMode === 'list' ? styles.active : ''}`}
            >
              <List size={16} />
              Lista
            </button>
            <button 
              onClick={() => setViewMode('planner')}
              className={`${styles.toggleButton} ${viewMode === 'planner' ? styles.active : ''}`}
            >
              <BarChart3 size={16} />
              Planificador
            </button>
          </div>
        )}

        <div className={styles.headerActions}>
          <button 
            onClick={() => setShowAddForm(true)}
            className={styles.addButton}
          >
            <Plus size={16} />
            Agregar Deuda
          </button>
        </div>
      </div>

      {viewMode === 'planner' && liabilities.length > 0 ? (
        <DebtPaymentPlanner 
          debts={liabilities}
          onMakePayment={(debtId: string, amount: number) => 
            onMakePayment(debtId, amount, 'extra', 'Pago desde planificador')
          }
        />
      ) : (
        <>
          {liabilities.length > 0 && (
            <div className={styles.summary}>
              <div className={styles.summaryCard}>
                <h4>Resumen de Deudas</h4>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Total adeudado:</span>
                    <span className={styles.amount}>{formatCurrency(getTotalDebt())}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Pagos mensuales:</span>
                    <span className={styles.amount}>{formatCurrency(getTotalMonthlyPayments())}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Número de deudas:</span>
                    <span className={styles.count}>{liabilities.length}</span>
                  </div>
                </div>
                <div className={styles.motivationalMessage}>
                  <TrendingDown size={16} />
                  {getMotivationalMessage()}
                </div>
              </div>
            </div>
          )}

          {showAddForm && (
            <div className={styles.formOverlay}>
              <div className={styles.formContainer}>
                <h4>{editingDebt ? 'Editar Deuda' : 'Agregar Nueva Deuda'}</h4>
                <form onSubmit={handleSubmit} className={styles.debtForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Nombre de la deuda *</label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: Tarjeta Visa, Préstamo auto..."
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="amount">Monto adeudado *</label>
                      <input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="type">Tipo de deuda</label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="credit_card">Tarjeta de Crédito</option>
                        <option value="loan">Préstamo Personal</option>
                        <option value="mortgage">Hipoteca</option>
                        <option value="student_loan">Préstamo Estudiantil</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="interestRate">Tasa de interés anual (%)</label>
                      <input
                        id="interestRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.interestRate || ''}
                        onChange={(e) => setFormData({...formData, interestRate: parseFloat(e.target.value) || 0})}
                        placeholder="12.5"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="monthlyPayment">Pago mensual mínimo</label>
                      <input
                        id="monthlyPayment"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.monthlyPayment || ''}
                        onChange={(e) => setFormData({...formData, monthlyPayment: parseFloat(e.target.value) || 0})}
                        placeholder="150.00"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="description">Descripción (opcional)</label>
                    <textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Notas adicionales sobre esta deuda..."
                      rows={3}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                      Cancelar
                    </button>
                    <button type="submit" className={styles.submitButton}>
                      {editingDebt ? 'Actualizar' : 'Agregar'} Deuda
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className={styles.debtsList}>
            {liabilities.map(liability => {
              const monthsToPayOff = calculateMonthsToPayOff(liability);
              const totalInterest = liability.monthlyPayment && monthsToPayOff !== Infinity 
                ? (liability.monthlyPayment * monthsToPayOff) - liability.amount 
                : 0;

              return (
                <div 
                  key={liability.id} 
                  className={styles.debtCard}
                >
                  <div className={styles.debtHeader}>
                    <div className={styles.debtInfo}>
                      <div className={styles.debtName}>
                        {getDebtTypeIcon(liability.type)}
                        {liability.name}
                      </div>
                      <div className={styles.debtType}>
                        {getDebtTypeLabel(liability.type)}
                      </div>
                    </div>
                    <div className={styles.debtActions}>
                      <button 
                        onClick={() => handleEdit(liability)}
                        className={styles.editButton}
                        title="Editar deuda"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteLiability(liability.id)}
                        className={styles.deleteButton}
                        title="Eliminar deuda"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.debtDetails}>
                    <div className={styles.amountInfo}>
                      <div className={styles.currentAmount}>
                        <span className={styles.label}>Deuda actual:</span>
                        <span className={styles.amount}>{formatCurrency(liability.amount)}</span>
                      </div>
                    </div>

                    <div className={styles.additionalInfo}>
                      {liability.interestRate && (
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Interés:</span>
                          <span className={styles.infoValue}>{liability.interestRate}% anual</span>
                        </div>
                      )}
                      {liability.monthlyPayment && (
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Pago mensual:</span>
                          <span className={styles.infoValue}>{formatCurrency(liability.monthlyPayment)}</span>
                        </div>
                      )}
                      {monthsToPayOff !== Infinity && liability.monthlyPayment && (
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Tiempo estimado:</span>
                          <span className={styles.infoValue}>{formatTimeToPayOff(monthsToPayOff)}</span>
                        </div>
                      )}
                      {totalInterest > 0 && (
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Interés total:</span>
                          <span className={styles.infoValue}>{formatCurrency(totalInterest)}</span>
                        </div>
                      )}
                    </div>

                    {liability.description && (
                      <div className={styles.description}>
                        <span className={styles.descriptionLabel}>Notas:</span>
                        <span className={styles.descriptionText}>{liability.description}</span>
                      </div>
                    )}

                    {liability.monthlyPayment && (
                      <div className={styles.paymentActions}>
                        <button
                          onClick={() => onMakePayment(liability.id, liability.monthlyPayment!, 'regular', 'Pago mínimo mensual')}
                          className={styles.paymentButton}
                        >
                          Registrar Pago Mínimo
                        </button>
                        <button
                          onClick={() => onMakePayment(liability.id, liability.monthlyPayment! * 1.5, 'extra', 'Pago extra')}
                          className={styles.extraPaymentButton}
                        >
                          Pago Extra (+50%)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {liabilities.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <TrendingDown size={48} />
                </div>
                <h4>No tienes deudas registradas</h4>
                <p>¡Excelente! Si no tienes deudas o quieres empezar a gestionar las que tienes, puedes agregar tu primera deuda.</p>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className={styles.addFirstButton}
                >
                  <Plus size={16} />
                  Agregar primera deuda
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export { DebtManager };
export default DebtManager;
