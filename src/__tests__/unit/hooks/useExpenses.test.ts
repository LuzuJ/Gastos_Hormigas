import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useExpenses } from '../../../hooks/financials/useExpenses';
import type { Expense } from '../../../types';

// Mock del repository
const mockExpenseRepository = {
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getByDateRange: vi.fn(),
  getFixed: vi.fn(),
  getByCategory: vi.fn(),
  subscribe: vi.fn()
};

vi.mock('../../../repositories', () => ({
  expenseRepository: mockExpenseRepository
}));

describe('useExpenses Hook', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Carga inicial de datos', () => {
    it('debe cargar gastos exitosamente', async () => {
      const mockExpenses: Expense[] = [
        {
          id: 'expense-1',
          userId: testUserId,
          description: 'Supermercado',
          amount: 500,
          category: 'Alimentos',
          subcategory: 'Comida',
          assetId: 'asset-1',
          assetName: 'Efectivo',
          date: '2025-12-20',
          isFixed: false,
          recurrenceFrequency: null,
          createdAt: '2025-12-20T00:00:00Z'
        },
        {
          id: 'expense-2',
          userId: testUserId,
          description: 'Netflix',
          amount: 199,
          category: 'Entretenimiento',
          subcategory: 'Streaming',
          assetId: 'asset-2',
          assetName: 'Tarjeta',
          date: '2025-12-01',
          isFixed: true,
          recurrenceFrequency: 'monthly',
          createdAt: '2025-12-01T00:00:00Z'
        }
      ];

      mockExpenseRepository.getAll.mockResolvedValue(mockExpenses);
      mockExpenseRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useExpenses(testUserId));

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(2);
      });

      expect(result.current.expenses[0].description).toBe('Supermercado');
      expect(result.current.expenses[1].description).toBe('Netflix');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar error al cargar gastos', async () => {
      const errorMessage = 'Error al cargar gastos';
      mockExpenseRepository.getAll.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useExpenses(testUserId));

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      expect(result.current.expenses).toHaveLength(0);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('addExpense', () => {
    it('debe agregar un gasto exitosamente', async () => {
      const newExpense = {
        userId: testUserId,
        description: 'Café',
        amount: 45,
        category: 'Alimentos',
        subcategory: 'Cafetería',
        assetId: 'asset-1',
        assetName: 'Efectivo',
        date: '2025-12-24',
        isFixed: false,
        recurrenceFrequency: null
      };

      const createdExpense: Expense = {
        id: 'expense-new',
        ...newExpense,
        createdAt: '2025-12-24T00:00:00Z'
      };

      mockExpenseRepository.getAll.mockResolvedValue([]);
      mockExpenseRepository.create.mockResolvedValue(createdExpense);
      mockExpenseRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useExpenses(testUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.addExpense(newExpense);

      expect(mockExpenseRepository.create).toHaveBeenCalledWith(newExpense);
    });

    it('debe agregar gasto fijo con recurrencia', async () => {
      const newFixedExpense = {
        userId: testUserId,
        description: 'Renta',
        amount: 8000,
        category: 'Vivienda',
        subcategory: 'Alquiler',
        assetId: 'asset-1',
        assetName: 'Banco',
        date: '2025-12-01',
        isFixed: true,
        recurrenceFrequency: 'monthly' as const
      };

      const createdExpense: Expense = {
        id: 'expense-fixed',
        ...newFixedExpense,
        createdAt: '2025-12-01T00:00:00Z'
      };

      mockExpenseRepository.getAll.mockResolvedValue([]);
      mockExpenseRepository.create.mockResolvedValue(createdExpense);
      mockExpenseRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useExpenses(testUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.addExpense(newFixedExpense);

      expect(mockExpenseRepository.create).toHaveBeenCalledWith(newFixedExpense);
    });
  });

  describe('updateExpense', () => {
    it('debe actualizar un gasto exitosamente', async () => {
      const existingExpense: Expense = {
        id: 'expense-1',
        userId: testUserId,
        description: 'Supermercado',
        amount: 500,
        category: 'Alimentos',
        subcategory: 'Comida',
        assetId: 'asset-1',
        assetName: 'Efectivo',
        date: '2025-12-20',
        isFixed: false,
        recurrenceFrequency: null,
        createdAt: '2025-12-20T00:00:00Z'
      };

      const updateData = {
        amount: 600,
        description: 'Supermercado Walmart'
      };

      const updatedExpense: Expense = {
        ...existingExpense,
        ...updateData
      };

      mockExpenseRepository.getAll.mockResolvedValue([existingExpense]);
      mockExpenseRepository.update.mockResolvedValue(updatedExpense);
      mockExpenseRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useExpenses(testUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.updateExpense('expense-1', updateData);

      expect(mockExpenseRepository.update).toHaveBeenCalledWith('expense-1', updateData);
    });
  });

  describe('deleteExpense', () => {
    it('debe eliminar un gasto exitosamente', async () => {
      const existingExpense: Expense = {
        id: 'expense-1',
        userId: testUserId,
        description: 'Café',
        amount: 45,
        category: 'Alimentos',
        subcategory: 'Cafetería',
        assetId: 'asset-1',
        assetName: 'Efectivo',
        date: '2025-12-24',
        isFixed: false,
        recurrenceFrequency: null,
        createdAt: '2025-12-24T00:00:00Z'
      };

      mockExpenseRepository.getAll.mockResolvedValue([existingExpense]);
      mockExpenseRepository.delete.mockResolvedValue(undefined);
      mockExpenseRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useExpenses(testUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.deleteExpense('expense-1');

      expect(mockExpenseRepository.delete).toHaveBeenCalledWith('expense-1');
    });
  });

  describe('Filtros y cálculos', () => {
    it('debe calcular el total de gastos correctamente', async () => {
      const mockExpenses: Expense[] = [
        {
          id: 'expense-1',
          userId: testUserId,
          description: 'Supermercado',
          amount: 500,
          category: 'Alimentos',
          subcategory: 'Comida',
          assetId: 'asset-1',
          assetName: 'Efectivo',
          date: '2025-12-20',
          isFixed: false,
          recurrenceFrequency: null,
          createdAt: '2025-12-20T00:00:00Z'
        },
        {
          id: 'expense-2',
          userId: testUserId,
          description: 'Gasolina',
          amount: 600,
          category: 'Transporte',
          subcategory: 'Combustible',
          assetId: 'asset-1',
          assetName: 'Tarjeta',
          date: '2025-12-22',
          isFixed: false,
          recurrenceFrequency: null,
          createdAt: '2025-12-22T00:00:00Z'
        }
      ];

      mockExpenseRepository.getAll.mockResolvedValue(mockExpenses);
      mockExpenseRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useExpenses(testUserId));

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(2);
      });

      const total = result.current.expenses.reduce((sum, expense) => sum + expense.amount, 0);
      expect(total).toBe(1100);
    });

    it('debe filtrar gastos fijos', async () => {
      const mockExpenses: Expense[] = [
        {
          id: 'expense-1',
          userId: testUserId,
          description: 'Netflix',
          amount: 199,
          category: 'Entretenimiento',
          subcategory: 'Streaming',
          assetId: 'asset-1',
          assetName: 'Tarjeta',
          date: '2025-12-01',
          isFixed: true,
          recurrenceFrequency: 'monthly',
          createdAt: '2025-12-01T00:00:00Z'
        },
        {
          id: 'expense-2',
          userId: testUserId,
          description: 'Café',
          amount: 45,
          category: 'Alimentos',
          subcategory: 'Cafetería',
          assetId: 'asset-1',
          assetName: 'Efectivo',
          date: '2025-12-24',
          isFixed: false,
          recurrenceFrequency: null,
          createdAt: '2025-12-24T00:00:00Z'
        }
      ];

      mockExpenseRepository.getAll.mockResolvedValue(mockExpenses);
      mockExpenseRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useExpenses(testUserId));

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(2);
      });

      const fixedExpenses = result.current.expenses.filter(e => e.isFixed);
      expect(fixedExpenses).toHaveLength(1);
      expect(fixedExpenses[0].description).toBe('Netflix');
    });

    it('debe agrupar gastos por categoría', async () => {
      const mockExpenses: Expense[] = [
        {
          id: 'expense-1',
          userId: testUserId,
          description: 'Supermercado',
          amount: 500,
          category: 'Alimentos',
          subcategory: 'Comida',
          assetId: 'asset-1',
          assetName: 'Efectivo',
          date: '2025-12-20',
          isFixed: false,
          recurrenceFrequency: null,
          createdAt: '2025-12-20T00:00:00Z'
        },
        {
          id: 'expense-2',
          userId: testUserId,
          description: 'Restaurante',
          amount: 350,
          category: 'Alimentos',
          subcategory: 'Comida fuera',
          assetId: 'asset-1',
          assetName: 'Tarjeta',
          date: '2025-12-22',
          isFixed: false,
          recurrenceFrequency: null,
          createdAt: '2025-12-22T00:00:00Z'
        },
        {
          id: 'expense-3',
          userId: testUserId,
          description: 'Gasolina',
          amount: 600,
          category: 'Transporte',
          subcategory: 'Combustible',
          assetId: 'asset-1',
          assetName: 'Tarjeta',
          date: '2025-12-23',
          isFixed: false,
          recurrenceFrequency: null,
          createdAt: '2025-12-23T00:00:00Z'
        }
      ];

      mockExpenseRepository.getAll.mockResolvedValue(mockExpenses);
      mockExpenseRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useExpenses(testUserId));

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(3);
      });

      const alimentosExpenses = result.current.expenses.filter(e => e.category === 'Alimentos');
      expect(alimentosExpenses).toHaveLength(2);
      
      const totalAlimentos = alimentosExpenses.reduce((sum, e) => sum + e.amount, 0);
      expect(totalAlimentos).toBe(850);
    });
  });

  describe('Validaciones', () => {
    it('debe validar que el monto sea positivo', async () => {
      const invalidExpense = {
        userId: testUserId,
        description: 'Gasto inválido',
        amount: -100, // Monto negativo
        category: 'Test',
        subcategory: 'Test',
        assetId: 'asset-1',
        assetName: 'Test',
        date: '2025-12-24',
        isFixed: false,
        recurrenceFrequency: null
      };

      mockExpenseRepository.getAll.mockResolvedValue([]);
      mockExpenseRepository.create.mockRejectedValue(new Error('El monto debe ser positivo'));
      mockExpenseRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useExpenses(testUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.addExpense(invalidExpense)).rejects.toThrow();
    });
  });
});
