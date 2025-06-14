import React, { useState, useEffect } from 'react';
import styles from './EditExpenseModal.module.css';
import type { Expense, ExpenseFormData, Category } from '../../../types';

interface EditModalProps {
  expense: Expense;
  categories: Category[];
  onClose: () => void;
  onSave: (id: string, data: Partial<ExpenseFormData>) => Promise<{ success: boolean; error?: string; }>;
}

export const EditExpenseModal: React.FC<EditModalProps> = ({ expense, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState<ExpenseFormData>({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
    });
    
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value 
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); 
        if (!formData.description.trim() || formData.amount <= 0) {
            setError('Por favor, ingresa una descripción y un monto válido.');
            return;
        }
        
        const result = await onSave(expense.id, formData);
        if (result.success) {
            onClose(); 
        } else {
            setError(result.error || 'No se pudieron guardar los cambios.');
        }
    };
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3>Editar Gasto</h3>
                <form onSubmit={handleSave} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="edit-description">Descripción</label>
                        <input id="edit-description" name="description" type="text" value={formData.description} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="edit-amount">Monto ($)</label>
                        <input id="edit-amount" name="amount" type="number" value={formData.amount} onChange={handleChange} step="0.01" />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="edit-category">Categoría</label>
                        <select id="edit-category" name="category" value={formData.category} onChange={handleChange}>
                            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={`${styles.button} ${styles.cancelButton}`}>Cancelar</button>
                        <button type="submit" className={`${styles.button} ${styles.saveButton}`}>Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};