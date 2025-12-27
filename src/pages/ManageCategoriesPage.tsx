import React, { useState } from 'react';
import { useCategoriesContext, useExpensesContext } from '../contexts/AppContext';
import { LoadingStateWrapper } from '../components/LoadingState/LoadingState';
import styles from './ManageCategoriesPage.module.css';
import { CategoryItem } from '../components/misc/CategoryItem/CategoryItem';
import { CategoryStyleModal } from '../components/modals/CategoryStyleModal/CategoryStyleModal';
import type { Category } from '../types';

interface ManageCategoriesPageProps {
    isGuest: boolean;
}

export const ManageCategoriesPage: React.FC<ManageCategoriesPageProps> = ({ isGuest }) => {
    const {
        categories,
        addSubCategory,
        deleteSubCategory,
        deleteCategory,
        addCategory,
        updateCategoryBudget,
        updateCategoryStyle,
        loadingCategories,
        categoriesError,
        clearCategoriesError
    } = useCategoriesContext();
    const {
        expenses,
        loadingExpenses,
        expensesError,
        clearExpensesError
    } = useExpensesContext();

    const [newCategoryName, setNewCategoryName] = useState('');
    const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const isLoadingCritical = loadingCategories || loadingExpenses;
    const criticalError = categoriesError || expensesError;

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
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
            <LoadingStateWrapper
                loading={isLoadingCritical}
                error={criticalError}
                onDismissError={() => {
                    clearCategoriesError();
                    clearExpensesError();
                }}
                loadingMessage="Cargando categorías..."
            >
                <>
                    <div className={styles.pageHeader}>
                        <h2 className="section-title">Gestión de Categorías</h2>
                        <p className={styles.subtitle}>Administra tus categorías y subcategorías de gastos</p>
                        <form onSubmit={handleAddCategory} className={styles.addCategoryForm}>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                                placeholder="Nueva categoría..."
                            />
                            <button type="submit">Añadir</button>
                        </form>
                    </div>

                    {/* Lista de Categorías */}
                    <div className={styles.categoriesSection}>
                        <div className={styles.container}>
                            {categories.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>No tienes categorías creadas.</p>
                                    <p>Añade tu primera categoría usando el campo de arriba.</p>
                                </div>
                            ) : (
                                categories.map(cat => (
                                    <CategoryItem
                                        key={cat.id}
                                        category={cat}
                                        expenses={expenses}
                                        onAddSubCategory={addSubCategory}
                                        onDeleteSubCategory={(categoryId, subCategory) =>
                                            deleteSubCategory(categoryId, subCategory.id, subCategory.name)
                                        }
                                        onDeleteCategory={deleteCategory}
                                        onUpdateBudget={updateCategoryBudget}
                                        onEditStyle={() => handleOpenStyleModal(cat)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </>
            </LoadingStateWrapper>

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