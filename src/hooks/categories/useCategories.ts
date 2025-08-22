import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../../services/categories/categoryService';
import { useLoadingState, handleAsyncOperation } from '../context/useLoadingState';
import type { Category, SubCategory } from '../../types';

/**
 * Hook para gestionar toda la lógica de negocio relacionada con las categorías.
 * @param userId - El ID del usuario actual.
 */
export const useCategories = (userId: string | null) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const { loading, error, startLoading, stopLoading, setErrorState, clearError } = useLoadingState(true);

    useEffect(() => {
        if (!userId) {
            setCategories([]);
            stopLoading();
            return;
        }

        startLoading();
        clearError();

        // Se suscribe a las actualizaciones de categorías en tiempo real.
        const unsubscribe = categoryService.onCategoriesUpdate(userId, (data) => {
            setCategories(data || []);
            stopLoading();
        });

        // Se desuscribe al desmontar para evitar fugas de memoria.
        return () => {
            unsubscribe();
        };
    }, [userId, startLoading, stopLoading, setErrorState, clearError]);

    const addCategory = useCallback(async (categoryName: string) => {
        if (!userId || !categoryName.trim()) {
            return { success: false, error: 'Datos inválidos' };
        }

        return await handleAsyncOperation(
            () => categoryService.addCategory(userId, categoryName.trim()),
            'Error al agregar la categoría'
        );
    }, [userId]);

    const deleteCategory = useCallback(async (categoryId: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => categoryService.deleteCategory(userId, categoryId),
            'Error al eliminar la categoría'
        );
    }, [userId]);

    const addSubCategory = useCallback(async (categoryId: string, subCategoryName: string) => {
        if (!userId || !subCategoryName.trim()) {
            return { success: false, error: 'Datos inválidos' };
        }

        const category = categories.find(c => c.id === categoryId);
        
        // Evita duplicados (insensible a mayúsculas/minúsculas).
        const subExists = category?.subcategories.some(
          sub => sub.name.toLowerCase() === subCategoryName.trim().toLowerCase()
        );

        if (subExists) {
            return { success: false, error: `La subcategoría "${subCategoryName}" ya existe` };
        }

        return await handleAsyncOperation(
            () => categoryService.addSubCategory(userId, categoryId, subCategoryName.trim()),
            'Error al agregar la subcategoría'
        );
    }, [userId, categories]);

    /**
     * CORRECCIÓN: Esta función ahora coincide con la lógica del servicio.
     * Construye el objeto `subCategoryToDelete` y lo pasa a la función del servicio.
     */
    const deleteSubCategory = useCallback(async (categoryId: string, subCategoryId: string, subCategoryName: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }
        
        const subCategoryToDelete: SubCategory = {
            id: subCategoryId,
            name: subCategoryName
        };

        return await handleAsyncOperation(
            () => categoryService.deleteSubCategory(userId, categoryId, subCategoryToDelete),
            'Error al eliminar la subcategoría'
        );
    }, [userId]);

    const updateCategoryBudget = useCallback(async (categoryId: string, budget: number) => {
        if (!userId || budget < 0) {
            return { success: false, error: 'Datos inválidos' };
        }

        return await handleAsyncOperation(
            () => categoryService.updateCategoryBudget(userId, categoryId, budget),
            'Error al actualizar el presupuesto'
        );
    }, [userId]);

    const updateCategoryStyle = useCallback(async (categoryId: string, style: { icon: string; color: string }) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => categoryService.updateCategoryStyle(userId, categoryId, style),
            'Error al actualizar el estilo'
        );
    }, [userId]);

    return {
        categories,
        loadingCategories: loading,
        categoriesError: error,
        clearCategoriesError: clearError,
        addCategory,
        deleteCategory,
        addSubCategory,
        deleteSubCategory,
        updateCategoryBudget,
        updateCategoryStyle,
    };
};
