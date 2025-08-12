import React, { useState } from 'react';
import { useExpensesController } from '../hooks/useExpensesController';
import styles from './ManageCategoriesPage.module.css'; // Estilos simplificados para la página
import { CategoryItem } from '../components/CategoryItem/CategoryItem'; // Importamos el nuevo componente

export const ManageCategoriesPage: React.FC<{ userId: string | null }> = ({ userId }) => {
    const { categories, expenses, addSubCategory, deleteSubCategory, deleteCategory, addCategory, updateCategoryBudget } = useExpensesController(userId);
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
                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Añadir nueva categoría"/>
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