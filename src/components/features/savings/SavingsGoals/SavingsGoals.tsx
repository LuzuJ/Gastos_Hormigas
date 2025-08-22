import React, { useState } from 'react';
import styles from './SavingsGoals.module.css';
import { Target, Trash2, Plus, Minus, Lock } from 'lucide-react';
import type { SavingsGoal, SavingsGoalFormData } from '../../../../types';
import { AddFundsModal } from '../../../modals/AddFundsModal/AddFundsModal';
import { RemoveFundsModal } from '../../../modals/RemoveFundsModal/RemoveFundsModal';
import { Input, Button } from '../../../common';

interface SavingsGoalsProps {
  savingsGoals: SavingsGoal[];
  onAdd: (data: SavingsGoalFormData) => Promise<{ success: boolean; error?: string; }>;
  onDelete: (id: string) => Promise<void>;
  onAddFunds: (id: string, amount: number) => Promise<{ success: boolean; error?: string; }>;
  onRemoveFunds: (id: string, amount: number) => Promise<{ success: boolean; error?: string; }>;
  isGuest?: boolean; 
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({ savingsGoals, onAdd, onDelete, onAddFunds, onRemoveFunds, isGuest }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [error, setError] = useState('');
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isGuest) return;
    const parsedAmount = parseFloat(targetAmount);

    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Por favor, ingresa un nombre válido.');
      return;
    }

    const result = await onAdd({ name, targetAmount: parsedAmount });
    if (result.success) {
      setName('');
      setTargetAmount('');
    } else {
      setError(result.error || 'No se pudo crear la meta.');
    }
  };

  const handleOpenModal = (goal: SavingsGoal) => {
    if (isGuest) return;
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = (goalId: string) => {
    if (isGuest) return; 
    onDelete(goalId);
  }

  const handleOpenRemoveModal = (goal: SavingsGoal) => { 
    if (isGuest) return;
    setSelectedGoal(goal);
    setIsRemoveModalOpen(true);
  };

  const handleSaveFunds = (amount: number) => {
    if (selectedGoal) onAddFunds(selectedGoal.id, amount);
  };

  const handleRemoveFunds = async (amount: number) => { // <-- Nueva función para guardar
    if (selectedGoal) {
      const result = await onRemoveFunds(selectedGoal.id, amount);
      if (result && !result.success) {
        alert(result.error); // O mostrar un toast
      }
    }
  };

  return (
    <>
      {isModalOpen && selectedGoal && (
        <AddFundsModal
          goalName={selectedGoal.name}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveFunds}
        />
      )}
    
    {/* ↓ Renderiza el nuevo modal ↓ */}
      {isRemoveModalOpen && selectedGoal && (
        <RemoveFundsModal
          goalName={selectedGoal.name}
          maxAmount={selectedGoal.currentAmount}
          onClose={() => setIsRemoveModalOpen(false)}
          onSave={handleRemoveFunds}
        />
      )}

    <div className={styles.card}>
      <div className={styles.header}>
        <Target className={styles.icon} />
        <h3>Metas de Ahorro</h3>
      </div>

      {isGuest ? (
        <div className={styles.guestOverlay}>
          <Lock size={18} />
          <p>Crea una cuenta para añadir metas de ahorro.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre (ej. Vacaciones)" />
          <Input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="Monto Objetivo" />
          <Button type="submit" variant="primary">Crear Meta</Button>
        </form>
      )}
      {error && <p className={styles.formError}>{error}</p>}

      <ul className={styles.list}>
          {savingsGoals.length === 0 && <p className={styles.emptyMessage}>Aún no tienes metas de ahorro. ¡Crea una!</p>}
          {savingsGoals.map(goal => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            return (
              <li key={goal.id} className={styles.listItem}>
                
                {/* Encabezado con nombre y montos */}
                <div className={styles.goalInfo}>
                  <span className={styles.goalName}>{goal.name}</span>
                  <span className={styles.goalAmount}>
                    ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>

                {/* Acciones */}
                <div className={styles.actions}>
                  <button onClick={() => handleOpenModal(goal)} className={styles.actionButton} disabled={isGuest}>
                    <Plus size={16} /> Añadir
                  </button>
                  <button onClick={() => handleOpenRemoveModal(goal)} className={styles.actionButton} disabled={isGuest || goal.currentAmount === 0}>
                    <Minus size={16} /> Quitar
                  </button>
                  <button onClick={() => handleDelete(goal.id)} className={`${styles.actionButton} ${styles.deleteButton}`} disabled={isGuest}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
        })}
      </ul>
    </div>
    </>
  );
};

function onRemoveFunds(id: string, amount: number) {
  throw new Error('Function not implemented.');
}
