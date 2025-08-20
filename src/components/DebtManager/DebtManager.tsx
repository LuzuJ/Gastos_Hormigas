import React, { useState } from 'react';
import type { Liability } from '../../types';
import { Trash2, CreditCard, DollarSign, Calendar, Plus, Edit3, Target, TrendingDown, List, BarChart3 } from 'lucide-react';
import { DebtPaymentPlanner } from './DebtPaymentPlanner';
import styles from './DebtManager.module.css';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useInputDialog } from '../../hooks/useInputDialog';
import { useNotificationsContext } from '../../contexts/NotificationsContext';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common';
import ConfirmDialog from '../modals/ConfirmDialog';
import InputDialog from '../modals/InputDialog';

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
  duration?: number; // Duración en meses
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
  // Hooks para diálogos personalizados
  const confirmDialog = useConfirmDialog();
  const inputDialog = useInputDialog();
  const { addNotification } = useNotificationsContext();
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [showArchivedDebts, setShowArchivedDebts] = useState(false);
  const [formData, setFormData] = useState<DebtFormData>({
    name: '',
    amount: 0,
    type: 'credit_card',
    interestRate: 0,
    monthlyPayment: 0,
    duration: 0,
    description: ''
  });

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
    // Si tiene duración definida, usarla directamente
    if (debt.duration && debt.duration > 0) {
      return debt.duration;
    }

    // Si no tiene duración, calcular basado en pago e interés
    if (!debt.monthlyPayment || debt.monthlyPayment <= 0) {
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
    if (showArchivedDebts) {
      return liabilities.filter(debt => debt.isArchived === true).reduce((total, debt) => total + debt.amount, 0);
    }
    return liabilities.filter(debt => !debt.isArchived).reduce((total, debt) => total + debt.amount, 0);
  };

  const getTotalMonthlyPayments = () => {
    if (showArchivedDebts) {
      return 0; // Las deudas archivadas no tienen pagos pendientes
    }
    return liabilities.filter(debt => !debt.isArchived).reduce((total, debt) => total + (debt.monthlyPayment || 0), 0);
  };

  // Función para filtrar deudas según el estado actual
  const getFilteredLiabilities = () => {
    if (showArchivedDebts) {
      // Mostrar solo deudas archivadas
      return liabilities.filter(liability => liability.isArchived === true);
    } else {
      // Mostrar solo deudas activas (no archivadas)
      return liabilities.filter(liability => !liability.isArchived);
    }
  };

  const getActiveDebtsCount = () => {
    return liabilities.filter(liability => !liability.isArchived).length;
  };

  const getArchivedDebtsCount = () => {
    return liabilities.filter(liability => liability.isArchived === true).length;
  };

  // Función para obtener el contenido del estado vacío
  const getEmptyStateContent = () => {
    if (showArchivedDebts) {
      return {
        title: "No hay deudas archivadas",
        message: "Las deudas completamente pagadas aparecerán aquí como historial.",
        showButton: false
      };
    }
    
    if (getActiveDebtsCount() === 0 && getArchivedDebtsCount() > 0) {
      return {
        title: "🎉 ¡Todas las deudas están pagadas!",
        message: "¡Felicidades! Has logrado pagar todas tus deudas. Puedes ver tu historial en \"Archivadas\".",
        showButton: false
      };
    }
    
    if (liabilities.length === 0) {
      return {
        title: "No tienes deudas registradas",
        message: "¡Excelente! Si no tienes deudas o quieres empezar a gestionar las que tienes, puedes agregar tu primera deuda.",
        showButton: true
      };
    }
    
    return {
      title: "🎉 ¡Todas las deudas están pagadas!",
      message: "¡Felicidades! Has logrado pagar todas tus deudas. Mantén este buen hábito financiero.",
      showButton: false
    };
  };

  // Función para manejar pagos manuales con diálogos personalizados
  const handleManualPayment = async (liability: Liability) => {
    try {
      const amount = await inputDialog.showInput({
        title: 'Registrar Pago',
        message: `¿Cuánto quieres pagar de "${liability.name}"?\n\nSaldo actual: ${formatCurrency(liability.amount)}`,
        placeholder: 'Ingresa el monto a pagar',
        inputType: 'number',
        validation: (value: string) => {
          const num = parseFloat(value);
          if (isNaN(num) || num <= 0) {
            return 'Debe ser un número mayor a 0';
          }
          if (num > liability.amount) {
            return 'No puedes pagar más que el saldo actual';
          }
          return null;
        }
      });

      if (amount === null) return; // Usuario canceló

      const paymentAmount = parseFloat(amount);
      const newBalance = Math.max(0, liability.amount - paymentAmount);
      
      const confirmed = await confirmDialog.showConfirm({
        title: 'Confirmar Pago',
        message: `¿Confirmar pago de ${formatCurrency(paymentAmount)}?\n\nSaldo actual: ${formatCurrency(liability.amount)}\nNuevo saldo: ${formatCurrency(newBalance)}`,
        confirmText: 'Confirmar Pago',
        cancelText: 'Cancelar',
        type: 'success'
      });

      if (confirmed) {
        // Usar la función onMakePayment que maneja todo el flujo completo
        // incluyendo actualización de deuda, registro de gasto y notificaciones
        onMakePayment(liability.id, paymentAmount, 'regular', `Pago manual - ${liability.name}`);
      }
    } catch (error) {
      console.error('Error al procesar pago manual:', error);
      addNotification({
        message: '❌ Error al procesar el pago. Inténtalo de nuevo.',
        type: 'danger'
      });
    }
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
      duration: 0,
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
      duration: debt.duration || 0,
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
      duration: 0,
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
            <Button 
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="small"
              icon={List}
              iconPosition="left"
            >
              Lista
            </Button>
            <Button 
              onClick={() => setViewMode('planner')}
              variant={viewMode === 'planner' ? 'primary' : 'outline'}
              size="small"
              icon={BarChart3}
              iconPosition="left"
            >
              Planificador
            </Button>
          </div>
        )}

        {/* Toggle para deudas archivadas */}
        {(getActiveDebtsCount() > 0 || getArchivedDebtsCount() > 0) && (
          <div className={styles.archivedToggle}>
            <button 
              onClick={() => setShowArchivedDebts(false)}
              className={`${styles.toggleButton} ${!showArchivedDebts ? styles.active : ''}`}
            >
              <TrendingDown size={16} />
              Activas ({getActiveDebtsCount()})
            </button>
            {getArchivedDebtsCount() > 0 && (
              <button 
                onClick={() => setShowArchivedDebts(true)}
                className={`${styles.toggleButton} ${showArchivedDebts ? styles.active : ''}`}
              >
                <Target size={16} />
                Archivadas ({getArchivedDebtsCount()})
              </button>
            )}
          </div>
        )}

        <div className={styles.headerActions}>
          <Button 
            onClick={() => setShowAddForm(true)}
            variant="primary"
            size="medium"
            icon={Plus}
            iconPosition="left"
          >
            Agregar Deuda
          </Button>
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
                      <label htmlFor="duration">Plazo (meses)</label>
                      <input
                        id="duration"
                        type="number"
                        min="1"
                        max="600"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                        placeholder="36"
                      />
                      <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Duración en meses (ej: 36 = 3 años)
                      </small>
                    </div>
                  </div>

                  <div className={styles.formRow}>
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
                    <Button 
                      type="button" 
                      onClick={handleCancel} 
                      variant="secondary"
                      size="medium"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary"
                      size="medium"
                    >
                      {editingDebt ? 'Actualizar' : 'Agregar'} Deuda
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className={styles.debtsList}>
            {getFilteredLiabilities().map(liability => {
              // Para deudas archivadas, mostrar solo una tarjeta simplificada
              if (showArchivedDebts) {
                return (
                  <div 
                    key={liability.id} 
                    className={`${styles.debtCard} ${styles.archivedCard}`}
                  >
                    <div className={styles.archivedHeader}>
                      <div className={styles.archivedInfo}>
                        <div className={styles.archivedName}>
                          <span className={styles.archivedIcon}>✅</span>
                          {getDebtTypeIcon(liability.type)}
                          {liability.name}
                        </div>
                        <div className={styles.archivedType}>
                          {getDebtTypeLabel(liability.type)}
                        </div>
                      </div>
                      <div className={styles.archivedDate}>
                        {liability.archivedAt && (
                          <span className={styles.completedDate}>
                            Pagada: {new Date(liability.archivedAt.toDate()).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.archivedSummary}>
                      <div className={styles.archivedAmount}>
                        <span className={styles.archivedLabel}>Monto original:</span>
                        <span className={styles.archivedValue}>
                          {formatCurrency(liability.originalAmount || liability.amount)}
                        </span>
                      </div>
                      {liability.description && (
                        <div className={styles.archivedDescription}>
                          <span className={styles.archivedDescLabel}>Notas:</span>
                          <span className={styles.archivedDescText}>{liability.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // Para deudas activas, mostrar la tarjeta completa
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
                      {liability.duration && liability.duration > 0 && (
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Plazo:</span>
                          <span className={styles.infoValue}>
                            {liability.duration} meses ({Math.round(liability.duration / 12 * 10) / 10} años)
                          </span>
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

                    {liability.monthlyPayment ? (
                      <div className={styles.paymentActions}>
                        <button
                          onClick={() => {
                            console.log('💳 Registrando pago mínimo para:', liability.name);
                            onMakePayment(liability.id, liability.monthlyPayment!, 'regular', 'Pago mínimo mensual')
                          }}
                          className={styles.paymentButton}
                        >
                          Registrar Pago Mínimo
                        </button>
                        <button
                          onClick={() => {
                            console.log('💳 Registrando pago extra para:', liability.name);
                            onMakePayment(liability.id, liability.monthlyPayment! * 1.5, 'extra', 'Pago extra')
                          }}
                          className={styles.extraPaymentButton}
                        >
                          Pago Extra (+50%)
                        </button>
                        
                        {/* Botón alternativo: Pago manual simple */}
                        <button
                          onClick={() => handleManualPayment(liability)}
                          style={{
                            marginTop: '8px',
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            width: '100%'
                          }}
                        >
                          💰 Pago Manual
                        </button>
                      </div>
                    ) : (
                      <div className={styles.noPaymentActions}>
                        <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic', margin: '10px 0' }}>
                          💡 Para registrar pagos automáticos, edita esta deuda y agrega un "Pago mensual mínimo"
                        </p>
                        
                        {/* Botón de pago manual para deudas sin pago mínimo */}
                        <button
                          onClick={() => handleManualPayment(liability)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            marginTop: '8px'
                          }}
                        >
                          💰 Pago Manual
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {getFilteredLiabilities().length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <TrendingDown size={48} />
                </div>
                {(() => {
                  const emptyContent = getEmptyStateContent();
                  return (
                    <>
                      <h4>{emptyContent.title}</h4>
                      <p>{emptyContent.message}</p>
                      {emptyContent.showButton && (
                        <button 
                          onClick={() => setShowAddForm(true)}
                          className={styles.addFirstButton}
                        >
                          <Plus size={16} />
                          Agregar primera deuda
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Diálogos personalizados */}
      <ConfirmDialog state={confirmDialog.dialogState} />
      <InputDialog state={inputDialog.dialogState} />
    </div>
  );
};

export { DebtManager };
export default DebtManager;
