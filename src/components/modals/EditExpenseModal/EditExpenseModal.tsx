import React, { useState, useEffect } from 'react';
import styles from './EditExpenseModal.module.css';
import type { Expense, ExpenseFormData, Category, SubCategory } from '../../../types';
import { expenseFormSchema } from '../../../schemas';

interface EditModalProps {
  expense: Expense;
  categories: Category[];
  onClose: () => void;
  onSave: (id: string, data: Partial<ExpenseFormData>) => Promise<{ success: boolean; error?: string; }>;
  onAddSubCategory: (categoryId: string, subCategoryName: string) => Promise<void>;
}

const ADD_NEW_SUBCATEGORY_VALUE = '--add-new--';

export const EditExpenseModal: React.FC<EditModalProps> = ({ expense, categories, onClose, onSave, onAddSubCategory }) => {
    const [formData, setFormData] = useState({
        description: expense.description,
        amount: expense.amount,
        categoryId: expense.categoryId,
        subCategory: expense.subCategory,
    });

    const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);
    const [error, setError] = useState('');
    const [showNewSubCategoryInput, setShowNewSubCategoryInput] = useState(false);
    const [newSubCategoryName, setNewSubCategoryName] = useState('');

    useEffect(() => {
        const initialCategory = categories.find(c => c.id === expense.categoryId);
        if (initialCategory) {
            setAvailableSubCategories(initialCategory.subcategories || []);
        }
    }, [expense.categoryId, categories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategoryId = e.target.value;
        const category = categories.find(c => c.id === newCategoryId);
        const subcategories = category?.subcategories || [];

        setAvailableSubCategories(subcategories);

        const newSubCategory = subcategories.length > 0 ? subcategories[0].name : ADD_NEW_SUBCATEGORY_VALUE;

        setFormData(prev => ({
            ...prev,
            categoryId: newCategoryId,
            subCategory: newSubCategory
        }));

        setShowNewSubCategoryInput(subcategories.length === 0);
        if (subcategories.length > 0) {
            setNewSubCategoryName('');
        }
    };

    const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFormData(prev => ({...prev, subCategory: value}));

        if (value === ADD_NEW_SUBCATEGORY_VALUE) {
            setShowNewSubCategoryInput(true);
        } else {
            setShowNewSubCategoryInput(false);
            setNewSubCategoryName('');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        let subCategoryToSave = formData.subCategory;

        if (showNewSubCategoryInput) {
            if (newSubCategoryName.trim().length < 2) {
                setError('El nombre de la nueva subcategoría es muy corto.');
                return;
            }
            const finalNewSubCategoryName = newSubCategoryName.trim();
            await onAddSubCategory(formData.categoryId, finalNewSubCategoryName);
            subCategoryToSave = finalNewSubCategoryName;
        }

        const validationResult = expenseFormSchema.safeParse({
            description: formData.description,
            amount: formData.amount,
            categoryId: formData.categoryId,
            subCategory: subCategoryToSave,
        });


        if (!validationResult.success) {
            setError(validationResult.error.issues[0].message);
            return;
        }

        const result = await onSave(expense.id, validationResult.data);
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
                        <select id="edit-category" name="categoryId" value={formData.categoryId} onChange={handleCategoryChange}>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="edit-subCategory">Subcategoría</label>
                        <select id="edit-subCategory" name="subCategory" value={formData.subCategory} onChange={handleSubCategoryChange}>
                            {availableSubCategories.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                            <option value={ADD_NEW_SUBCATEGORY_VALUE}>+ Crear nueva subcategoría...</option>
                        </select>
                    </div>

                    {showNewSubCategoryInput && (
                        <div className={styles.formGroup}>
                            <label htmlFor="newSubCategory">Nombre de la Nueva Subcategoría</label>
                            <input
                                id="newSubCategory"
                                name="newSubCategoryName"
                                type="text"
                                value={newSubCategoryName}
                                onChange={(e) => setNewSubCategoryName(e.target.value)}
                                placeholder="Ej: Comida para llevar"
                                autoFocus
                            />
                        </div>
                    )}

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