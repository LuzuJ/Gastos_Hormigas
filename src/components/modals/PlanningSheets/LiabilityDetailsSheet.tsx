import React, { useState } from 'react';
import { Plus, Trash2, TrendingDown, Pencil } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { Liability, LiabilityFormData } from '../../../types';
import styles from './PlanningSheets.module.css';

interface LiabilityDetailsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    liabilities: Liability[];
    onAddLiability: (data: LiabilityFormData) => Promise<{ success: boolean; error?: string }>;
    onUpdateLiability: (id: string, data: Partial<LiabilityFormData>) => Promise<{ success: boolean; error?: string }>;
    onDeleteLiability: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const LiabilityDetailsSheet: React.FC<LiabilityDetailsSheetProps> = ({
    isOpen, onClose, liabilities, onAddLiability, onUpdateLiability, onDeleteLiability
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newRate, setNewRate] = useState('');
    const [newMinPayment, setNewMinPayment] = useState('');

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim() && newAmount.trim()) {
            const amount = parseFloat(newAmount);
            if (!isNaN(amount)) {
                const data = {
                    name: newName,
                    amount: amount,
                    interestRate: parseFloat(newRate) || 0,
                    monthlyPayment: parseFloat(newMinPayment) || 0,
                    type: 'other' as const
                };

                if (editingId) {
                    await onUpdateLiability(editingId, data);
                } else {
                    await onAddLiability(data);
                }
                resetForm();
            }
        }
    };

    const handleEditClick = (liability: Liability) => {
        setNewName(liability.name);
        setNewAmount(liability.amount.toString());
        setNewRate(liability.interestRate?.toString() || '');
        setNewMinPayment(liability.monthlyPayment?.toString() || '');
        setEditingId(liability.id);
        setIsAdding(true);
    };

    const resetForm = () => {
        setNewName('');
        setNewAmount('');
        setNewRate('');
        setNewMinPayment('');
        setEditingId(null);
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Eliminar esta deuda?')) {
            const result = await onDeleteLiability(id);
            if (!result.success) {
                const msg = result.error?.includes('foreign key')
                    ? 'No se puede eliminar esta deuda porque tiene pagos asociados. Elimina primero los gastos vinculados.'
                    : (result.error || 'No se pudo eliminar la deuda.');
                alert(msg);
            }
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <div className={styles.iconBox} style={{ color: 'var(--danger)' }}>
                            <TrendingDown size={24} />
                        </div>
                        <div>
                            <h3 className={styles.title}>Mis Pasivos</h3>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {liabilities.length} deudas registradas
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
                        + Nueva Deuda
                    </button>
                ) : (
                    <div className={styles.section} style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px', marginBottom: '16px' }}>
                        <span className={styles.label}>{editingId ? 'Editar Deuda' : 'Agregar Deuda'}</span>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Nombre (ej. Tarjeta Crédito)"
                                className={styles.input}
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="number"
                                    placeholder="Monto Total"
                                    className={styles.input}
                                    value={newAmount}
                                    onChange={e => setNewAmount(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="number"
                                    placeholder="Interés % (Opcional)"
                                    className={styles.input}
                                    value={newRate}
                                    onChange={e => setNewRate(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Pago Min. (Opcional)"
                                    className={styles.input}
                                    value={newMinPayment}
                                    onChange={e => setNewMinPayment(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button type="submit" className={styles.btnPrimary} style={{ flex: 1 }}>Guardar</button>
                                <button type="button" onClick={resetForm} className={styles.closeButton} style={{ flex: 1, padding: '0' }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List Section */}
                <div className={styles.section}>
                    <span className={styles.label}>Lista de Deudas</span>
                    <div className={styles.list}>
                        {liabilities.map(liability => (
                            <div key={liability.id} className={styles.listItem}>
                                <div className={styles.itemContent}>
                                    <span className={styles.itemName}>{liability.name}</span>
                                    {liability.interestRate !== undefined && liability.interestRate > 0 && (
                                        <span className={styles.itemValue}>{liability.interestRate}% Interés</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--danger)' }}>
                                            {formatCurrency(liability.amount)}
                                        </div>
                                        {liability.monthlyPayment !== undefined && liability.monthlyPayment > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                Min: {formatCurrency(liability.monthlyPayment)}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className={styles.iconButton}
                                        onClick={() => handleEditClick(liability)}
                                        title="Editar"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(liability.id)}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {liabilities.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                                No tienes pasivos registrados.
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
