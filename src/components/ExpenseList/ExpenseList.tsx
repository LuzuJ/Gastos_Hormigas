import React from 'react';
import { Trash2, Loader2, Edit } from 'lucide-react';
import type { Expense, Category } from '../../types';
import styles from './ExpenseList.module.css';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  loading: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, categories, onDelete, onEdit, loading }) => {
    if (loading) {
        return <div className={styles.stateContainer}><Loader2 className={styles.spinner} size={32} /></div>;
    }

    if (expenses.length === 0) {
        return (
            <div className={styles.stateContainer}>
                <h3>¡Todo en orden!</h3>
                <p>Aún no has registrado ningún gasto.</p>
            </div>
        );
    }
    
    // Esta función ahora recibirá una lista de categorías consistente
    const getCategoryName = (categoryId: string): string => {
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'Desconocida'; 
    };

    return (
        <ul className={styles.list}>
            {expenses.map((expense) => {
                const categoryName = getCategoryName(expense.categoryId); // Esta línea ahora es correcta

                return (
                    <li key={expense.id} className={styles.item}>
                        <div className={styles.details}>
                            <p className={styles.description}>{expense.description}</p>
                            <div className={styles.meta}>
                                <span className={`${styles.tag} ${styles['tag' + (categoryName.replace(/\s+/g, '') || 'Otro')]}`}>
                                    {categoryName}
                                </span>
                                <span className={styles.subCategoryTag}>
                                    {expense.subCategory}
                                </span>
                                <span className={styles.date}>
                                    {expense.createdAt ? new Date(expense.createdAt.seconds * 1000).toLocaleDateString() : 'Justo ahora'}
                                </span>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <span className={styles.amount}>${expense.amount.toFixed(2)}</span>
                            <button onClick={() => onEdit(expense)} className={styles.actionButton} aria-label="Editar gasto"><Edit size={18} /></button>
                            <button onClick={() => onDelete(expense.id)} className={`${styles.actionButton} ${styles.deleteButton}`} aria-label="Eliminar gasto"><Trash2 size={18} /></button>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};
