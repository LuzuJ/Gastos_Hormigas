import React, { useState } from 'react';
import { Plus, Trash2, Target, PiggyBank, Pencil, TrendingDown, Check, X } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { SavingsGoal, SavingsGoalFormData } from '../../../types';
import styles from './PlanningSheets.module.css';

interface SavingsGoalSheetProps {
    isOpen: boolean;
    onClose: () => void;
    goals: SavingsGoal[];
    onAddGoal: (data: SavingsGoalFormData) => Promise<{ success: boolean; error?: string }>;
    onUpdateGoal: (id: string, data: Partial<SavingsGoalFormData>) => Promise<{ success: boolean; error?: string }>;
    onDeleteGoal: (id: string) => Promise<{ success: boolean; error?: string }>;
    onAddAmount: (id: string, amount: number) => Promise<{ success: boolean; error?: string }>;
    onSubtractAmount: (id: string, amount: number) => Promise<{ success: boolean; error?: string }>;
}

export const SavingsGoalSheet: React.FC<SavingsGoalSheetProps> = ({
    isOpen, onClose, goals, onAddGoal, onUpdateGoal, onDeleteGoal, onAddAmount, onSubtractAmount
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const [newCurrent, setNewCurrent] = useState('');
    const [newDeadline, setNewDeadline] = useState('');

    // Transaction State
    const [transactingGoalId, setTransactingGoalId] = useState<string | null>(null);
    const [transactionType, setTransactionType] = useState<'add' | 'sub' | null>(null);
    const [transactionAmount, setTransactionAmount] = useState('');

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim() && newTarget.trim()) {
            const targetAmount = parseFloat(newTarget);
            if (!isNaN(targetAmount)) {
                if (editingId) {
                    await onUpdateGoal(editingId, {
                        name: newName,
                        targetAmount: targetAmount,
                        targetDate: newDeadline ? newDeadline : undefined
                    });
                } else {
                    await onAddGoal({
                        name: newName,
                        targetAmount: targetAmount,
                        targetDate: newDeadline ? newDeadline : undefined,
                        icon: 'PiggyBank',
                        color: '#10B981'
                    });
                }
                resetForm();
            }
        }
    };

    const handleEditClick = (goal: SavingsGoal) => {
        setNewName(goal.name);
        setNewTarget(goal.targetAmount.toString());
        setNewDeadline(goal.targetDate || '');
        setEditingId(goal.id);
        setIsAdding(true);
    };

    const resetForm = () => {
        setNewName('');
        setNewTarget('');
        setNewCurrent('');
        setNewDeadline('');
        setEditingId(null);
        setIsAdding(false);
    };

    const handleTransactionClick = (id: string, type: 'add' | 'sub') => {
        setTransactingGoalId(id);
        setTransactionType(type);
        setTransactionAmount('');
    };

    const submitTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (transactingGoalId && transactionType && transactionAmount) {
            const amount = parseFloat(transactionAmount);
            if (!isNaN(amount) && amount > 0) {
                if (transactionType === 'add') {
                    await onAddAmount(transactingGoalId, amount);
                } else {
                    await onSubtractAmount(transactingGoalId, amount);
                }
                cancelTransaction();
            }
        }
    };

    const cancelTransaction = () => {
        setTransactingGoalId(null);
        setTransactionType(null);
        setTransactionAmount('');
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Eliminar esta meta de ahorro?')) {
            await onDeleteGoal(id);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <div className={styles.iconBox} style={{ color: 'var(--primary)' }}>
                            <Target size={24} />
                        </div>
                        <div>
                            <h3 className={styles.title}>Metas de Ahorro</h3>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {goals.length} metas activas
                            </span>
                        </div>
                    </div>
                </div>

                {/* Add Section */}
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className={styles.closeButton}
                        style={{ background: 'var(--primary)', color: 'white', marginBottom: '16px' }}
                    >
                        + Nueva Meta
                    </button>
                ) : (
                    <div className={styles.section} style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px', marginBottom: '16px' }}>
                        <span className={styles.label}>{editingId ? 'Editar Meta' : 'Definir Meta'}</span>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Nombre (ej. Nuevo Coche)"
                                className={styles.input}
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="number"
                                    placeholder="Meta (Monto)"
                                    className={styles.input}
                                    value={newTarget}
                                    onChange={e => setNewTarget(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Ahorrado ya (Opc.)"
                                    className={styles.input}
                                    value={newCurrent}
                                    onChange={e => setNewCurrent(e.target.value)}
                                />
                            </div>
                            <input
                                type="date"
                                className={styles.input}
                                value={newDeadline}
                                onChange={e => setNewDeadline(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button type="submit" className={styles.btnPrimary} style={{ flex: 1 }}>Guardar</button>
                                <button type="button" onClick={resetForm} className={styles.closeButton} style={{ flex: 1, padding: '0' }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List Section */}
                <div className={styles.section}>
                    <span className={styles.label}>Mis Metas</span>
                    <div className={styles.list}>
                        {goals.map(goal => {
                            const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                            return (
                                <div key={goal.id} className={styles.listItem} style={{ display: 'block' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div onClick={() => handleEditClick(goal)} style={{ cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <PiggyBank size={18} color={goal.color} />
                                            <span className={styles.itemName}>{goal.name}</span>
                                            <Pencil size={12} className={styles.editIcon} color="var(--text-secondary)" />
                                        </div>

                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                className={styles.iconButton}
                                                onClick={() => handleTransactionClick(goal.id, 'add')}
                                                style={{ color: 'var(--success)' }}
                                                title="Abonar"
                                            >
                                                <Plus size={16} />
                                            </button>
                                            <button
                                                className={styles.iconButton}
                                                onClick={() => handleTransactionClick(goal.id, 'sub')}
                                                style={{ color: 'var(--warning)' }}
                                                title="Retirar"
                                            >
                                                <TrendingDown size={16} />
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(goal.id)}
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Transaction Inline Form */}
                                    {
                                        transactingGoalId === goal.id && (
                                            <form onSubmit={submitTransaction} className={styles.section} style={{ padding: '12px', background: 'var(--bg-hover)', borderRadius: '8px', marginBottom: '12px', marginTop: '4px' }}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                                        {transactionType === 'add' ? 'Abonar a la meta:' : 'Retirar de la meta:'}
                                                    </span>
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        placeholder="Monto"
                                                        className={styles.input}
                                                        style={{ flex: 1, padding: '4px 8px' }}
                                                        value={transactionAmount}
                                                        onChange={e => setTransactionAmount(e.target.value)}
                                                    />
                                                    <button type="submit" className={styles.iconButton} style={{ color: 'var(--success)', background: 'rgba(var(--success-rgb), 0.1)' }}>
                                                        <Check size={18} />
                                                    </button>
                                                    <button type="button" onClick={cancelTransaction} className={styles.iconButton} style={{ color: 'var(--text-secondary)' }}>
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </form>
                                        )
                                    }

                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(goal.currentAmount)}</span>
                                        <span style={{ fontWeight: 600 }}>{formatCurrency(goal.targetAmount)}</span>
                                    </div>

                                    <div style={{ height: '6px', background: 'var(--bg-body)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${percent}%`, height: '100%', background: goal.color || 'var(--primary)', transition: 'width 0.5s' }} />
                                    </div>
                                </div>
                            );
                        })}
                        {goals.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                                Define una meta para empezar a ahorrar.
                            </div>
                        )}
                    </div>
                </div>

                {/* Close Button */}
                <div className={styles.closeButtonContainer}>
                    <button onClick={onClose} className={styles.closeButton}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div >
    );
};
