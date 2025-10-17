import { repositoryFactory } from '../../repositories';
import type { Category, SubCategory } from '../../types';

/**
 * Servicio de categorías que utiliza el repositorio a través del patrón de repositorio
 */
export const categoryService = {
    /**
     * Crea las categorías por defecto para un usuario nuevo si no tiene ninguna.
     */
    initializeDefaultCategories: async (userId: string): Promise<boolean> => {
        try {
            const categoryRepository = repositoryFactory.getCategoryRepository();
            return await categoryRepository.initializeDefaultCategories(userId);
        } catch (error) {
            console.error('Error al inicializar categorías por defecto:', error);
            throw error;
        }
    },

    /**
     * Obtiene todas las categorías de un usuario con sus subcategorías.
     */
    getCategories: async (userId: string): Promise<Category[]> => {
        try {
            const categoryRepository = repositoryFactory.getCategoryRepository();
            return await categoryRepository.getCategoriesWithSubcategories(userId);
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return [];
        }
    },

    /**
     * Se suscribe a los cambios en las categorías de un usuario en tiempo real.
     */
    onCategoriesUpdate: (userId: string, callback: (data: Category[]) => void): (() => void) => {
        const categoryRepository = repositoryFactory.getCategoryRepository();
        return categoryRepository.subscribeToCategories(userId, callback);
    },

    /**
     * Añade una nueva categoría para un usuario.
     */
    addCategory: async (userId: string, categoryName: string, icon: string = 'Tag', color: string = '#607D8B') => {
        try {
            const categoryRepository = repositoryFactory.getCategoryRepository();
            return await categoryRepository.create(userId, {
                name: categoryName,
                isDefault: false,
                icon,
                color,
                subcategories: []
            });
        } catch (error) {
            console.error('Error al añadir categoría:', error);
            throw error;
        }
    },

    /**
     * Elimina una categoría por su ID.
     */
    deleteCategory: async (userId: string, categoryId: string) => {
        try {
            const categoryRepository = repositoryFactory.getCategoryRepository();
            return await categoryRepository.delete(userId, categoryId);
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            throw error;
        }
    },

    /**
     * Añade una nueva subcategoría a una categoría existente.
     */
    addSubCategory: async (userId: string, categoryId: string, subCategoryName: string) => {
        try {
            const categoryRepository = repositoryFactory.getCategoryRepository();
            return await categoryRepository.addSubcategory(userId, categoryId, subCategoryName);
        } catch (error) {
            console.error('Error al añadir subcategoría:', error);
            throw error;
        }
    },

    /**
     * Elimina una subcategoría.
     */
    deleteSubCategory: async (userId: string, categoryId: string, subCategoryId: string) => {
        try {
            const categoryRepository = repositoryFactory.getCategoryRepository();
            return await categoryRepository.deleteSubcategory(userId, categoryId, subCategoryId);
        } catch (error) {
            console.error('Error al eliminar subcategoría:', error);
            throw error;
        }
    },

    /**
     * Actualiza el presupuesto de una categoría.
     */
    updateCategoryBudget: async (userId: string, categoryId: string, budget: number) => {
        try {
            const categoryRepository = repositoryFactory.getCategoryRepository();
            await categoryRepository.update(userId, categoryId, { budget });
            return true;
        } catch (error) {
            console.error('Error al actualizar presupuesto de categoría:', error);
            throw error;
        }
    },

    /**
     * Actualiza el estilo (icono y color) de una categoría.
     */
    updateCategoryStyle: async (userId: string, categoryId: string, style: { icon: string; color: string }) => {
        try {
            const categoryRepository = repositoryFactory.getCategoryRepository();
            await categoryRepository.update(userId, categoryId, { 
                icon: style.icon, 
                color: style.color 
            });
            return true;
        } catch (error) {
            console.error('Error al actualizar estilo de categoría:', error);
            throw error;
        }
    },

    /**
     * Obtiene una categoría específica con sus subcategorías.
     */
    getCategory: async (userId: string, categoryId: string): Promise<Category | null> => {
        try {
            const categoryRepository = repositoryFactory.getCategoryRepository();
            return await categoryRepository.getById(categoryId);
        } catch (error) {
            console.error('Error al obtener categoría específica:', error);
            return null;
        }
    }
};
