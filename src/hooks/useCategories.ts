import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types';

export const useCategories = (userId: string | null) => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (!userId) {
            setCategories([]);
            return;
        }
        const unsubscribe = categoryService.onCategoriesUpdate(userId, (data) => {
            setCategories(data || []);
        });
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
        await categoryService.addSubCategory(userId, categoryId, subCategoryName.trim());
    }, [userId]);

    const deleteSubCategory = useCallback(async (categoryId: string, subCategoryId: string) => {
        if (!userId) return;
        await categoryService.deleteSubCategory(userId, categoryId, subCategoryId);
    }, [userId]);

    const updateCategoryBudget = useCallback(async (categoryId: string, budget: number) => {
        if (!userId || budget < 0) return;
        await categoryService.updateCategoryBudget(userId, categoryId, budget);
    }, [userId]);

    return {
        categories,
        addCategory,
        deleteCategory,
        addSubCategory,
        deleteSubCategory,
        updateCategoryBudget,
    };
};