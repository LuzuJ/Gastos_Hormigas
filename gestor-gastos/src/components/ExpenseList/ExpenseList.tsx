import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import type { Expense } from '../../types';
import styles from './ExpenseList.module.css';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  loading: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, loading }) => {
    if (loading) {
        return (
            <div className={styles.stateContainer}>
                <Loader2 className={styles.spinner} size={32} />
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <div className={styles.stateContainer}>
                <h3>¡Todo en orden!</h3>
                <p>Aún no has registrado ningún gasto.</p>
            </div>
        );
    }
    
    return (
        <div className={styles.list}>
            {expenses.map((expense) => (
                <div key={expense.id} className={styles.item}>
                    <div className={styles.details}>
                        <p className={styles.description}>{expense.description}</p>
                        <div className={styles.meta}>
                            <span className={`${styles.tag} ${styles['tag' + expense.category]}`}>
                                {expense.category || 'Sin categoría'}
                            </span>
                            <span className={styles.date}>
                                {expense.createdAt ? new Date(expense.createdAt.seconds * 1000).toLocaleDateString() : 'Justo ahora'}
                            </span>
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <span className={styles.amount}>${expense.amount.toFixed(2)}</span>
                        <button onClick={() => onDelete(expense.id)} className={styles.deleteButton} aria-label="Eliminar gasto">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
