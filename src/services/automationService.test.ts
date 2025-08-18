import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { automationService } from './automationService';
import { fixedExpenseService } from './fixedExpenseService';
import { expensesService } from './expensesService';
import { Timestamp } from 'firebase/firestore';
import type { Category, FixedExpense } from '../types';

// Mock de los servicios de dependencias
vi.mock('./fixedExpenseService', () => ({
  fixedExpenseService: {
    getFixedExpensesOnce: vi.fn(),
    updateFixedExpense: vi.fn()
  }
}));

vi.mock('./expensesService', () => ({
  expensesService: {
    addExpense: vi.fn()
  }
}));

// Mock de Firestore Timestamp
vi.mock('firebase/firestore', () => ({
  Timestamp: {
    fromDate: vi.fn((date) => ({ toDate: () => date, seconds: date.getTime() / 1000 }))
  }
}));

describe('automationService', () => {
  const userId = 'test-user-123';
  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'Hogar',
      isDefault: true,
      subcategories: [
        { id: 'sub-1', name: 'Gasto Fijo' },
        { id: 'sub-2', name: 'Varios' }
      ]
    },
    {
      id: 'cat-2', 
      name: 'Transporte',
      isDefault: true,
      subcategories: [
        { id: 'sub-3', name: 'Varios' }
      ]
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    // Mock de la fecha actual para hacer tests determinísticos
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15')); // 15 de marzo de 2024
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('checkAndPostFixedExpenses', () => {
    it('debería procesar gastos fijos que están listos para ser posteados', async () => {
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Alquiler',
          amount: 1200,
          category: 'cat-1',
          dayOfMonth: 10, // Ya pasó (hoy es 15)
          lastPostedMonth: '2024-1' // Febrero, no marzo
        },
        {
          id: 'fixed-2',
          description: 'Internet',
          amount: 50,
          category: 'cat-1',
          dayOfMonth: 20, // Aún no ha llegado
          lastPostedMonth: '2024-1'
        }
      ];

      vi.mocked(fixedExpenseService.getFixedExpensesOnce).mockResolvedValue(mockFixedExpenses);

      await automationService.checkAndPostFixedExpenses(userId, mockCategories);

      // Solo debería procesar el primer gasto (alquiler)
      expect(expensesService.addExpense).toHaveBeenCalledTimes(1);
      expect(expensesService.addExpense).toHaveBeenCalledWith(
        userId,
        {
          description: 'Alquiler',
          amount: 1200,
          categoryId: 'cat-1',
          subCategory: 'Gasto Fijo',
          createdAt: expect.any(Object)
        },
        expect.any(Object)
      );

      expect(fixedExpenseService.updateFixedExpense).toHaveBeenCalledWith(
        userId,
        'fixed-1',
        { lastPostedMonth: '2024-2' } // Marzo es mes 2 (0-indexado)
      );
    });

    it('no debería procesar gastos ya posteados en el mes actual', async () => {
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Alquiler',
          amount: 1200,
          category: 'cat-1',
          dayOfMonth: 10,
          lastPostedMonth: '2024-2' // Ya fue posteado en marzo
        }
      ];

      vi.mocked(fixedExpenseService.getFixedExpensesOnce).mockResolvedValue(mockFixedExpenses);

      await automationService.checkAndPostFixedExpenses(userId, mockCategories);

      expect(expensesService.addExpense).not.toHaveBeenCalled();
      expect(fixedExpenseService.updateFixedExpense).not.toHaveBeenCalled();
    });

    it('no debería procesar gastos que aún no han llegado su fecha', async () => {
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Seguro',
          amount: 300,
          category: 'cat-1',
          dayOfMonth: 25, // 25 de marzo, aún no ha llegado (hoy es 15)
          lastPostedMonth: '2024-1'
        }
      ];

      vi.mocked(fixedExpenseService.getFixedExpensesOnce).mockResolvedValue(mockFixedExpenses);

      await automationService.checkAndPostFixedExpenses(userId, mockCategories);

      expect(expensesService.addExpense).not.toHaveBeenCalled();
      expect(fixedExpenseService.updateFixedExpense).not.toHaveBeenCalled();
    });

    it('debería usar subcategoría "Varios" si no encuentra "Gasto Fijo"', async () => {
      const categoriesWithoutFixedSubcat: Category[] = [
        {
          id: 'cat-2',
          name: 'Transporte',
          isDefault: true,
          subcategories: [
            { id: 'sub-3', name: 'Varios' }
          ]
        }
      ];

      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Combustible',
          amount: 100,
          category: 'cat-2',
          dayOfMonth: 10,
          lastPostedMonth: '2024-1'
        }
      ];

      vi.mocked(fixedExpenseService.getFixedExpensesOnce).mockResolvedValue(mockFixedExpenses);

      await automationService.checkAndPostFixedExpenses(userId, categoriesWithoutFixedSubcat);

      expect(expensesService.addExpense).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          subCategory: 'Varios'
        }),
        expect.any(Object)
      );
    });

    it('debería manejar errores graciosamente', async () => {
      const error = new Error('Database error');
      vi.mocked(fixedExpenseService.getFixedExpensesOnce).mockRejectedValue(error);

      // No debería lanzar el error, solo loggearlo
      await expect(automationService.checkAndPostFixedExpenses(userId, mockCategories))
        .resolves.not.toThrow();

      expect(expensesService.addExpense).not.toHaveBeenCalled();
    });

    it('debería crear el gasto con la fecha correcta del día del mes', async () => {
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Alquiler',
          amount: 1200,
          category: 'cat-1',
          dayOfMonth: 5,
          lastPostedMonth: '2024-1'
        }
      ];

      vi.mocked(fixedExpenseService.getFixedExpensesOnce).mockResolvedValue(mockFixedExpenses);

      await automationService.checkAndPostFixedExpenses(userId, mockCategories);

      // Verificar que la fecha del gasto sea el día 5 de marzo
      const expectedDate = new Date(2024, 2, 5); // 5 de marzo de 2024
      expect(Timestamp.fromDate).toHaveBeenCalledWith(expectedDate);
    });
  });
});
