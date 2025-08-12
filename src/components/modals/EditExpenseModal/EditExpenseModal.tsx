import React, { useState, useEffect } from 'react';
import styles from './EditExpenseModal.module.css';
import type { Expense, ExpenseFormData, Category, SubCategory } from '../../../types';

interface EditModalProps {
  expense: Expense;
  categories: Category[];
  onClose: () => void;
  onSave: (id: string, data: Partial<ExpenseFormData>) => Promise<{ success: boolean; error?: string; }>;
}

export const EditExpenseModal: React.FC<EditModalProps> = ({ expense, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<ExpenseFormData>>({
        description: expense.description,
        amount: expense.amount,
        categoryId: expense.categoryId,
        subCategory: expense.subCategory,
    });
    
    const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const category = categories.find(c => c.id === formData.categoryId);
        setAvailableSubCategories(category?.subcategories || []);
    }, [formData.categoryId, categories]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategoryId = e.target.value;
        const category = categories.find(c => c.id === newCategoryId);
        const subcategories = category?.subcategories || [];
        setAvailableSubCategories(subcategories);
        setFormData(prev => ({
            ...prev,
            categoryId: newCategoryId,
            subCategory: subcategories[0]?.name || ''
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value 
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        // Aseguramos que formData sea del tipo correcto antes de guardar
        if (formData.description && formData.amount && formData.categoryId && formData.subCategory) {
            const result = await onSave(expense.id, formData as ExpenseFormData);
            if (result.success) onClose();
            else setError(result.error || 'No se pudieron guardar los cambios.');
        } else {
            setError('Todos los campos son requeridos.');
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
                        <select id="edit-category" name="categoryId" value={formData.categoryId} onChange={handleCategoryChange}>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="edit-subCategory">Subcategoría</label>
                        <select id="edit-subCategory" name="subCategory" value={formData.subCategory} onChange={handleChange} disabled={availableSubCategories.length === 0}>
                            {availableSubCategories.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
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
