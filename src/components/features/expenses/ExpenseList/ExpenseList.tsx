import React from 'react';
import { Trash2, Loader2, Edit } from 'lucide-react';
import type { Expense, Category } from '../../../../types';
import styles from './ExpenseList.module.css';
import { DynamicIcon } from '../../../ui/DynamicIcon';
import { formatCurrency } from '../../../../utils/formatters';

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
    const getCategory = (categoryId: string): Category | undefined => {
        return categories.find(c => c.id === categoryId);
    };

    return (
        <ul className={styles.list}>
            {expenses.map((expense) => {
                const category = getCategory(expense.categoryId);
                const categoryName = category?.name || 'Desconocida';

                return (
                    <li key={expense.id} className={styles.item}>
                        <div className={styles.iconContainer} style={{ backgroundColor: category?.color || '#8d99ae' }}>
                            <DynamicIcon name={category?.icon || 'Tag'} size={24} color="white" />
                        </div>
                        {/* --- COLUMNA IZQUIERDA --- */}

                        <div className={styles.mainInfo}>
                            <div className={styles.topRow}>
                                <p className={styles.description}>{expense.description}</p>
                                <span className={styles.amount}>{formatCurrency(expense.amount)}</span>
                            </div>
                            <div className={styles.meta}>
                                {/* Ya no necesitamos el tag de color aquí, el icono lo reemplaza */}
                                <span className={styles.categoryNameText}>{categoryName}</span>
                                <span className={styles.subCategoryTag}>{expense.subCategory}</span>
                            </div>
                        </div>

                        {/* --- COLUMNA DERECHA --- */}
                        <div className={styles.sideInfo}>
                            <span className={styles.date}>
                                {expense.createdAt ? new Date(expense.createdAt.seconds * 1000).toLocaleDateString() : ''}
                            </span>
                            <div className={styles.actions}>
                                <button onClick={() => onEdit(expense)} className={styles.actionButton} aria-label="Editar gasto"><Edit size={18} /></button>
                                <button onClick={() => onDelete(expense.id)} className={`${styles.actionButton} ${styles.deleteButton}`} aria-label="Eliminar gasto"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};
