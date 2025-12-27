import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useIncomes } from '../../../hooks/financials/useIncomes';
import type { Income } from '../../../types';

// Mock del repository
const mockIncomeRepository = {
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getByDateRange: vi.fn(),
  getRecurring: vi.fn(),
  subscribe: vi.fn()
};

vi.mock('../../../repositories', () => ({
  incomeRepository: mockIncomeRepository
}));

describe('useIncomes Hook', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Carga inicial de datos', () => {
    it('debe cargar ingresos exitosamente', async () => {
      const mockIncomes: Income[] = [
        {
          id: 'income-1',
          userId: testUserId,
          description: 'Salario',
          amount: 5000,
          category: 'Salario',
          assetId: 'asset-1',
          assetName: 'Banco',
          date: '2025-12-01',
          isRecurring: true,
          recurrenceFrequency: 'monthly',
          createdAt: '2025-12-01T00:00:00Z'
        },
        {
          id: 'income-2',
          userId: testUserId,
          description: 'Freelance',
          amount: 1500,
          category: 'Freelance',
          assetId: 'asset-1',
          assetName: 'Banco',
          date: '2025-12-15',
          isRecurring: false,
          recurrenceFrequency: null,
          createdAt: '2025-12-15T00:00:00Z'
        }
      ];

      mockIncomeRepository.getAll.mockResolvedValue(mockIncomes);
      mockIncomeRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useIncomes(testUserId));

      await waitFor(() => {
        expect(result.current.incomes).toHaveLength(2);
      });

      expect(result.current.incomes[0].description).toBe('Salario');
      expect(result.current.incomes[1].description).toBe('Freelance');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar error al cargar ingresos', async () => {
      const errorMessage = 'Error al cargar ingresos';
      mockIncomeRepository.getAll.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useIncomes(testUserId));

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      expect(result.current.incomes).toHaveLength(0);
      expect(result.current.loading).toBe(false);
    });

    it('debe mostrar loading durante la carga', async () => {
      mockIncomeRepository.getAll.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      const { result } = renderHook(() => useIncomes(testUserId));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('addIncome', () => {
    it('debe agregar un ingreso exitosamente', async () => {
      const newIncome = {
        userId: testUserId,
        description: 'Bono',
        amount: 3000,
        category: 'Bonos',
        assetId: 'asset-1',
        assetName: 'Banco',
        date: '2025-12-20',
        isRecurring: false,
        recurrenceFrequency: null
      };

      const createdIncome: Income = {
        id: 'income-new',
        ...newIncome,
        createdAt: '2025-12-20T00:00:00Z'
      };

      mockIncomeRepository.getAll.mockResolvedValue([]);
      mockIncomeRepository.create.mockResolvedValue(createdIncome);
      mockIncomeRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useIncomes(testUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.addIncome(newIncome);

      expect(mockIncomeRepository.create).toHaveBeenCalledWith(newIncome);
    });

    it('debe manejar error al agregar ingreso', async () => {
      const newIncome = {
        userId: testUserId,
        description: 'Test',
        amount: 100,
        category: 'Test',
        assetId: 'asset-1',
        assetName: 'Test',
        date: '2025-12-24',
        isRecurring: false,
        recurrenceFrequency: null
      };

      mockIncomeRepository.getAll.mockResolvedValue([]);
      mockIncomeRepository.create.mockRejectedValue(new Error('Error al crear'));
      mockIncomeRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useIncomes(testUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.addIncome(newIncome)).rejects.toThrow('Error al crear');
    });
  });

  describe('updateIncome', () => {
    it('debe actualizar un ingreso exitosamente', async () => {
      const existingIncome: Income = {
        id: 'income-1',
        userId: testUserId,
        description: 'Salario',
        amount: 5000,
        category: 'Salario',
        assetId: 'asset-1',
        assetName: 'Banco',
        date: '2025-12-01',
        isRecurring: true,
        recurrenceFrequency: 'monthly',
        createdAt: '2025-12-01T00:00:00Z'
      };

      const updateData = {
        amount: 5500
      };

      const updatedIncome: Income = {
        ...existingIncome,
        amount: 5500
      };

      mockIncomeRepository.getAll.mockResolvedValue([existingIncome]);
      mockIncomeRepository.update.mockResolvedValue(updatedIncome);
      mockIncomeRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useIncomes(testUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.updateIncome('income-1', updateData);

      expect(mockIncomeRepository.update).toHaveBeenCalledWith('income-1', updateData);
    });
  });

  describe('deleteIncome', () => {
    it('debe eliminar un ingreso exitosamente', async () => {
      const existingIncome: Income = {
        id: 'income-1',
        userId: testUserId,
        description: 'Salario',
        amount: 5000,
        category: 'Salario',
        assetId: 'asset-1',
        assetName: 'Banco',
        date: '2025-12-01',
        isRecurring: true,
        recurrenceFrequency: 'monthly',
        createdAt: '2025-12-01T00:00:00Z'
      };

      mockIncomeRepository.getAll.mockResolvedValue([existingIncome]);
      mockIncomeRepository.delete.mockResolvedValue(undefined);
      mockIncomeRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useIncomes(testUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.deleteIncome('income-1');

      expect(mockIncomeRepository.delete).toHaveBeenCalledWith('income-1');
    });
  });

  describe('Cálculos y totales', () => {
    it('debe calcular el total de ingresos correctamente', async () => {
      const mockIncomes: Income[] = [
        {
          id: 'income-1',
          userId: testUserId,
          description: 'Salario',
          amount: 5000,
          category: 'Salario',
          assetId: 'asset-1',
          assetName: 'Banco',
          date: '2025-12-01',
          isRecurring: true,
          recurrenceFrequency: 'monthly',
          createdAt: '2025-12-01T00:00:00Z'
        },
        {
          id: 'income-2',
          userId: testUserId,
          description: 'Freelance',
          amount: 1500,
          category: 'Freelance',
          assetId: 'asset-1',
          assetName: 'Banco',
          date: '2025-12-15',
          isRecurring: false,
          recurrenceFrequency: null,
          createdAt: '2025-12-15T00:00:00Z'
        },
        {
          id: 'income-3',
          userId: testUserId,
          description: 'Bono',
          amount: 2000,
          category: 'Bonos',
          assetId: 'asset-1',
          assetName: 'Banco',
          date: '2025-12-20',
          isRecurring: false,
          recurrenceFrequency: null,
          createdAt: '2025-12-20T00:00:00Z'
        }
      ];

      mockIncomeRepository.getAll.mockResolvedValue(mockIncomes);
      mockIncomeRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useIncomes(testUserId));

      await waitFor(() => {
        expect(result.current.incomes).toHaveLength(3);
      });

      const total = result.current.incomes.reduce((sum, income) => sum + income.amount, 0);
      expect(total).toBe(8500);
    });

    it('debe filtrar ingresos recurrentes', async () => {
      const mockIncomes: Income[] = [
        {
          id: 'income-1',
          userId: testUserId,
          description: 'Salario',
          amount: 5000,
          category: 'Salario',
          assetId: 'asset-1',
          assetName: 'Banco',
          date: '2025-12-01',
          isRecurring: true,
          recurrenceFrequency: 'monthly',
          createdAt: '2025-12-01T00:00:00Z'
        },
        {
          id: 'income-2',
          userId: testUserId,
          description: 'Freelance',
          amount: 1500,
          category: 'Freelance',
          assetId: 'asset-1',
          assetName: 'Banco',
          date: '2025-12-15',
          isRecurring: false,
          recurrenceFrequency: null,
          createdAt: '2025-12-15T00:00:00Z'
        }
      ];

      mockIncomeRepository.getAll.mockResolvedValue(mockIncomes);
      mockIncomeRepository.subscribe.mockReturnValue(() => {});

      const { result } = renderHook(() => useIncomes(testUserId));

      await waitFor(() => {
        expect(result.current.incomes).toHaveLength(2);
      });

      const recurringIncomes = result.current.incomes.filter(i => i.isRecurring);
      expect(recurringIncomes).toHaveLength(1);
      expect(recurringIncomes[0].description).toBe('Salario');
    });
  });
});
