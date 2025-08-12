import React, { useState } from 'react';
import { useExpensesController } from '../hooks/useExpensesController';
import { ChevronDown, ChevronRight, Edit, Plus, Trash2 } from 'lucide-react';
import styles from './ManageCategoriesPage.module.css';
import type { Category, Expense } from '../types';
import { BudgetProgressBar } from '../components/BudgetProgressBar/BudgetProgressBar';

// Sub-componente para una sola categoría. Es más limpio y maneja su propio estado.
const CategoryItem: React.FC<{
  category: Category;
  expenses: Expense[];
  onAddSubCategory: (categoryId: string, name: string) => void;
  onDeleteSubCategory: (categoryId: string, subCategoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateBudget: (categoryId: string, budget: number) => void;
}> = ({ category, expenses, onAddSubCategory, onDeleteSubCategory, onDeleteCategory, onUpdateBudget }) => {
  
  const [isOpen, setIsOpen] = useState(false); // Estado local para cada categoría
  const [newSubCategory, setNewSubCategory] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(category.budget?.toString() || '');

  const categoryExpenses = expenses.filter(e => e.categoryId === category.id);
  const totalAmount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = parseFloat(budgetInput);

    if (newSubCategory.trim()) {
      onAddSubCategory(category.id, newSubCategory);
      setNewSubCategory('');
    }

     if (!isNaN(newBudget) && newBudget >= 0) {
      onUpdateBudget(category.id, newBudget);
      setIsEditingBudget(false);
    }
  };

  function handleBudgetSave(event: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error('Function not implemented.');
  }

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
          <h4>Subcategorías</h4>
          <ul className={styles.subCategoryList}>
            {category.subcategories.map(sub => (
              <li key={sub.id}>
                {sub.name}
                {/* Todas las subcategorías ahora tienen botón de eliminar */}
                <button onClick={() => onDeleteSubCategory(category.id, sub.id)} className={styles.deleteSubButton}>
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>

          <h4>Presupuesto Mensual</h4>
          {isEditingBudget ? (
            <div className={styles.budgetForm}>
              <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} placeholder="0.00"/>
              <button onClick={handleBudgetSave}>Guardar</button>
              <button onClick={() => setIsEditingBudget(false)}>Cancelar</button>
            </div>
          ) : (
            <div className={styles.budgetDisplay}>
              <span>{category.budget ? `$${category.budget.toFixed(2)}` : 'Sin presupuesto'}</span>
              <button onClick={() => setIsEditingBudget(true)} className={styles.editBudgetButton}><Edit size={14}/></button>
            </div>
          )}
          
          {category.budget && (
            <BudgetProgressBar spent={totalAmount} budget={category.budget} />
          )}
          
          <form onSubmit={handleAddSubCategory} className={styles.addSubCategoryForm}>
            <input type="text" value={newSubCategory} onChange={e => setNewSubCategory(e.target.value)} placeholder="Nueva subcategoría"/>
            <button type="submit"><Plus size={16}/></button>
          </form>

          <h4 className={styles.expensesTitle}>Gastos en esta Categoría</h4>
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

          {/* Solo las categorías no-default se pueden eliminar por completo */}
          {!category.isDefault && (
             <div className={styles.deleteCategoryContainer}>
                <button onClick={() => onDeleteCategory(category.id)} className={styles.deleteCategoryButton}>
                    <Trash2 size={14} /> Eliminar Categoría Completa
                </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// Componente principal de la página
export const ManageCategoriesPage: React.FC<{ userId: string | null }> = ({ userId }) => {
    const { categories, expenses, addSubCategory, deleteSubCategory, deleteCategory, addCategory,updateCategoryBudget } = useExpensesController(userId);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleAddCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if(newCategoryName.trim()) {
        addCategory(newCategoryName);
        setNewCategoryName('');
      }
    };

    return (
        <div>
            <div className={styles.pageHeader}>
              <h2 className="section-title">Análisis y Gestión de Categorías</h2>
              <form onSubmit={handleAddCategory} className={styles.addCategoryForm}>
                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Añadir nueva categoría principal"/>
                <button type="submit">Añadir</button>
              </form>
            </div>
            <div className={styles.container}>
                {categories.map(cat => (
                    <CategoryItem
                        key={cat.id}
                        category={cat}
                        expenses={expenses}
                        onAddSubCategory={addSubCategory}
                        onDeleteSubCategory={deleteSubCategory}
                        onDeleteCategory={deleteCategory}
                        onUpdateBudget={updateCategoryBudget}
                    />
                ))}
            </div>
        </div>
    );
};
