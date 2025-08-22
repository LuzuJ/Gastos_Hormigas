import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCategories } from './useCategories';
import { categoryService } from '../../services/categories/categoryService';
import type { Category } from '../../types';

// El mock general se mantiene
vi.mock('../../services/categories/categoryService', () => ({
  categoryService: {
    onCategoriesUpdate: vi.fn(),
    addCategory: vi.fn(),
    deleteCategory: vi.fn(),
    updateCategoryBudget: vi.fn(),
  }
}));

const mockCategoriesData: Category[] = [
  { id: '1', name: 'Alimento', subcategories: [] },
  { id: '2', name: 'Transporte', subcategories: [] },
];

describe('Hook useCategories', () => {

  beforeEach(() => {
    vi.resetAllMocks();

    // CORRECCIÓN: Establecemos un comportamiento por defecto para el mock.
    // Ahora, en CADA prueba, onCategoriesUpdate devolverá una función de 
    // desuscripción vacía, evitando el error de "unsubscribe is not a function".
    (categoryService.onCategoriesUpdate as any).mockReturnValue(() => {});
  });

  it('debería llamar a onCategoriesUpdate y establecer las categorías', async () => {
    // En esta prueba específica, necesitamos que el callback se ejecute,
    // así que sobreescribimos el mock por defecto que pusimos en beforeEach.
    (categoryService.onCategoriesUpdate as any).mockImplementation((userId: any, callback: any) => {
      callback(mockCategoriesData);
      return () => {}; 
    });

    const { result } = renderHook(() => useCategories('test-user-id'));

    await waitFor(() => {
      expect(result.current.categories).toEqual(mockCategoriesData);
    });

    expect(categoryService.onCategoriesUpdate).toHaveBeenCalledWith('test-user-id', expect.any(Function));
  });

  it('debería llamar a categoryService.addCategory con los argumentos correctos', async () => {
    const { result } = renderHook(() => useCategories('test-user-id'));

    await act(async () => {
      await result.current.addCategory('Nueva Categoría');
    });

    expect(categoryService.addCategory).toHaveBeenCalledTimes(1);
    expect(categoryService.addCategory).toHaveBeenCalledWith('test-user-id', 'Nueva Categoría');
  });

  it('debería llamar a categoryService.deleteCategory con el ID correcto', async () => {
    const { result } = renderHook(() => useCategories('test-user-id'));

    await act(async () => {
      await result.current.deleteCategory('category-to-delete');
    });

    expect(categoryService.deleteCategory).toHaveBeenCalledTimes(1);
    expect(categoryService.deleteCategory).toHaveBeenCalledWith('test-user-id', 'category-to-delete');
  });

  it('debería llamar a categoryService.updateCategoryBudget con los datos correctos', async () => {
    const { result } = renderHook(() => useCategories('test-user-id'));

    await act(async () => {
      await result.current.updateCategoryBudget('cat-1', 500);
    });

    expect(categoryService.updateCategoryBudget).toHaveBeenCalledTimes(1);
    expect(categoryService.updateCategoryBudget).toHaveBeenCalledWith('test-user-id', 'cat-1', 500);
  });
});