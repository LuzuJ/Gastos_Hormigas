import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import styles from './ExpenseForm.module.css';
import type { Category, ExpenseFormData } from '../../types';

interface ExpenseFormProps {
    onAdd: (data: ExpenseFormData) => Promise<{ success: boolean; error?: string }>;
    categories: Category[];
    isSubmitting: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd, categories, isSubmitting }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [customCategory, setCustomCategory] = useState(''); // Estado para la categoría personalizada
    const [formError, setFormError] = useState('');
    
    // Sincroniza la categoría seleccionada por defecto cuando la lista carga
    useEffect(() => {
        if (categories.length > 0 && !selectedCategory) {
            setSelectedCategory(categories[0].name);
        }
    }, [categories, selectedCategory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Si se seleccionó "Otro", usamos el valor personalizado. Si no, el del selector.
        const finalCategory = selectedCategory === 'Otro' ? customCategory.trim() : selectedCategory;

        if (!finalCategory) {
            setFormError('Por favor, selecciona o especifica una categoría.');
            return;
        }

        const result = await onAdd({
            description,
            amount: parseFloat(amount) || 0,
            category: finalCategory
        });

        if (result.success) {
            // Limpiar formulario
            setDescription('');
            setAmount('');
            setFormError('');
            setSelectedCategory(categories[0]?.name || '');
            setCustomCategory('');
        } else {
            setFormError(result.error || 'Ocurrió un error');
        }
    };

    return (
        <div className={styles.card}>
            <h2 className={styles.title}>
                <PlusCircle className={styles.icon} size={24}/>
                Añadir Nuevo Gasto
            </h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Campos de Descripción y Monto (sin cambios) */}
                <div className={styles.formGroupDescription}>
                    <label htmlFor="description" className={styles.label}>Descripción</label>
                    <input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Café con leche" className={styles.input} />
                </div>
                <div className={styles.formGroupAmount}>
                    <label htmlFor="amount" className={styles.label}>Monto ($)</label>
                    <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" className={styles.input} />
                </div>
                
                {/* --- LÓGICA DE CATEGORÍAS MEJORADA --- */}
                <div className={styles.formGroupCategory}>
                    <label htmlFor="category" className={styles.label}>Categoría</label>
                    <select id="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={styles.select} disabled={categories.length === 0}>
                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                </div>

                {/* Este campo solo aparece si se selecciona "Otro" */}
                {selectedCategory === 'Otro' && (
                    <div className={styles.formGroupCustom}>
                        <label htmlFor="customCategory" className={styles.label}>Especificar "Otro"</label>
                        <input id="customCategory" type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Ej: Regalo" className={styles.input} />
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
