import React, { useState } from 'react';
import { useExpensesController } from '../hooks/useExpensesController';
import styles from './ManageCategoriesPage.module.css';
import { CategoryItem } from '../components/CategoryItem/CategoryItem';
import { CategoryStyleModal } from '../components/CategoryStyleModal/CategoryStyleModal';
import type { Category } from '../types';

interface ManageCategoriesPageProps {
    userId: string | null;
    isGuest: boolean;
}

export const ManageCategoriesPage: React.FC<ManageCategoriesPageProps> = ({ userId, isGuest }) => {
    const { 
      categories, expenses, addSubCategory, deleteSubCategory, 
      deleteCategory, addCategory, updateCategoryBudget, updateCategoryStyle 
    } = useExpensesController(userId);
    
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleAddCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if(newCategoryName.trim()) {
        addCategory(newCategoryName);
        setNewCategoryName('');
      }
    };
    
    const handleOpenStyleModal = (category: Category) => {
        setEditingCategory(category);
        setIsStyleModalOpen(true);
    };

    const handleCloseStyleModal = () => {
        setIsStyleModalOpen(false);
        setEditingCategory(null);
    };

    const handleSaveStyle = (style: { icon: string, color: string }) => {
        if (editingCategory) {
            updateCategoryStyle(editingCategory.id, style);
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
                        onEditStyle={() => handleOpenStyleModal(cat)}
                    />
                ))}
            </div>

            {isStyleModalOpen && editingCategory && (
                <CategoryStyleModal
                    category={editingCategory}
                    onClose={handleCloseStyleModal}
                    onSave={handleSaveStyle}
                />
            )}
        </div>
    );
};