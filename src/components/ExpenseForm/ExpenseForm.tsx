// src/components/ExpenseForm/ExpenseForm.tsx
import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import styles from './ExpenseForm.module.css';
import type { Category, ExpenseFormData, SubCategory } from '../../types';
import { expenseFormSchema } from '../../schemas';

interface ExpenseFormProps {
    onAdd: (data: ExpenseFormData) => Promise<{ success: boolean; error?: string }>;
    onAddSubCategory: (categoryId: string, subCategoryName: string) => Promise<void>; // <-- Nueva prop
    categories: Category[];
    isSubmitting: boolean;
}

const ADD_NEW_SUBCATEGORY_VALUE = '--add-new--';

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd, onAddSubCategory, categories, isSubmitting }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);
    const [formError, setFormError] = useState('');

    const [showNewSubCategoryInput, setShowNewSubCategoryInput] = useState(false);
    const [newSubCategoryName, setNewSubCategoryName] = useState('');

    useEffect(() => {
        if (categories.length > 0 && !selectedCategoryId) {
            const firstCategory = categories[0];
            setSelectedCategoryId(firstCategory.id);
            setAvailableSubCategories(firstCategory.subcategories);
            setSelectedSubCategory(firstCategory.subcategories[0]?.name || '');
        }
    }, [categories, selectedCategoryId]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategoryId = e.target.value;
        setSelectedCategoryId(newCategoryId);
        const category = categories.find(c => c.id === newCategoryId);
        const subcategories = category?.subcategories || [];
        setSelectedSubCategory(subcategories[0]?.name || ADD_NEW_SUBCATEGORY_VALUE);
        setShowNewSubCategoryInput(subcategories.length === 0);
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
            // Si estamos creando una nueva, primero la guardamos
            await onAddSubCategory(selectedCategoryId, newSubCategoryName.trim());
            subCategoryToSave = newSubCategoryName.trim();
        } else {
            subCategoryToSave = selectedSubCategory;
        }

        // 2. Usamos Zod para validar los datos del formulario de forma segura
        const validationResult = expenseFormSchema.safeParse({
            description,
            amount, // Zod se encarga de convertirlo a número
            categoryId: selectedCategoryId,
            subCategory: subCategoryToSave
        });

        // 3. Si la validación falla, mostramos el primer error al usuario
        if (!validationResult.success) {
            const firstError = validationResult.error.issues[0].message;
            setFormError(firstError);
            return;
        }

        // 4. Si todo es correcto, enviamos los datos validados
        const result = await onAdd(validationResult.data);

        if (result.success) {
            // Limpiamos el formulario si el envío fue exitoso
            setDescription('');
            setAmount('');
            setFormError('');
            setNewSubCategoryName('');
             setShowNewSubCategoryInput(false);
            if (categories.length > 0) {
                setSelectedSubCategory(categories[0].subcategories[0]?.name || '');
            }
        } else { 
            setFormError(result.error || 'Ocurrió un error inesperado.'); 
        }
    };

    return (
        <div className={styles.card}>
            <h2 className={styles.title}><PlusCircle className={styles.icon}/>Añadir Gasto</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* ... (inputs de descripción y monto) ... */}
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
                    <select id="subCategory" value={selectedSubCategory} onChange={handleSubCategoryChange} className={styles.select}>
                        {availableSubCategories.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                        <option value={ADD_NEW_SUBCATEGORY_VALUE}>+ Crear nueva subcategoría...</option>
                    </select>
                </div>
                {/* Input condicional para la nueva subcategoría */}
                {showNewSubCategoryInput && (
                    <div className={styles.formGroupNewSubCategory}>
                        <label htmlFor="newSubCategory" className={styles.label}>Nombre de la Nueva Subcategoría</label>
                        <input
                            id="newSubCategory"
                            type="text"
                            value={newSubCategoryName}
                            onChange={(e) => setNewSubCategoryName(e.target.value)}
                            placeholder="Ej: Comida para llevar"
                            className={styles.input}
                        />
                    </div>
                )}
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