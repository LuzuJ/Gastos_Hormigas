import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import styles from './ExpenseForm.module.css';

const categories = ['Café', 'Snacks', 'Transporte', 'Otro'];

interface ExpenseFormProps {
    onAdd: (description: string, amount: string, category: string) => Promise<{ success: boolean; error?: string }>;
    isSubmitting: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd, isSubmitting }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await onAdd(description, amount, category);
        if (result.success) {
            setDescription('');
            setAmount('');
            setFormError('');
            setCategory(categories[0]);
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
                <div className={styles.formGroup}>
                    <label htmlFor="description" className={styles.label}>Descripción</label>
                    <input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Café con leche" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="amount" className={styles.label}>Monto ($)</label>
                    <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="category" className={styles.label}>Categoría</label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={styles.select}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
