import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import styles from './ExpenseForm.module.css';
import type { Category, ExpenseFormData, SubCategory } from '../../types';

interface ExpenseFormProps {
    onAdd: (data: ExpenseFormData) => Promise<{ success: boolean; error?: string }>;
    categories: Category[];
    isSubmitting: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd, categories, isSubmitting }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);
    const [formError, setFormError] = useState('');
    
    // Sincroniza la categoría seleccionada por defecto cuando la lista carga
    useEffect(() => {
        if (categories.length > 0 && !selectedCategoryId) {
            const firstCategory = categories[0];
            setSelectedCategoryId(firstCategory.id);
            setAvailableSubCategories(firstCategory.subcategories);
            setSelectedSubCategory(firstCategory.subcategories[0]?.name || '');
        }
    }, [categories.length, selectedCategoryId]);

    // Efecto para actualizar las subcategorías cuando cambia la categoría principal
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategoryId = e.target.value;
        setSelectedCategoryId(newCategoryId);
        const category = categories.find(c => c.id === newCategoryId);
        const subcategories = category?.subcategories || [];
        setAvailableSubCategories(subcategories);
        setSelectedSubCategory(subcategories[0]?.name || '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await onAdd({
            description,
            amount: parseFloat(amount) || 0,
            categoryId: selectedCategoryId,
            subCategory: selectedSubCategory
        });
        if (result.success) { /* Limpiar formulario */ } 
        else { setFormError(result.error || 'Ocurrió un error'); }
    };

    return (
        <div className={styles.card}>
            <h2 className={styles.title}><PlusCircle className={styles.icon}/>Añadir Gasto</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroupDescription}>
                    <label htmlFor="description" className={styles.label}>Descripción</label>
                    <input id="description" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej: Café con leche" className={styles.input}/>
                </div>
                <div className={styles.formGroupAmount}>
                    <label htmlFor="amount" className={styles.label}>Monto ($)</label>
                    <input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className={styles.input}/>
                </div>
                <div className={styles.formGroupCategory}>
                    <label htmlFor="category" className={styles.label}>Categoría</label>
                    <select id="category" value={selectedCategoryId} onChange={handleCategoryChange} className={styles.select}>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                <div className={styles.formGroupSubCategory}>
                    <label htmlFor="subCategory" className={styles.label}>Subcategoría</label>
                    <select id="subCategory" value={selectedSubCategory} onChange={e => setSelectedSubCategory(e.target.value)} className={styles.select} disabled={availableSubCategories.length === 0}>
                        {availableSubCategories.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                    </select>
                </div>
                <div className={styles.fullWidth}>
                   {formError && <p className={styles.error}>{formError}</p>}
                    <button type="submit" disabled={isSubmitting} className={styles.button}>
                        {isSubmitting ? 'Agregando...' : 'Agregar Gasto'}
                    </button>
                </div>
            </form>
        </div>
    );
};
