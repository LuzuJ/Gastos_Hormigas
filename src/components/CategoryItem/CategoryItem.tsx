import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, PiggyBank, Plus, Tag, Trash2 } from 'lucide-react';
import styles from './CategoryItem.module.css';
import type { Category, Expense } from '../../types';
import { BudgetProgressBar } from '../BudgetProgressBar/BudgetProgressBar';

interface CategoryItemProps {
  category: Category;
  expenses: Expense[];
  onAddSubCategory: (categoryId: string, name: string) => void;
  onDeleteSubCategory: (categoryId: string, subCategoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateBudget: (categoryId: string, budget: number) => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
  category, expenses, onAddSubCategory, onDeleteSubCategory, onDeleteCategory, onUpdateBudget
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newSubCategory, setNewSubCategory] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(category.budget?.toString() || '');

  const categoryExpenses = expenses.filter(e => e.categoryId === category.id);
  const totalAmount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubCategory.trim()) {
      onAddSubCategory(category.id, newSubCategory);
      setNewSubCategory('');
    }
  };

  const handleBudgetSave = () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget >= 0) {
      onUpdateBudget(category.id, newBudget);
      setIsEditingBudget(false);
    }
  };
return (
    <div className={styles.categoryCard}>
      <header className={styles.categoryHeader} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.categoryInfo}>
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <span className={styles.categoryName}>{category.name}</span>
        </div>
        <span className={styles.categoryTotal}>${totalAmount.toFixed(2)}</span>
      </header>

      {isOpen && (
        <div className={styles.categoryContent}>
          
          <div className={styles.contentGrid}>
            {/* Columna Izquierda: Subcategorías */}
            <div>
              <h4 className={styles.sectionTitle}><Tag size={16} /> Subcategorías</h4>
              <ul className={styles.subCategoryList}>
                {category.subcategories.map(sub => (
                  <li key={sub.id}>
                    {sub.name}
                    <button onClick={() => onDeleteSubCategory(category.id, sub.id)} className={styles.deleteSubButton}>
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddSubCategory} className={styles.addSubCategoryForm}>
                <input type="text" value={newSubCategory} onChange={e => setNewSubCategory(e.target.value)} placeholder="Nueva subcategoría"/>
                <button type="submit" className={styles.buttonPrimary}><Plus size={16}/></button>
              </form>
            </div>

            {/* Columna Derecha: Presupuesto */}
            <div>
              <h4 className={styles.sectionTitle}><PiggyBank size={16} /> Presupuesto Mensual</h4>
              {isEditingBudget ? (
                <div className={styles.budgetForm}>
                  <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} placeholder="0.00"/>
                  <button onClick={handleBudgetSave} className={`${styles.button} ${styles.buttonPrimary}`}>Guardar</button>
                  <button onClick={() => setIsEditingBudget(false)} className={`${styles.button} ${styles.buttonSecondary}`}>Cancelar</button>
                </div>
              ) : (
                <div className={styles.budgetDisplay}>
                  <span className={styles.budgetValue}>{category.budget ? `$${category.budget.toFixed(2)}` : 'Sin presupuesto'}</span>
                  <button onClick={() => setIsEditingBudget(true)} className={styles.editBudgetButton} aria-label="editar presupuesto"><Edit size={14}/></button>
                </div>
              )}
              {category.budget && (
                <BudgetProgressBar spent={totalAmount} budget={category.budget} />
              )}
            </div>
          </div>

          <h4 className={`${styles.sectionTitle} ${styles.expensesTitle}`}>Gastos en esta Categoría</h4>
          {categoryExpenses.length > 0 ? (
            <ul className={styles.expenseList}>
              {categoryExpenses.map(expense => (
                <li key={expense.id}>
                  <span>{expense.description} ({expense.subCategory})</span>
                  <span>${expense.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : <p className={styles.noExpenses}>No hay gastos registrados en esta categoría.</p>}

          {!category.isDefault && (
             <div className={styles.deleteCategoryContainer}>
                <button onClick={() => onDeleteCategory(category.id)} className={styles.deleteCategoryButton}>
                    <Trash2 size={14} /> Eliminar Categoría
                </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};