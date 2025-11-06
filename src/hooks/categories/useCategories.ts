import { useState, useEffect, useCallback } from 'react';
import { categoryServiceRepo } from '../../services/categories/categoryServiceRepo';
import { handleAsyncOperation } from '../context/useLoadingState';
import type { Category, SubCategory } from '../../types';

/**
 * Hook para gestionar toda la lógica de negocio relacionada con las categorías.
 * @param userId - El ID del usuario actual.
 */
export const useCategories = (userId: string | null) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setCategories([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Función para inicializar categorías por defecto si es necesario
        const initializeAndSubscribe = async () => {
            try {
                // Primero, intentar inicializar categorías por defecto
                await categoryServiceRepo.initializeDefaultCategories(userId);
            } catch (error) {
                console.error('Error al inicializar categorías por defecto:', error);
                // Continuar aunque falle la inicialización
            }

            // Se suscribe a las actualizaciones de categorías en tiempo real.
            const unsubscribe = categoryServiceRepo.onCategoriesUpdate(userId, (data: Category[]) => {
                setCategories(data || []);
                setLoading(false);
            });

            return unsubscribe;
        };

        let unsubscribeRef: (() => void) | null = null;
        
        initializeAndSubscribe().then(unsubscribe => {
            unsubscribeRef = unsubscribe;
        }).catch(error => {
            console.error('Error al configurar suscripción de categorías:', error);
            setLoading(false);
        });

        // Se desuscribe al desmontar para evitar fugas de memoria.
        return () => {
            if (unsubscribeRef) {
                unsubscribeRef();
            }
        };
    }, [userId]);

    const addCategory = useCallback(async (categoryName: string) => {
        if (!userId || !categoryName.trim()) {
            return { success: false, error: 'Datos inválidos' };
        }

        return await handleAsyncOperation(
            () => categoryServiceRepo.addCategory(userId, categoryName.trim()),
            'Error al agregar la categoría'
        );
    }, [userId]);

    const deleteCategory = useCallback(async (categoryId: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => categoryServiceRepo.deleteCategory(userId, categoryId),
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
            () => categoryServiceRepo.addSubCategory(userId, categoryId, subCategoryName.trim()),
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
            () => categoryServiceRepo.deleteSubCategory(userId, categoryId, subCategoryToDelete.id),
            'Error al eliminar la subcategoría'
        );
    }, [userId]);

    const updateCategoryBudget = useCallback(async (categoryId: string, budget: number) => {
        if (!userId || budget < 0) {
            return { success: false, error: 'Datos inválidos' };
        }

        return await handleAsyncOperation(
            () => categoryServiceRepo.updateCategoryBudget(userId, categoryId, budget),
            'Error al actualizar el presupuesto'
        );
    }, [userId]);

    const updateCategoryStyle = useCallback(async (categoryId: string, style: { icon: string; color: string }) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => categoryServiceRepo.updateCategoryStyle(userId, categoryId, style),
            'Error al actualizar el estilo'
        );
    }, [userId]);

    const clearCategoriesError = useCallback(() => {
        setError(null);
    }, []);

    return {
        categories,
        loadingCategories: loading,
        categoriesError: error,
        clearCategoriesError,
        addCategory,
        deleteCategory,
        addSubCategory,
        deleteSubCategory,
        updateCategoryBudget,
        updateCategoryStyle,
    };
};
