import React, { useState } from 'react';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { FixedExpense } from '../../../types';
import styles from './PlanningSheets.module.css';

interface FixedExpensesSheetProps {
    isOpen: boolean;
    onClose: () => void;
    expenses: FixedExpense[];
    onAddExpense: (data: Omit<FixedExpense, 'id'>) => Promise<{ success: boolean; error?: string }>;
    onDeleteExpense: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const FixedExpensesSheet: React.FC<FixedExpensesSheetProps> = ({
    isOpen, onClose, expenses, onAddExpense, onDeleteExpense
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newDay, setNewDay] = useState('');

    if (!isOpen) return null;

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim() && newAmount.trim()) {
            const amount = parseFloat(newAmount);
            const day = parseInt(newDay);
            if (!isNaN(amount)) {
                await onAddExpense({
                    description: newName,
                    amount: amount,
                    dayOfMonth: !isNaN(day) ? day : 1,
                    category: 'General', // Default or could replace with selector
                    // description: '', // Removed redundancy
                    // isPaid: false // Not in type? Check types.ts. FixedExpense type doesn't have isPaid in interface shown in log? Actually type def in Step 1366 only has {id, description, amount, category, dayOfMonth, lastPostedMonth}. It does NOT have isPaid.
                });
                setNewName('');
                setNewAmount('');
                setNewDay('');
                setIsAdding(false);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Eliminar este gasto fijo?')) {
            await onDeleteExpense(id);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <div className={styles.iconBox} style={{ color: 'var(--text-primary)' }}>
                            <Receipt size={24} />
                        </div>
                        <div>
                            <h3 className={styles.title}>Gastos Fijos</h3>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {expenses.length} gastos mensuales
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
                        + Nuevo Gasto Fijo
                    </button>
                ) : (
                    <div className={styles.section} style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px', marginBottom: '16px' }}>
                        <span className={styles.label}>Agregar Gasto</span>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Nombre (ej. Netflix, Renta)"
                                className={styles.input}
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="number"
                                    placeholder="Monto"
                                    className={styles.input}
                                    value={newAmount}
                                    onChange={e => setNewAmount(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Día de pago (1-31)"
                                    className={styles.input}
                                    value={newDay}
                                    onChange={e => setNewDay(e.target.value)}
                                    min="1" max="31"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button type="submit" className={styles.btnPrimary} style={{ flex: 1 }}>Guardar</button>
                                <button type="button" onClick={() => setIsAdding(false)} className={styles.closeButton} style={{ flex: 1, padding: '0' }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List Section */}
                <div className={styles.section}>
                    <span className={styles.label}>Recurrentes</span>
                    <div className={styles.list}>
                        {expenses.map(exp => (
                            <div key={exp.id} className={styles.listItem}>
                                <div className={styles.itemContent}>
                                    <span className={styles.itemName}>{exp.description}</span>
                                    <span className={styles.itemValue}>Día {exp.dayOfMonth} del mes</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontWeight: 700 }}>
                                        {formatCurrency(exp.amount)}
                                    </span>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(exp.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {expenses.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                                No tienes gastos fijos registrados.
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
        </div>
    );
};
