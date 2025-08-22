import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Category, FixedExpense } from '../../types';

// Mock variables de entorno
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_FIREBASE_API_KEY: 'mock-api-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'mock-auth-domain',
    VITE_FIREBASE_PROJECT_ID: 'mock-project-id',
    VITE_FIREBASE_STORAGE_BUCKET: 'mock-storage-bucket',
    VITE_FIREBASE_MESSAGING_SENDER_ID: 'mock-sender-id',
    VITE_FIREBASE_APP_ID: 'mock-app-id',
    VITE_FIREBASE_MEASUREMENT_ID: 'mock-measurement-id'
  },
  writable: true
});

// Mock Firebase completo antes de importar cualquier servicio
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  Timestamp: {
    fromDate: vi.fn((date: Date) => ({
      toDate: () => date,
      toMillis: () => date.getTime(),
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: (date.getTime() % 1000) * 1000000
    }))
  }
}));

// Mock de los servicios dependientes
vi.mock('../../services/fixedExpenseService');
vi.mock('../../services/expensesService');

// Importar después de los mocks
import { automationService } from '../../services/automation/automationService';
import { fixedExpenseService } from '../../services/expenses/fixedExpenseService';
import { expensesService } from '../../services/expenses/expensesService';

describe('Integration: Automation Service Flow', () => {
  const mockUserId = 'test-user-123';
  
  const mockCategories: Category[] = [
    {
      id: 'category-1',
      name: 'Alimentación',
      icon: 'restaurant',
      color: '#FF6B6B',
      subcategories: [
        { id: 'sub-1-1', name: 'Gasto Fijo' },
        { id: 'sub-1-2', name: 'Supermercado' },
        { id: 'sub-1-3', name: 'Restaurantes' }
      ]
    },
    {
      id: 'category-2',
      name: 'Transporte',
      icon: 'directions_car',
      color: '#4ECDC4',
      subcategories: [
        { id: 'sub-2-1', name: 'Gasto Fijo' },
        { id: 'sub-2-2', name: 'Gasolina' },
        { id: 'sub-2-3', name: 'Mantenimiento' }
      ]
    },
    {
      id: 'category-3',
      name: 'Servicios',
      icon: 'home',
      color: '#45B7D1',
      subcategories: [
        { id: 'sub-3-1', name: 'Electricidad' },
        { id: 'sub-3-2', name: 'Agua' },
        { id: 'sub-3-3', name: 'Internet' }
      ]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Resetear fecha del sistema para pruebas consistentes
    vi.useFakeTimers();
    
    // Mock implementaciones por defecto
    (fixedExpenseService.getFixedExpensesOnce as any).mockResolvedValue([]);
    (expensesService.addExpense as any).mockResolvedValue({
      id: 'new-expense-id',
      type: 'document',
      firestore: {} as any,
      path: 'mock-path',
      parent: {} as any,
      converter: null
    } as any);
    (fixedExpenseService.updateFixedExpense as any).mockResolvedValue();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Fixed Expenses Automation', () => {
    it('should post due fixed expenses and update their lastPostedMonth', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15); // March 15, 2024
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Renta del apartamento',
          amount: 800,
          category: 'category-1',
          dayOfMonth: 1,
          lastPostedMonth: '2024-1' // February, should be posted for March
        },
        {
          id: 'fixed-2',
          description: 'Suscripción Netflix',
          amount: 15,
          category: 'category-2',
          dayOfMonth: 10,
          lastPostedMonth: undefined // Never posted, should be posted
        }
      ];

      (fixedExpenseService.getFixedExpensesOnce as any).mockResolvedValue(mockFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      // Should add both expenses since they are due and not posted this month
      expect(expensesService.addExpense).toHaveBeenCalledTimes(2);
      
      // Check first expense (renta)
      expect(expensesService.addExpense).toHaveBeenNthCalledWith(1, mockUserId, {
        description: 'Renta del apartamento',
        amount: 800,
        categoryId: 'category-1',
        subCategory: 'Gasto Fijo',
        createdAt: expect.any(Object)
      }, expect.any(Object));

      // Check second expense (Netflix)
      expect(expensesService.addExpense).toHaveBeenNthCalledWith(2, mockUserId, {
        description: 'Suscripción Netflix',
        amount: 15,
        categoryId: 'category-2',
        subCategory: 'Gasto Fijo',
        createdAt: expect.any(Object)
      }, expect.any(Object));

      // Should update lastPostedMonth for both
      expect(fixedExpenseService.updateFixedExpense).toHaveBeenCalledTimes(2);
      expect(fixedExpenseService.updateFixedExpense).toHaveBeenNthCalledWith(1, mockUserId, 'fixed-1', {
        lastPostedMonth: '2024-2' // March (month index 2)
      });
      expect(fixedExpenseService.updateFixedExpense).toHaveBeenNthCalledWith(2, mockUserId, 'fixed-2', {
        lastPostedMonth: '2024-2' // March (month index 2)
      });
    });

    it('should not post expenses that are not due yet', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 5); // March 5, 2024
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Renta del apartamento',
          amount: 800,
          category: 'category-1',
          dayOfMonth: 10, // Due on day 10, current day is 5
          lastPostedMonth: '2024-1' // February
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      expect(expensesService.addExpense).not.toHaveBeenCalled();
      expect(fixedExpenseService.updateFixedExpense).not.toHaveBeenCalled();
    });

    it('should not post expenses already posted this month', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15); // March 15, 2024
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Renta del apartamento',
          amount: 800,
          category: 'category-1',
          dayOfMonth: 1,
          lastPostedMonth: '2024-2' // Already posted for March
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      expect(expensesService.addExpense).not.toHaveBeenCalled();
      expect(fixedExpenseService.updateFixedExpense).not.toHaveBeenCalled();
    });

    it('should use first subcategory if "Gasto Fijo" is not found', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15); // March 15, 2024
      vi.setSystemTime(testDate);
      
      const categoriesWithoutGastoFijo: Category[] = [
        {
          id: 'category-special',
          name: 'Categoría Especial',
          icon: 'star',
          color: '#FF6B6B',
          subcategories: [
            { id: 'sub-special-1', name: 'Primera Subcategoría' },
            { id: 'sub-special-2', name: 'Segunda Subcategoría' }
          ]
        }
      ];

      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Gasto especial',
          amount: 100,
          category: 'category-special',
          dayOfMonth: 1,
          lastPostedMonth: undefined
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, categoriesWithoutGastoFijo);

      // Assert
      expect(expensesService.addExpense).toHaveBeenCalledWith(mockUserId, {
        description: 'Gasto especial',
        amount: 100,
        categoryId: 'category-special',
        subCategory: 'Primera Subcategoría', // Should use first subcategory
        createdAt: expect.any(Object)
      }, expect.any(Object));
    });

    it('should use "Varios" if category has no subcategories', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15); // March 15, 2024
      vi.setSystemTime(testDate);
      
      const categoriesWithoutSubcategories: Category[] = [
        {
          id: 'category-empty',
          name: 'Categoría Sin Subcategorías',
          icon: 'star',
          color: '#FF6B6B',
          subcategories: []
        }
      ];

      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Gasto sin subcategoría',
          amount: 50,
          category: 'category-empty',
          dayOfMonth: 1,
          lastPostedMonth: undefined
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, categoriesWithoutSubcategories);

      // Assert
      expect(expensesService.addExpense).toHaveBeenCalledWith(mockUserId, {
        description: 'Gasto sin subcategoría',
        amount: 50,
        categoryId: 'category-empty',
        subCategory: 'Varios', // Should use "Varios" as fallback
        createdAt: expect.any(Object)
      }, expect.any(Object));
    });

    it('should handle category not found scenario', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15); // March 15, 2024
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Gasto de categoría inexistente',
          amount: 75,
          category: 'non-existent-category',
          dayOfMonth: 1,
          lastPostedMonth: undefined
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      expect(expensesService.addExpense).toHaveBeenCalledWith(mockUserId, {
        description: 'Gasto de categoría inexistente',
        amount: 75,
        categoryId: 'non-existent-category',
        subCategory: 'Varios', // Should use "Varios" when category not found
        createdAt: expect.any(Object)
      }, expect.any(Object));
    });
  });

  describe('Date and Time Handling', () => {
    it('should correctly determine current month marker', async () => {
      // Arrange
      const testDate = new Date(2024, 11, 25); // December 25, 2024 (month index 11)
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'December expense',
          amount: 200,
          category: 'category-1',
          dayOfMonth: 20,
          lastPostedMonth: '2024-10' // November
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      expect(fixedExpenseService.updateFixedExpense).toHaveBeenCalledWith(mockUserId, 'fixed-1', {
        lastPostedMonth: '2024-11' // December (month index 11)
      });
    });

    it('should create expense with correct date based on dayOfMonth', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15); // March 15, 2024
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Monthly subscription',
          amount: 25,
          category: 'category-1',
          dayOfMonth: 5, // Should create expense for March 5
          lastPostedMonth: undefined
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      const expectedTimestamp = expect.objectContaining({
        toDate: expect.any(Function),
        toMillis: expect.any(Function)
      });

      expect(expensesService.addExpense).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          createdAt: expectedTimestamp
        }),
        expectedTimestamp
      );
    });

    it('should handle year boundaries correctly', async () => {
      // Arrange
      const testDate = new Date(2025, 0, 15); // January 15, 2025
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'New year expense',
          amount: 300,
          category: 'category-1',
          dayOfMonth: 1,
          lastPostedMonth: '2024-11' // December 2024
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      expect(fixedExpenseService.updateFixedExpense).toHaveBeenCalledWith(mockUserId, 'fixed-1', {
        lastPostedMonth: '2025-0' // January 2025 (month index 0)
      });
    });
  });

  describe('Multiple Fixed Expenses Scenarios', () => {
    it('should handle multiple fixed expenses with different due dates', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15); // March 15, 2024
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Early month expense',
          amount: 100,
          category: 'category-1',
          dayOfMonth: 1, // Due day 1, should be posted
          lastPostedMonth: '2024-1'
        },
        {
          id: 'fixed-2',
          description: 'Mid month expense',
          amount: 200,
          category: 'category-2',
          dayOfMonth: 15, // Due day 15, should be posted (today)
          lastPostedMonth: '2024-1'
        },
        {
          id: 'fixed-3',
          description: 'Late month expense',
          amount: 300,
          category: 'category-3',
          dayOfMonth: 25, // Due day 25, should NOT be posted (future)
          lastPostedMonth: '2024-1'
        },
        {
          id: 'fixed-4',
          description: 'Already posted',
          amount: 400,
          category: 'category-1',
          dayOfMonth: 1, // Due but already posted this month
          lastPostedMonth: '2024-2'
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      // Should only add 2 expenses (fixed-1 and fixed-2)
      expect(expensesService.addExpense).toHaveBeenCalledTimes(2);
      expect(fixedExpenseService.updateFixedExpense).toHaveBeenCalledTimes(2);
      
      // Check specific expenses that should be posted
      expect(expensesService.addExpense).toHaveBeenCalledWith(mockUserId, 
        expect.objectContaining({
          description: 'Early month expense',
          amount: 100
        }), expect.any(Object));
        
      expect(expensesService.addExpense).toHaveBeenCalledWith(mockUserId, 
        expect.objectContaining({
          description: 'Mid month expense',
          amount: 200
        }), expect.any(Object));
    });

    it('should handle empty fixed expenses list', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15); // March 15, 2024
      vi.setSystemTime(testDate);
      
      ( as any).mockResolvedValue([]);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      expect(expensesService.addExpense).not.toHaveBeenCalled();
      expect(fixedExpenseService.updateFixedExpense).not.toHaveBeenCalled();
    });

    it('should process all eligible expenses even if some fail', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15); // March 15, 2024
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Successful expense',
          amount: 100,
          category: 'category-1',
          dayOfMonth: 1,
          lastPostedMonth: '2024-1'
        },
        {
          id: 'fixed-2',
          description: 'Failing expense',
          amount: 200,
          category: 'category-2',
          dayOfMonth: 5,
          lastPostedMonth: '2024-1'
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);
      
      // Mock the second addExpense call to fail
      vi.mocked(expensesService.addExpense)
        .mockResolvedValueOnce({
          id: 'success-id',
          type: 'document',
          firestore: {} as any,
          path: 'mock-path',
          parent: {} as any,
          converter: null
        } as any)
        .mockRejectedValueOnce(new Error('Expense creation failed'));

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      // Should still attempt both expenses
      expect(expensesService.addExpense).toHaveBeenCalledTimes(2);
      
      // Should only update the successful one
      expect(fixedExpenseService.updateFixedExpense).toHaveBeenCalledTimes(1);
      expect(fixedExpenseService.updateFixedExpense).toHaveBeenCalledWith(mockUserId, 'fixed-1', {
        lastPostedMonth: '2024-2'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle getFixedExpensesOnce failure gracefully', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15);
      vi.setSystemTime(testDate);
      
      vi.mocked(fixedExpenseService.getFixedExpensesOnce).mockRejectedValue(new Error('Database error'));

      // Act & Assert - Should not throw
      await expect(automationService.checkAndPostFixedExpenses(mockUserId, mockCategories))
        .resolves.toBeUndefined();
      
      expect(expensesService.addExpense).not.toHaveBeenCalled();
      expect(fixedExpenseService.updateFixedExpense).not.toHaveBeenCalled();
    });

    it('should continue processing if addExpense fails for one expense', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15);
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'First expense',
          amount: 100,
          category: 'category-1',
          dayOfMonth: 1,
          lastPostedMonth: '2024-1'
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);
      vi.mocked(expensesService.addExpense).mockRejectedValue(new Error('Add expense failed'));

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      expect(expensesService.addExpense).toHaveBeenCalledTimes(1);
      // Should not update lastPostedMonth if expense creation failed
      expect(fixedExpenseService.updateFixedExpense).not.toHaveBeenCalled();
    });

    it('should continue processing if updateFixedExpense fails', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15);
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Update will fail',
          amount: 100,
          category: 'category-1',
          dayOfMonth: 1,
          lastPostedMonth: '2024-1'
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);
      ( as any).mockResolvedValue({
        id: 'success-id',
        type: 'document',
        firestore: {} as any,
        path: 'mock-path',
        parent: {} as any,
        converter: null
      } as any);
      vi.mocked(fixedExpenseService.updateFixedExpense).mockRejectedValue(new Error('Update failed'));

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      expect(expensesService.addExpense).toHaveBeenCalledTimes(1);
      expect(fixedExpenseService.updateFixedExpense).toHaveBeenCalledTimes(1);
      // Process should complete despite update failure
    });
  });

  describe('Edge Cases and Data Validation', () => {
    it('should handle fixed expenses with dayOfMonth at month boundaries', async () => {
      // Arrange - Test on February 29 (leap year scenario)
      const testDate = new Date(2024, 1, 29); // February 29, 2024 (leap year)
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'End of month expense',
          amount: 500,
          category: 'category-1',
          dayOfMonth: 29, // Should be posted today (29 >= 29)
          lastPostedMonth: '2024-0'
        },
        {
          id: 'fixed-2',
          description: 'Next month expense',
          amount: 600,
          category: 'category-2',
          dayOfMonth: 30, // Should NOT be posted (29 < 30)
          lastPostedMonth: '2024-0'
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      // Should only post the first expense (day 29), not the second one (day 30)
      expect(expensesService.addExpense).toHaveBeenCalledTimes(1);
      expect(expensesService.addExpense).toHaveBeenCalledWith(mockUserId, 
        expect.objectContaining({
          description: 'End of month expense',
          amount: 500
        }), expect.any(Object));
    });

    it('should handle large amounts and decimal amounts', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15);
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Large mortgage payment',
          amount: 15000.50,
          category: 'category-1',
          dayOfMonth: 1,
          lastPostedMonth: '2024-1'
        },
        {
          id: 'fixed-2',
          description: 'Small subscription',
          amount: 0.99,
          category: 'category-2',
          dayOfMonth: 5,
          lastPostedMonth: '2024-1'
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      expect(expensesService.addExpense).toHaveBeenCalledWith(mockUserId, 
        expect.objectContaining({
          description: 'Large mortgage payment',
          amount: 15000.50
        }), expect.any(Object));
        
      expect(expensesService.addExpense).toHaveBeenCalledWith(mockUserId, 
        expect.objectContaining({
          description: 'Small subscription',
          amount: 0.99
        }), expect.any(Object));
    });

    it('should handle special characters in descriptions', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15);
      vi.setSystemTime(testDate);
      
      const mockFixedExpenses: FixedExpense[] = [
        {
          id: 'fixed-1',
          description: 'Suscripción con ñ & símbolos €$¥',
          amount: 25.99,
          category: 'category-1',
          dayOfMonth: 1,
          lastPostedMonth: '2024-1'
        }
      ];

      ( as any).mockResolvedValue(mockFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      expect(expensesService.addExpense).toHaveBeenCalledWith(mockUserId, 
        expect.objectContaining({
          description: 'Suscripción con ñ & símbolos €$¥'
        }), expect.any(Object));
    });
  });

  describe('Business Logic Integration', () => {
    it('should demonstrate complete monthly automation cycle', async () => {
      // Arrange
      const testDate = new Date(2024, 2, 15); // March 15, 2024
      vi.setSystemTime(testDate);
      
      const monthlyFixedExpenses: FixedExpense[] = [
        {
          id: 'rent',
          description: 'Monthly Rent',
          amount: 1200,
          category: 'category-1',
          dayOfMonth: 1,
          lastPostedMonth: '2024-1' // Last posted in February
        },
        {
          id: 'utilities',
          description: 'Utilities Bundle',
          amount: 150,
          category: 'category-3',
          dayOfMonth: 5,
          lastPostedMonth: '2024-1'
        },
        {
          id: 'insurance',
          description: 'Car Insurance',
          amount: 80,
          category: 'category-2',
          dayOfMonth: 10,
          lastPostedMonth: '2024-1'
        },
        {
          id: 'subscription',
          description: 'Streaming Services',
          amount: 35,
          category: 'category-2',
          dayOfMonth: 20, // Not due yet
          lastPostedMonth: '2024-1'
        }
      ];

      ( as any).mockResolvedValue(monthlyFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      // Should post 3 expenses (rent, utilities, insurance) but not subscription
      expect(expensesService.addExpense).toHaveBeenCalledTimes(3);
      expect(fixedExpenseService.updateFixedExpense).toHaveBeenCalledTimes(3);
      
      // Verify each expense was processed correctly
      const addExpenseCalls = vi.mocked(expensesService.addExpense).mock.calls;
      const updateCalls = vi.mocked(fixedExpenseService.updateFixedExpense).mock.calls;
      
      // Check that rent was posted
      expect(addExpenseCalls.some(call => 
        call[1].description === 'Monthly Rent' && call[1].amount === 1200
      )).toBe(true);
      
      // Check that subscription was NOT posted (not due yet)
      expect(addExpenseCalls.some(call => 
        call[1].description === 'Streaming Services'
      )).toBe(false);
      
      // Check all updates have correct month marker
      updateCalls.forEach(call => {
        expect(call[2]).toEqual({ lastPostedMonth: '2024-2' });
      });
    });

    it('should handle realistic monthly budget automation scenario', async () => {
      // Arrange
      const testDate = new Date(2024, 5, 1); // June 1, 2024 (first day of month)
      vi.setSystemTime(testDate);
      
      const comprehensiveFixedExpenses: FixedExpense[] = [
        // Housing
        { id: 'rent', description: 'Apartment Rent', amount: 1500, category: 'category-1', dayOfMonth: 1, lastPostedMonth: '2024-4' },
        // Utilities  
        { id: 'electric', description: 'Electricity Bill', amount: 120, category: 'category-3', dayOfMonth: 1, lastPostedMonth: '2024-4' },
        { id: 'water', description: 'Water Bill', amount: 45, category: 'category-3', dayOfMonth: 1, lastPostedMonth: '2024-4' },
        // Transportation
        { id: 'car-payment', description: 'Car Payment', amount: 350, category: 'category-2', dayOfMonth: 1, lastPostedMonth: '2024-4' },
        { id: 'insurance', description: 'Auto Insurance', amount: 125, category: 'category-2', dayOfMonth: 1, lastPostedMonth: '2024-4' },
        // Subscriptions
        { id: 'phone', description: 'Phone Plan', amount: 65, category: 'category-3', dayOfMonth: 1, lastPostedMonth: '2024-4' },
        { id: 'internet', description: 'Internet Service', amount: 75, category: 'category-3', dayOfMonth: 1, lastPostedMonth: '2024-4' }
      ];

      ( as any).mockResolvedValue(comprehensiveFixedExpenses);

      // Act
      await automationService.checkAndPostFixedExpenses(mockUserId, mockCategories);

      // Assert
      // All expenses are due on day 1, and today is day 1
      expect(expensesService.addExpense).toHaveBeenCalledTimes(7);
      expect(fixedExpenseService.updateFixedExpense).toHaveBeenCalledTimes(7);
      
      // Calculate total automated expenses
      const totalAutomatedAmount = comprehensiveFixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      expect(totalAutomatedAmount).toBe(2280); // Total monthly fixed expenses
      
      // Verify all expenses were updated with June marker
      const updateCalls = vi.mocked(fixedExpenseService.updateFixedExpense).mock.calls;
      updateCalls.forEach(call => {
        expect(call[2]).toEqual({ lastPostedMonth: '2024-5' }); // June (month index 5)
      });
    });
  });
});
