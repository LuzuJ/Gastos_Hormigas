import { useState, useEffect, useCallback } from 'react';
import { categoryServiceRepo } from '../../services/categories/categoryServiceRepo';
import { useLoadingState } from '../context/useLoadingState';
import type { Category } from '../../types';

/**
 * Hook personalizado para la gestión de categorías utilizando el patrón repositorio
 * @param userId - ID del usuario
 * @returns Estado y funciones para gestionar categorías
 */
export const useCategoriesRepo = (userId: string | null) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { 
    loading: loadingCategories, 
    error: categoriesError, 
    startLoading, 
    stopLoading, 
    setErrorState, 
    clearError 
  } = useLoadingState(true);
  
  useEffect(() => {
    if (!userId) {
      setCategories([]);
      stopLoading();
      return;
    }
    
    startLoading();
    clearError();
    
    // Inicializar categorías por defecto si es necesario
    const initializeIfNeeded = async () => {
      try {
        await categoryServiceRepo.initializeDefaultCategories(userId);
      } catch (error) {
        console.error('Error al inicializar categorías por defecto:', error);
      }
    };
    
    initializeIfNeeded();
    
    // Suscribirse a cambios en las categorías
    const unsubscribe = categoryServiceRepo.onCategoriesUpdate(userId, (updatedCategories) => {
      setCategories(updatedCategories);
      stopLoading();
    });
    
    return () => {
      unsubscribe();
    };
  }, [userId, startLoading, stopLoading, clearError]);
  
  const addCategory = useCallback(async (name: string, icon?: string, color?: string) => {
    if (!userId) return null;
    
    try {
      clearError();
      return await categoryServiceRepo.addCategory(userId, name, icon, color);
    } catch (error) {
      setErrorState('Error al añadir categoría');
      console.error('Error al añadir categoría:', error);
      return null;
    }
  }, [userId, clearError, setErrorState]);
  
  const deleteCategory = useCallback(async (categoryId: string) => {
    if (!userId) return false;
    
    try {
      clearError();
      return await categoryServiceRepo.deleteCategory(userId, categoryId);
    } catch (error) {
      setErrorState('Error al eliminar categoría');
      console.error('Error al eliminar categoría:', error);
      return false;
    }
  }, [userId, clearError, setErrorState]);
  
  const addSubcategory = useCallback(async (categoryId: string, subcategoryName: string) => {
    if (!userId) return null;
    
    try {
      clearError();
      return await categoryServiceRepo.addSubCategory(userId, categoryId, subcategoryName);
    } catch (error) {
      setErrorState('Error al añadir subcategoría');
      console.error('Error al añadir subcategoría:', error);
      return null;
    }
  }, [userId, clearError, setErrorState]);
  
  const deleteSubcategory = useCallback(async (categoryId: string, subcategoryId: string) => {
    if (!userId) return false;
    
    try {
      clearError();
      return await categoryServiceRepo.deleteSubCategory(userId, categoryId, subcategoryId);
    } catch (error) {
      setErrorState('Error al eliminar subcategoría');
      console.error('Error al eliminar subcategoría:', error);
      return false;
    }
  }, [userId, clearError, setErrorState]);
  
  const updateCategoryBudget = useCallback(async (categoryId: string, budget: number) => {
    if (!userId) return null;
    
    try {
      clearError();
      return await categoryServiceRepo.updateCategoryBudget(userId, categoryId, budget);
    } catch (error) {
      setErrorState('Error al actualizar presupuesto');
      console.error('Error al actualizar presupuesto:', error);
      return null;
    }
  }, [userId, clearError, setErrorState]);
  
  const updateCategoryStyle = useCallback(async (categoryId: string, style: { icon: string; color: string }) => {
    if (!userId) return null;
    
    try {
      clearError();
      return await categoryServiceRepo.updateCategoryStyle(userId, categoryId, style);
    } catch (error) {
      setErrorState('Error al actualizar estilo');
      console.error('Error al actualizar estilo:', error);
      return null;
    }
  }, [userId, clearError, setErrorState]);
  
  return {
    categories,
    loadingCategories,
    categoriesError,
    clearCategoriesError: clearError,
    addCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
    updateCategoryBudget,
    updateCategoryStyle
  };
};
