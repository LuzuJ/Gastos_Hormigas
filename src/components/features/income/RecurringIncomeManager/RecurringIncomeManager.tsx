import React, { useState } from 'react';
import { Plus, Edit2, Calendar, DollarSign, Clock } from 'lucide-react';
import { Button, Input } from '../../../common';
import { LoadingStateWrapper } from '../../../LoadingState/LoadingState';
import { useFinancialAutomation } from '../../../../hooks/financials/useFinancialAutomation';
import { formatCurrency } from '../../../../utils/formatters';
import styles from './RecurringIncomeManager.module.css';
import type { RecurringIncome, RecurringIncomeFrequency } from '../../../../types';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface RecurringIncomeManagerProps {
  userId: string | null;
  paymentSources: { id: string; name: string; type: string }[];
  className?: string;
}

interface RecurringIncomeFormData {
  name: string;
  amount: number;
  frequency: RecurringIncomeFrequency;
  startDate: string;
  paymentSourceId: string;
  description: string;
  category: 'salary' | 'freelance' | 'business' | 'investment' | 'other';
}

const FREQUENCY_LABELS: Record<RecurringIncomeFrequency, string> = {
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  yearly: 'Anual'
};

const CATEGORY_LABELS = {
  salary: 'Salario',
  freelance: 'Freelance',
  business: 'Negocio',
  investment: 'Inversión',
  other: 'Otro'
};

export const RecurringIncomeManager: React.FC<RecurringIncomeManagerProps> = ({
  userId,
  paymentSources,
  className = ''
}) => {
  const {
    recurringIncomes,
    loading,
    error,
    createRecurringIncome,
    processAllRecurringIncomes,
    isProcessingAutomatic,
    clearError
  } = useFinancialAutomation(userId);

  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<RecurringIncome | null>(null);
  const [formData, setFormData] = useState<RecurringIncomeFormData>({
    name: '',
    amount: 0,
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    paymentSourceId: '',
    description: '',
    category: 'salary'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      paymentSourceId: '',
      description: '',
      category: 'salary'
    });
    setEditingIncome(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.amount <= 0) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const startDate = Timestamp.fromDate(new Date(formData.startDate));
      const nextDate = calculateNextDate(startDate, formData.frequency);

      const incomeData: Omit<RecurringIncome, 'id'> = {
        name: formData.name.trim(),
        amount: formData.amount,
        frequency: formData.frequency,
        startDate,
        nextDate,
        paymentSourceId: formData.paymentSourceId || undefined,
        isActive: true,
        description: formData.description.trim() || undefined,
        category: formData.category
      };

      await createRecurringIncome(incomeData);
      resetForm();
      toast.success('Ingreso recurrente creado correctamente');
    } catch (error) {
      console.error('Error creating recurring income:', error);
      toast.error('Error al crear el ingreso recurrente');
    }
  };

  const calculateNextDate = (startDate: Timestamp, frequency: RecurringIncomeFrequency): Timestamp => {
    const date = startDate.toDate();
    
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return Timestamp.fromDate(date);
  };

  const handleInputChange = (field: keyof RecurringIncomeFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatNextDate = (nextDate: Timestamp) => {
    return nextDate.toDate().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!userId) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.guestMessage}>
          <h3>Ingresos Recurrentes</h3>
          <p>Inicia sesión para gestionar tus ingresos recurrentes</p>
        </div>
      </div>
    );
  }

  return (
    <LoadingStateWrapper
      loading={loading}
      error={error}
      onDismissError={clearError}
      loadingMessage="Cargando ingresos recurrentes..."
    >
      <div className={`${styles.container} ${className}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>
              <Calendar size={24} />
              Ingresos Recurrentes
            </h2>
            <p className={styles.subtitle}>
              Configura tus ingresos automáticos para un mejor control financiero
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="outline"
              size="small"
              onClick={processAllRecurringIncomes}
              disabled={isProcessingAutomatic}
              icon={Clock}
            >
              {isProcessingAutomatic ? 'Procesando...' : 'Procesar Pendientes'}
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
              icon={Plus}
            >
              Nuevo Ingreso
            </Button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className={styles.modalOverlay} onClick={() => !editingIncome && resetForm()}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>{editingIncome ? 'Editar' : 'Nuevo'} Ingreso Recurrente</h3>
                <Button
                  variant="outline"
                  size="small"
                  onClick={resetForm}
                >
                  ✕
                </Button>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="income-name">
                      Nombre <span className={styles.required}>*</span>
                    </label>
                    <Input
                      id="income-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ej: Salario mensual"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="income-amount">
                      Monto <span className={styles.required}>*</span>
                    </label>
                    <Input
                      id="income-amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="income-frequency">Frecuencia</label>
                    <select
                      id="income-frequency"
                      value={formData.frequency}
                      onChange={(e) => handleInputChange('frequency', e.target.value as RecurringIncomeFrequency)}
                      className={styles.select}
                    >
                      {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="income-start-date">Fecha de inicio</label>
                    <Input
                      id="income-start-date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="income-payment-source">Fuente de pago</label>
                    <select
                      id="income-payment-source"
                      value={formData.paymentSourceId}
                      onChange={(e) => handleInputChange('paymentSourceId', e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Seleccionar fuente</option>
                      {paymentSources.map((source) => (
                        <option key={source.id} value={source.id}>
                          {source.name} ({source.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="income-category">Categoría</label>
                    <select
                      id="income-category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value as any)}
                      className={styles.select}
                    >
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="income-description">Descripción</label>
                  <Input
                    id="income-description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descripción opcional"
                  />
                </div>

                <div className={styles.formActions}>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingIncome ? 'Actualizar' : 'Crear'} Ingreso
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Income List */}
        <div className={styles.incomeList}>
          {recurringIncomes.length === 0 ? (
            <div className={styles.emptyState}>
              <Calendar size={48} />
              <h3>No hay ingresos recurrentes</h3>
              <p>Crea tu primer ingreso recurrente para automatizar tu flujo financiero</p>
              <Button
                variant="primary"
                onClick={() => setShowForm(true)}
                icon={Plus}
              >
                Crear Primer Ingreso
              </Button>
            </div>
          ) : (
            <div className={styles.incomeGrid}>
              {recurringIncomes.map((income) => (
                <div key={income.id} className={styles.incomeCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <h4>{income.name}</h4>
                      <span className={styles.category}>
                        {CATEGORY_LABELS[income.category || 'other']}
                      </span>
                    </div>
                    <div className={styles.cardActions}>
                      <Button
                        variant="outline"
                        size="small"
                        icon={Edit2}
                        onClick={() => {
                          setEditingIncome(income);
                          setShowForm(true);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.amount}>
                      <DollarSign size={20} />
                      <span>{formatCurrency(income.amount)}</span>
                    </div>
                    <div className={styles.frequency}>
                      <Clock size={16} />
                      <span>{FREQUENCY_LABELS[income.frequency]}</span>
                    </div>
                    <div className={styles.nextDate}>
                      <strong>Próximo:</strong> {formatNextDate(income.nextDate)}
                    </div>
                    {income.description && (
                      <div className={styles.description}>
                        {income.description}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={`${styles.status} ${income.isActive ? styles.active : styles.inactive}`}>
                      {income.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    {income.lastProcessed && (
                      <span className={styles.lastProcessed}>
                        Último: {income.lastProcessed.toDate().toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LoadingStateWrapper>
  );
};

export default RecurringIncomeManager;
