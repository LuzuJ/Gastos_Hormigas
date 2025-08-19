import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fixedExpenseService } from '../../services/fixedExpenseService';
import * as firebaseFirestore from 'firebase/firestore';
import type { FixedExpense } from '../../types';

// Mock de las funciones de Firestore
const mockAddDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockDoc = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockOnSnapshot = vi.fn();

// Mock Firestore functions
vi.mocked(firebaseFirestore.addDoc).mockImplementation(mockAddDoc);
vi.mocked(firebaseFirestore.deleteDoc).mockImplementation(mockDeleteDoc);
vi.mocked(firebaseFirestore.updateDoc).mockImplementation(mockUpdateDoc);
vi.mocked(firebaseFirestore.getDocs).mockImplementation(mockGetDocs);
vi.mocked(firebaseFirestore.doc).mockImplementation(mockDoc);
vi.mocked(firebaseFirestore.collection).mockImplementation(mockCollection);
vi.mocked(firebaseFirestore.query).mockImplementation(mockQuery);
vi.mocked(firebaseFirestore.onSnapshot).mockImplementation(mockOnSnapshot);

// Helper function to create mock fixed expense document
const createMockFixedExpenseDoc = (expense: FixedExpense) => ({
  id: expense.id,
  data: () => ({
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    dayOfMonth: expense.dayOfMonth,
    lastPostedMonth: expense.lastPostedMonth
  })
});

// Helper function to create mock fixed expenses query snapshot
const createMockFixedExpensesSnapshot = (expenses: FixedExpense[]) => ({
  docs: expenses.map(expense => createMockFixedExpenseDoc(expense))
});

