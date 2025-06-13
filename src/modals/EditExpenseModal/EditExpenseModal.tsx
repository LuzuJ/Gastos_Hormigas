import React, { useState, useEffect } from 'react';
import styles from '..//EditExpenseModal/EditExpenseModal.module.css';
import type { Expense, ExpenseFormData, Category } from '../../types';

interface EditModalProps {
  expense: Expense;
  categories: Category[];
  onClose: () => void;
  onSave: (id: string, data: Partial<ExpenseFormData>) => Promise<{ success: boolean }>;
}

export const EditExpenseModal: React.FC<EditModalProps> = ({ expense, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState<ExpenseFormData>({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await onSave(expense.id, formData);
        if (result.success) {
            onClose();
        }
    };
    
    // Cierra el modal si se presiona la tecla Escape
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3>Editar Gasto</h3>
                <form onSubmit={handleSave}>
                    {/* ... campos del formulario muy similares a ExpenseForm ... */}
                    {/* Description, Amount, Category Select */}
                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.saveButton}>Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};