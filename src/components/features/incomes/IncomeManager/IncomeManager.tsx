import React, { useState, useEffect } from 'react';
import { useIncomes } from '../../../../hooks/incomes/useIncomes';
import { useNetWorth } from '../../../../hooks/financials/useNetWorth';
import { formatCurrency } from '../../../../utils/formatters';
import { formatDate } from '../../../../utils/formatters';
import toast from 'react-hot-toast';
import { TrendingUp, DollarSign, Calendar, Tag, Repeat, Trash2, Edit, Plus, CheckCircle, X } from 'lucide-react';
import { Input } from '../../../common/Input/Input';
import { Modal } from '../../../ui/Modal';
import type { Income, Asset } from '../../../../types';
import styles from './IncomeManager.module.css';

interface IncomeManagerProps {
  userId: string;
}

export const IncomeManager: React.FC<IncomeManagerProps> = ({ userId }) => {
  // Hooks
  const { incomes, loading, error, addIncome, updateIncome, deleteIncome, refreshIncomes } = useIncomes(userId);
  const { assets } = useNetWorth(userId);

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Income['category']>('salary');
  const [assetId, setAssetId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'yearly'>('monthly');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Common income categories - map display names to values
  const incomeCategoryOptions: Array<{ label: string; value: Income['category'] }> = [
    { label: 'Salario', value: 'salary' },
    { label: 'Freelance', value: 'freelance' },
    { label: 'Inversiones', value: 'investment' },
    { label: 'Regalo', value: 'gift' },
    { label: 'Otro', value: 'other' }
  ];

  // Set default asset
  useEffect(() => {
    if (assets.length > 0 && !assetId) {
      const defaultAsset = assets.find((a: Asset) => a.type === 'cash') || assets[0];
      setAssetId(defaultAsset.id);
    }
  }, [assets, assetId]);

  // Load income for editing
  useEffect(() => {
    if (editingId) {
      const incomeToEdit = incomes.find(i => i.id === editingId);
      if (incomeToEdit) {
        setDescription(incomeToEdit.description);
        setAmount(incomeToEdit.amount.toString());
        setCategory(incomeToEdit.category);
        setAssetId(incomeToEdit.assetId || '');
        setDate(incomeToEdit.date.split('T')[0]);
        setIsRecurring(incomeToEdit.isRecurring);
        setRecurrenceFrequency(incomeToEdit.recurrenceFrequency || 'monthly');
        setShowModal(true);
      }
    }
  }, [editingId, incomes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!description.trim()) {
      setFormError('La descripción es requerida');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('El monto debe ser mayor a 0');
      return;
    }

    if (!assetId) {
      setFormError('Selecciona un activo');
      return;
    }

    const selectedAsset = assets.find(a => a.id === assetId);
    if (!selectedAsset) {
      setFormError('Activo no válido');
      return;
    }

    try {
      if (editingId) {
        // Update existing income
        const updateData: Partial<Income> = {
          description: description.trim(),
          amount: parsedAmount,
          category,
          assetId,
          assetName: selectedAsset.name,
          date,
          isRecurring,
          recurrenceFrequency: isRecurring ? recurrenceFrequency : undefined
        };

        await updateIncome(editingId, updateData);
        toast.success('💰 Ingreso actualizado');
        setEditingId(null);
      } else {
        // Create new income
        const newIncome: Omit<Income, 'id' | 'createdAt' | 'updatedAt'> = {
          description: description.trim(),
          amount: parsedAmount,
          category,
          assetId,
          assetName: selectedAsset.name,
          date,
          isRecurring,
          recurrenceFrequency: isRecurring ? recurrenceFrequency : undefined
        };

        await addIncome(newIncome as any);
        toast.success('💰 Ingreso registrado');
      }

      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error('Error submitting income:', err);
      setFormError(err instanceof Error ? err.message : 'Error al guardar el ingreso');
      toast.error('Error al guardar el ingreso');
    }
  };

  const handleDelete = async (id: string) => {
    if (!globalThis.confirm('¿Eliminar este ingreso?')) return;

    try {
      await deleteIncome(id);
      toast.success('Ingreso eliminado');
    } catch (err) {
      console.error('Error deleting income:', err);
      toast.error('Error al eliminar el ingreso');
    }
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('salary');
    setDate(new Date().toISOString().split('T')[0]);
    setIsRecurring(false);
    setRecurrenceFrequency('monthly');
    setFormError('');
    setEditingId(null);
    if (assets.length > 0) {
      const defaultAsset = assets.find((a: Asset) => a.type === 'cash') || assets[0];
      setAssetId(defaultAsset.id);
    }
  };

  // Calculate totals
  const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0);
  const recurringIncomes = incomes.filter(i => i.isRecurring);
  const totalRecurring = recurringIncomes.reduce((sum, income) => sum + income.amount, 0);

  if (error) {
    return (
      <div className={styles.error}>
        <p>⚠️ Error: {error}</p>
        <button onClick={refreshIncomes} className={styles.retryButton}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <TrendingUp className={styles.titleIcon} />
          Gestión de Ingresos
        </h2>
        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Total Ingresos</span>
            <span className={styles.summaryValue}>{formatCurrency(totalIncomes)}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>
              <Repeat size={14} />
              Ingresos Recurrentes
            </span>
            <span className={styles.summaryValue}>{formatCurrency(totalRecurring)}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Total Registros</span>
            <span className={styles.summaryValue}>{incomes.length}</span>
          </div>
        </div>
      </div>

      {/* FAB - Botón flotante para añadir */}
      <button
        type="button"
        className={styles.fab}
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
        title="Nuevo Ingreso"
      >
        <Plus size={24} />
      </button>

      {/* Modal con formulario */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingId ? 'Editar Ingreso' : 'Registrar Nuevo Ingreso'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {formError && (
            <div className={styles.formError}>
              ⚠️ {formError}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                <Tag size={14} />
                Descripción
              </label>
              <Input
                id="description"
                type="text"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                placeholder="Ej: Pago quincenal"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="amount" className={styles.label}>
                <DollarSign size={14} />
                Monto
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                onWheel={(e: React.WheelEvent<HTMLInputElement>) => e.preventDefault()}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => (e.target as HTMLInputElement).select()}
                placeholder="0.00"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.label}>
                <Tag size={14} />
                Categoría
              </label>
              <select
                id="category"
                value={category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as Income['category'])}
                className={styles.select}
                required
              >
                {incomeCategoryOptions.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="assetId" className={styles.label}>
                <DollarSign size={14} />
                Activo a Incrementar
              </label>
              <select
                id="assetId"
                value={assetId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAssetId(e.target.value)}
                className={styles.select}
                required
              >
                <option value="">Seleccionar activo...</option>
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} - {formatCurrency(asset.value)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="date" className={styles.label}>
                <Calendar size={14} />
                Fecha
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsRecurring(e.target.checked)}
                  className={styles.checkbox}
                />
                <Repeat size={14} />
                Ingreso Recurrente
              </label>
            </div>

            {isRecurring && (
              <div className={styles.formGroup}>
                <label htmlFor="frequency" className={styles.label}>
                  <Repeat size={14} />
                  Frecuencia
                </label>
                <select
                  id="frequency"
                  value={recurrenceFrequency}
                  onChange={(e) => setRecurrenceFrequency(e.target.value as any)}
                  className={styles.select}
                >
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              <CheckCircle size={16} />
              {editingId ? 'Actualizar' : 'Registrar'} Ingreso
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className={styles.cancelButton}
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Incomes List */}
      <div className={styles.listContainer}>
        <h3 className={styles.listTitle}>Historial de Ingresos</h3>

        {loading && incomes.length === 0 ? (
          <div className={styles.loading}>Cargando ingresos...</div>
        ) : incomes.length === 0 ? (
          <div className={styles.empty}>
            <TrendingUp size={48} className={styles.emptyIcon} />
            <p>No hay ingresos registrados</p>
            <p className={styles.emptyHint}>Registra tu primer ingreso para comenzar a llevar control</p>
          </div>
        ) : (
          <div className={styles.list}>
            {incomes.map(income => (
              <div key={income.id} className={`${styles.incomeCard} ${income.isRecurring ? styles.recurring : ''}`}>
                <div className={styles.incomeHeader}>
                  <div className={styles.incomeInfo}>
                    <h4 className={styles.incomeDescription}>
                      {income.description}
                      {income.isRecurring && (
                        <Repeat size={14} className={styles.recurringIcon} />
                      )}
                    </h4>
                    <div className={styles.incomeMeta}>
                      <span className={styles.incomeCategory}>
                        <Tag size={12} />
                        {income.category}
                      </span>
                      <span className={styles.incomeDate}>
                        <Calendar size={12} />
                        {formatDate(income.date)}
                      </span>
                      <span className={styles.incomeAsset}>
                        <DollarSign size={12} />
                        {income.assetName}
                      </span>
                      {income.isRecurring && income.recurrenceFrequency && (
                        <span className={styles.incomeFrequency}>
                          {income.recurrenceFrequency === 'weekly' && 'Semanal'}
                          {income.recurrenceFrequency === 'biweekly' && 'Quincenal'}
                          {income.recurrenceFrequency === 'monthly' && 'Mensual'}
                          {income.recurrenceFrequency === 'yearly' && 'Anual'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.incomeAmount}>
                    {formatCurrency(income.amount)}
                  </div>
                </div>
                <div className={styles.incomeActions}>
                  <button
                    onClick={() => setEditingId(income.id)}
                    className={styles.editButton}
                    title="Editar"
                  >
                    <Edit size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(income.id)}
                    className={styles.deleteButton}
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
