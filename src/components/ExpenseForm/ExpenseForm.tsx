import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import styles from './ExpenseForm.module.css';
import toast from 'react-hot-toast';
import type { Category, Expense, ExpenseFormData, SubCategory } from '../../types';
import { BudgetProgressBar } from '../BudgetProgressBar/BudgetProgressBar';
import { Input } from '../common';
import { expenseFormSchema } from '../../schemas';

interface ExpenseFormProps {
    onAdd: (data: Omit<ExpenseFormData, 'createdAt'>) => Promise<{ success: boolean; error?: string }>; // <-- CORRECCIÓN 1
    onAddSubCategory: (categoryId: string, subCategoryName: string) => Promise<void>;
    categories: Category[];
    expenses: Expense[];
    isSubmitting: boolean;
}

const ADD_NEW_SUBCATEGORY_VALUE = '--add-new--';

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd, onAddSubCategory, categories, expenses, isSubmitting }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);
    const [formError, setFormError] = useState('');
    const [showNewSubCategoryInput, setShowNewSubCategoryInput] = useState(false);
    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [isOpen, setIsOpen] = useState(true); // Para el formulario plegable

     useEffect(() => {
        if (categories.length > 0 && !selectedCategoryId) {
            const firstCategory = categories[0];
            setSelectedCategoryId(firstCategory.id);
            const subcategories = firstCategory.subcategories || [];
            setAvailableSubCategories(subcategories);
            
            if (subcategories.length > 0) {
                setSelectedSubCategory(subcategories[0].name);
                setShowNewSubCategoryInput(false);
            } else {
                setSelectedSubCategory(ADD_NEW_SUBCATEGORY_VALUE);
                setShowNewSubCategoryInput(true);
            }
        }
    }, [categories, selectedCategoryId]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategoryId = e.target.value;
        setSelectedCategoryId(newCategoryId);
        const category = categories.find(c => c.id === newCategoryId);
        const subcategories = category?.subcategories || [];
        
        setAvailableSubCategories(subcategories);
        
        if (subcategories.length > 0) {
            setSelectedSubCategory(subcategories[0].name);
            setShowNewSubCategoryInput(false);
        } else {
            setSelectedSubCategory(ADD_NEW_SUBCATEGORY_VALUE);
            setShowNewSubCategoryInput(true);
        }
    };

    const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedSubCategory(value);
        if (value === ADD_NEW_SUBCATEGORY_VALUE) {
            setShowNewSubCategoryInput(true);
        } else {
            setShowNewSubCategoryInput(false);
            setNewSubCategoryName('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(''); 

        let subCategoryToSave: string;

        if (showNewSubCategoryInput) {
            if (newSubCategoryName.trim().length < 2) {
                setFormError('El nombre de la nueva subcategoría es muy corto.');
                return;
            }
            await onAddSubCategory(selectedCategoryId, newSubCategoryName.trim());
            subCategoryToSave = newSubCategoryName.trim();
        } else {
            subCategoryToSave = selectedSubCategory;
        }

        const validationResult = expenseFormSchema.safeParse({
            description,
            amount,
            categoryId: selectedCategoryId,
            subCategory: subCategoryToSave
        });

        if (!validationResult.success) {
            const firstError = validationResult.error.issues[0].message;
            setFormError(firstError);
            return;
        }

        const result = await onAdd(validationResult.data);

        if (result.success) {
            toast.success('¡Gasto añadido con éxito!')
            setDescription('');
            setAmount('');
            setFormError('');
            setNewSubCategoryName('');
            setShowNewSubCategoryInput(false);
            if (categories.length > 0) {
                const firstCategory = categories[0];
                setSelectedCategoryId(firstCategory.id);
                setAvailableSubCategories(firstCategory.subcategories);
                setSelectedSubCategory(firstCategory.subcategories[0]?.name || '');
            }
        } else { 
            toast.error(result.error || 'Ocurrió un error inesperado.');
            setFormError(result.error || 'Ocurrió un error inesperado.'); 
        }
    };
    
    const budgetInfo = useMemo(() => {
        if (!selectedCategoryId) return null;
        const category = categories.find(c => c.id === selectedCategoryId);
        if (!category || !category.budget) return null;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const spent = expenses
            .filter(e => {
                const expenseDate = e.createdAt?.toDate();
                return e.categoryId === selectedCategoryId &&
                       expenseDate &&
                       expenseDate.getMonth() === currentMonth &&
                       expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);
        return { budget: category.budget, spent };
    }, [selectedCategoryId, categories, expenses]);

    return (
        <div className={styles.card}>
            <button
                type="button"
                className={styles.title}
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                aria-expanded={isOpen}
            >
                <PlusCircle className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`} />
                <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>Añadir Gasto</span>
            </button>
            
            {isOpen && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroupDescription}>
                        <label htmlFor="description" className={styles.label}>Descripción</label>
                        <Input 
                            id="description" 
                            type="text" 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            placeholder="Ej: Café con leche" 
                        />
                    </div>
                    <div className={styles.formGroupAmount}>
                        <label htmlFor="amount" className={styles.label}>Monto ($)</label>
                        <Input 
                            id="amount" 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)} 
                            placeholder="0.00" 
                        />
                    </div>
                    <div className={styles.formGroupCategory}>
                        <label htmlFor="category" className={styles.label}>Categoría</label>
                        <select id="category" value={selectedCategoryId} onChange={handleCategoryChange} className={styles.select}>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroupSubCategory}>
                        <label htmlFor="subCategory" className={styles.label}>Subcategoría</label>
                        <select id="subCategory" value={selectedSubCategory} onChange={handleSubCategoryChange} className={styles.select}>
                            {availableSubCategories.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                            <option value={ADD_NEW_SUBCATEGORY_VALUE}>+ Crear nueva subcategoría...</option>
                        </select>
                    </div>
                    {showNewSubCategoryInput && (
                        <div className={styles.formGroupNewSubCategory}>
                            <label htmlFor="newSubCategory" className={styles.label}>Nombre de la Nueva Subcategoría</label>
                            <Input
                                id="newSubCategory"
                                type="text"
                                value={newSubCategoryName}
                                onChange={(e) => setNewSubCategoryName(e.target.value)}
                                placeholder="Ej: Comida para llevar"
                            />
                        </div>
                    )}
                    {budgetInfo && (
                        <div className={`${styles.fullWidth} ${styles.budgetTracker}`}>
                            <label className={styles.label}>Progreso del Presupuesto para "{categories.find(c=>c.id === selectedCategoryId)?.name}"</label>
                            <BudgetProgressBar spent={budgetInfo.spent} budget={budgetInfo.budget} />
                        </div>
                    )}
                    <div className={styles.fullWidth}>
                       {formError && <p className={styles.error}>{formError}</p>}
                        <button type="submit" disabled={isSubmitting} className={styles.button}>
                            {isSubmitting ? 'Agregando...' : 'Agregar Gasto'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};