describe('Integration: Fixed Expenses Management Flow', () => {
  const mockUserId = 'test-user-123';
  
  const mockFixedExpenses: FixedExpense[] = [
    {
      id: 'fixed-1',
      description: 'Alquiler',
      amount: 800,
      category: 'Hogar',
      dayOfMonth: 1,
      lastPostedMonth: '2024-01'
    },
    {
      id: 'fixed-2', 
      description: 'Netflix',
      amount: 15.99,
      category: 'Entretenimiento',
      dayOfMonth: 15
    },
    {
      id: 'fixed-3',
      description: 'Seguro Auto',
      amount: 120,
      category: 'Transporte',
      dayOfMonth: 5,
      lastPostedMonth: '2024-01'
    }
  ];

  const mockFixedExpenseData: Omit<FixedExpense, 'id'> = {
    description: 'Gym Membership',
    amount: 45,
    category: 'Salud',
    dayOfMonth: 10
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock referencias de Firestore
    mockDoc.mockReturnValue('mock-doc-ref');
    mockCollection.mockReturnValue('mock-collection-ref');
    mockQuery.mockReturnValue('mock-query-ref');
    
    // Mock respuestas por defecto
    mockAddDoc.mockResolvedValue({ id: 'new-fixed-expense-id' });
    mockDeleteDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
    mockGetDocs.mockResolvedValue(createMockFixedExpensesSnapshot([]));

    // Mock onSnapshot por defecto
    mockOnSnapshot.mockImplementation((queryRef, callback, errorCallback) => {
      callback(createMockFixedExpensesSnapshot([]));
      return vi.fn(); // mock unsubscribe
    });
  });

  describe('Fixed Expenses Creation', () => {
    it('should successfully add a new fixed expense', async () => {
      // Arrange
      mockAddDoc.mockResolvedValue({ id: 'new-fixed-expense-id' });

      // Act
      const result = await fixedExpenseService.addFixedExpense(mockUserId, mockFixedExpenseData);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        mockFixedExpenseData
      );
      expect(result).toEqual({ id: 'new-fixed-expense-id' });
    });

    it('should handle fixed expense creation failure', async () => {
      // Arrange
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      // Act & Assert
      await expect(fixedExpenseService.addFixedExpense(mockUserId, mockFixedExpenseData))
        .rejects.toThrow('Firestore error');
    });

    it('should create expense with correct day of month', async () => {
      // Arrange
      const expenseData: Omit<FixedExpense, 'id'> = {
        description: 'Monthly Subscription',
        amount: 29.99,
        category: 'Entretenimiento',
        dayOfMonth: 25
      };

      // Act
      await fixedExpenseService.addFixedExpense(mockUserId, expenseData);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          description: 'Monthly Subscription',
          amount: 29.99,
          dayOfMonth: 25
        })
      );
    });
  });

  describe('Fixed Expenses Deletion', () => {
    it('should successfully delete a fixed expense', async () => {
      // Arrange
      const expenseId = 'expense-to-delete';
      mockDeleteDoc.mockResolvedValue(undefined);

      // Act
      await fixedExpenseService.deleteFixedExpense(mockUserId, expenseId);

      // Assert
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(), // db
        'users',
        mockUserId,
        'fixedExpenses',
        expenseId
      );
    });

    it('should handle fixed expense deletion failure', async () => {
      // Arrange
      const expenseId = 'expense-to-delete';
      mockDeleteDoc.mockRejectedValue(new Error('Delete failed'));

      // Act & Assert
      await expect(fixedExpenseService.deleteFixedExpense(mockUserId, expenseId))
        .rejects.toThrow('Delete failed');
    });
  });

  describe('Fixed Expenses Updates', () => {
    it('should successfully update a fixed expense', async () => {
      // Arrange
      const expenseId = 'expense-to-update';
      const updateData: Partial<FixedExpense> = {
        amount: 50,
        lastPostedMonth: '2024-02'
      };
      
      mockUpdateDoc.mockResolvedValue(undefined);

      // Act
      await fixedExpenseService.updateFixedExpense(mockUserId, expenseId, updateData);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', updateData);
      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(), // db
        'users',
        mockUserId,
        'fixedExpenses',
        expenseId
      );
    });

    it('should handle partial updates correctly', async () => {
      // Arrange
      const expenseId = 'expense-to-update';
      const partialUpdate: Partial<FixedExpense> = {
        lastPostedMonth: '2024-03'
      };

      // Act
      await fixedExpenseService.updateFixedExpense(mockUserId, expenseId, partialUpdate);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          lastPostedMonth: '2024-03'
        })
      );
    });

    it('should handle fixed expense update failure', async () => {
      // Arrange
      const expenseId = 'expense-to-update';
      const updateData: Partial<FixedExpense> = { amount: 100 };
      mockUpdateDoc.mockRejectedValue(new Error('Update failed'));

      // Act & Assert
      await expect(fixedExpenseService.updateFixedExpense(mockUserId, expenseId, updateData))
        .rejects.toThrow('Update failed');
    });
  });

  describe('Fixed Expenses Retrieval', () => {
    it('should successfully get fixed expenses once', async () => {
      // Arrange
      const expectedExpenses = mockFixedExpenses.slice(0, 2);
      mockGetDocs.mockResolvedValue(createMockFixedExpensesSnapshot(expectedExpenses));

      // Act
      const result = await fixedExpenseService.getFixedExpensesOnce(mockUserId);

      // Assert
      expect(mockGetDocs).toHaveBeenCalledWith('mock-collection-ref');
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'fixed-1',
            description: 'Alquiler',
            amount: 800
          }),
          expect.objectContaining({
            id: 'fixed-2',
            description: 'Netflix',
            amount: 15.99
          })
        ])
      );
    });

    it('should handle empty fixed expenses collection', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue(createMockFixedExpensesSnapshot([]));

      // Act
      const result = await fixedExpenseService.getFixedExpensesOnce(mockUserId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle get fixed expenses failure', async () => {
      // Arrange
      mockGetDocs.mockRejectedValue(new Error('Get docs failed'));

      // Act & Assert
      await expect(fixedExpenseService.getFixedExpensesOnce(mockUserId))
        .rejects.toThrow('Get docs failed');
    });
  });

  describe('Real-time Fixed Expenses Updates', () => {
    it('should successfully subscribe to fixed expenses updates', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const mockSnapshot = createMockFixedExpensesSnapshot(mockFixedExpenses);

      mockOnSnapshot.mockImplementation((queryRef, callback, errorCallback) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = fixedExpenseService.onFixedExpensesUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockOnSnapshot).toHaveBeenCalledWith(
        'mock-query-ref',
        expect.any(Function),
        expect.any(Function)
      );
      
      // Should be sorted by dayOfMonth
      expect(mockCallback).toHaveBeenCalledWith([
        expect.objectContaining({ dayOfMonth: 1, description: 'Alquiler' }),
        expect.objectContaining({ dayOfMonth: 5, description: 'Seguro Auto' }),
        expect.objectContaining({ dayOfMonth: 15, description: 'Netflix' })
      ]);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle empty fixed expenses list', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const emptySnapshot = createMockFixedExpensesSnapshot([]);

      mockOnSnapshot.mockImplementation((queryRef, callback, errorCallback) => {
        callback(emptySnapshot);
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = fixedExpenseService.onFixedExpensesUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith([]);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle subscription errors', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockOnSnapshot.mockImplementation((queryRef, callback, errorCallback) => {
        errorCallback(new Error('Subscription error'));
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = fixedExpenseService.onFixedExpensesUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith([], expect.objectContaining({
        message: 'Subscription error'
      }));
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('Fixed Expenses Sorting and Organization', () => {
    it('should sort expenses by day of month', async () => {
      // Arrange
      const unsortedExpenses: FixedExpense[] = [
        { id: '1', description: 'Last', amount: 100, category: 'Test', dayOfMonth: 30 },
        { id: '2', description: 'First', amount: 200, category: 'Test', dayOfMonth: 1 },
        { id: '3', description: 'Middle', amount: 150, category: 'Test', dayOfMonth: 15 }
      ];

      const mockCallback = vi.fn();
      
      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockFixedExpensesSnapshot(unsortedExpenses));
        return vi.fn();
      });

      // Act
      fixedExpenseService.onFixedExpensesUpdate(mockUserId, mockCallback);

      // Assert
      const sortedExpenses = mockCallback.mock.calls[0][0];
      expect(sortedExpenses[0].dayOfMonth).toBe(1);
      expect(sortedExpenses[1].dayOfMonth).toBe(15);
      expect(sortedExpenses[2].dayOfMonth).toBe(30);
    });

    it('should handle expenses with same day of month', async () => {
      // Arrange
      const sameDay: FixedExpense[] = [
        { id: '1', description: 'Expense A', amount: 100, category: 'Test', dayOfMonth: 15 },
        { id: '2', description: 'Expense B', amount: 200, category: 'Test', dayOfMonth: 15 }
      ];

      const mockCallback = vi.fn();
      
      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockFixedExpensesSnapshot(sameDay));
        return vi.fn();
      });

      // Act
      fixedExpenseService.onFixedExpensesUpdate(mockUserId, mockCallback);

      // Assert
      const expenses = mockCallback.mock.calls[0][0];
      expect(expenses).toHaveLength(2);
      expenses.forEach((expense: FixedExpense) => {
        expect(expense.dayOfMonth).toBe(15);
      });
    });
  });

  describe('Monthly Tracking and Automation', () => {
    it('should track last posted month correctly', async () => {
      // Arrange
      const expenseId = 'tracked-expense';
      const currentMonth = '2024-02';
      
      const updateData: Partial<FixedExpense> = {
        lastPostedMonth: currentMonth
      };

      // Act
      await fixedExpenseService.updateFixedExpense(mockUserId, expenseId, updateData);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          lastPostedMonth: currentMonth
        })
      );
    });

    it('should handle expenses without lastPostedMonth', async () => {
      // Arrange
      const newExpenses: FixedExpense[] = [
        { id: '1', description: 'New Expense', amount: 100, category: 'Test', dayOfMonth: 10 }
      ];

      const mockCallback = vi.fn();
      
      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockFixedExpensesSnapshot(newExpenses));
        return vi.fn();
      });

      // Act
      fixedExpenseService.onFixedExpensesUpdate(mockUserId, mockCallback);

      // Assert
      const expenses = mockCallback.mock.calls[0][0];
      expect(expenses[0].lastPostedMonth).toBeUndefined();
    });
  });

  describe('Multiple Operations Integration', () => {
    it('should handle complete lifecycle of fixed expense', async () => {
      // Arrange
      const mockCallback = vi.fn();
      let operationCount = 0;

      // Step 1: Start with empty list
      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        if (operationCount === 0) {
          callback(createMockFixedExpensesSnapshot([]));
        } else {
          // Simulate expense added
          const newExpense: FixedExpense = {
            id: 'lifecycle-expense',
            description: 'Test Lifecycle',
            amount: 100,
            category: 'Test',
            dayOfMonth: 15
          };
          callback(createMockFixedExpensesSnapshot([newExpense]));
        }
        return vi.fn();
      });

      // Step 2: Start subscription
      const unsubscribe = fixedExpenseService.onFixedExpensesUpdate(mockUserId, mockCallback);

      // Step 3: Add new expense
      operationCount++;
      await fixedExpenseService.addFixedExpense(mockUserId, {
        description: 'Test Lifecycle',
        amount: 100,
        category: 'Test',
        dayOfMonth: 15
      });

      // Step 4: Update expense
      await fixedExpenseService.updateFixedExpense(mockUserId, 'lifecycle-expense', {
        amount: 120,
        lastPostedMonth: '2024-02'
      });

      // Step 5: Delete expense
      await fixedExpenseService.deleteFixedExpense(mockUserId, 'lifecycle-expense');

      // Assert all operations
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          description: 'Test Lifecycle',
          amount: 100,
          dayOfMonth: 15
        })
      );
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          amount: 120,
          lastPostedMonth: '2024-02'
        })
      );
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle batch operations correctly', async () => {
      // Arrange
      const expensesToAdd: Omit<FixedExpense, 'id'>[] = [
        { description: 'Rent', amount: 1000, category: 'Hogar', dayOfMonth: 1 },
        { description: 'Phone', amount: 50, category: 'Comunicaciones', dayOfMonth: 5 },
        { description: 'Internet', amount: 60, category: 'Comunicaciones', dayOfMonth: 5 }
      ];

      // Act - Add multiple expenses
      const results = await Promise.all(
        expensesToAdd.map(expense => fixedExpenseService.addFixedExpense(mockUserId, expense))
      );

      // Act - Get all expenses (verify service call)
      await fixedExpenseService.getFixedExpensesOnce(mockUserId);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledTimes(3);
      expect(results).toHaveLength(3);
      expect(mockGetDocs).toHaveBeenCalledWith('mock-collection-ref');
    });
  });

  describe('Data Validation and Edge Cases', () => {
    it('should handle decimal amounts correctly', async () => {
      // Arrange
      const decimalExpense: Omit<FixedExpense, 'id'> = {
        description: 'Streaming Service',
        amount: 12.99,
        category: 'Entretenimiento',
        dayOfMonth: 20
      };

      // Act
      await fixedExpenseService.addFixedExpense(mockUserId, decimalExpense);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          amount: 12.99
        })
      );
    });

    it('should handle edge case day of month values', async () => {
      // Arrange
      const edgeCases: Omit<FixedExpense, 'id'>[] = [
        { description: 'First day', amount: 100, category: 'Test', dayOfMonth: 1 },
        { description: 'Last day', amount: 200, category: 'Test', dayOfMonth: 31 }
      ];

      // Act
      for (const expense of edgeCases) {
        await fixedExpenseService.addFixedExpense(mockUserId, expense);
      }

      // Assert
      expect(mockAddDoc).toHaveBeenNthCalledWith(1, 'mock-collection-ref', 
        expect.objectContaining({ dayOfMonth: 1 }));
      expect(mockAddDoc).toHaveBeenNthCalledWith(2, 'mock-collection-ref', 
        expect.objectContaining({ dayOfMonth: 31 }));
    });

    it('should handle long descriptions', async () => {
      // Arrange
      const longDescription = 'This is a very long description for a fixed expense that might be used to describe complex recurring payments or services with detailed information';
      const expenseData: Omit<FixedExpense, 'id'> = {
        description: longDescription,
        amount: 75,
        category: 'Servicios',
        dayOfMonth: 12
      };

      // Act
      await fixedExpenseService.addFixedExpense(mockUserId, expenseData);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          description: longDescription
        })
      );
    });
  });
});
