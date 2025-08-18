import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';
import type { Category, SubCategory } from '../types';

/**
 * Hook para gestionar toda la lógica de negocio relacionada con las categorías.
 * @param userId - El ID del usuario actual.
 */
export const useCategories = (userId: string | null) => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (!userId) {
            setCategories([]);
            return;
        }
        // Se suscribe a las actualizaciones de categorías en tiempo real.
        const unsubscribe = categoryService.onCategoriesUpdate(userId, (data) => {
            setCategories(data || []);
        });
        // Se desuscribe al desmontar para evitar fugas de memoria.
        return () => unsubscribe();
    }, [userId]);

    const addCategory = useCallback(async (categoryName: string) => {
        if (!userId || !categoryName.trim()) return;
        await categoryService.addCategory(userId, categoryName.trim());
    }, [userId]);

    const deleteCategory = useCallback(async (categoryId: string) => {
        if (!userId) return;
        await categoryService.deleteCategory(userId, categoryId);
    }, [userId]);

    const addSubCategory = useCallback(async (categoryId: string, subCategoryName: string) => {
        if (!userId || !subCategoryName.trim()) return;
        const category = categories.find(c => c.id === categoryId);
        
        // Evita duplicados (insensible a mayúsculas/minúsculas).
        const subExists = category?.subcategories.some(
          sub => sub.name.toLowerCase() === subCategoryName.trim().toLowerCase()
        );

        if (subExists) {
          console.warn(`La subcategoría "${subCategoryName}" ya existe.`);
          // Aquí podrías mostrar una notificación al usuario.
          return;
        }
        await categoryService.addSubCategory(userId, categoryId, subCategoryName.trim());
    }, [userId, categories]);

    /**
     * CORRECCIÓN: Esta función ahora coincide con la lógica del servicio.
     * Construye el objeto `subCategoryToDelete` y lo pasa a la función del servicio.
     */
    const deleteSubCategory = useCallback(async (categoryId: string, subCategoryId: string, subCategoryName: string) => {
        if (!userId) return;
        
        const subCategoryToDelete: SubCategory = {
            id: subCategoryId,
            name: subCategoryName
        };

        try {
            // La llamada ahora es correcta, pasando los argumentos que el servicio espera.
            await categoryService.deleteSubCategory(userId, categoryId, subCategoryToDelete);
        } catch (error) {
            console.error("Error al borrar la subcategoría:", error);
        }
    }, [userId]);

    const updateCategoryBudget = useCallback(async (categoryId: string, budget: number) => {
        if (!userId || budget < 0) return;
        await categoryService.updateCategoryBudget(userId, categoryId, budget);
    }, [userId]);

    const updateCategoryStyle = useCallback(async (categoryId: string, style: { icon: string; color: string }) => {
        if (!userId) return;
        await categoryService.updateCategoryStyle(userId, categoryId, style);
    }, [userId]);

    return {
        categories,
        addCategory,
        deleteCategory,
        addSubCategory,
        deleteSubCategory,
        updateCategoryBudget,
        updateCategoryStyle,
    };
};
