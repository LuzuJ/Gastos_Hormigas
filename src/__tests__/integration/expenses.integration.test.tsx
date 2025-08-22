import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExpensesProvider } from '../../contexts/ExpensesContext';
import { expensesService } from '../../services/expenses/expensesService';
import { categoryService } from '../../services/categories/categoryService';
import * as firebaseFirestore from 'firebase/firestore';
import type { Expense, Category } from '../../types';

// Mock de las funciones de Firestore
const mockAddDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockDeleteDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockOnSnapshot = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockCollection = vi.fn();
const mockDoc = vi.fn();

// Mock Firestore functions
vi.mocked(firebaseFirestore.addDoc).mockImplementation(mockAddDoc);
vi.mocked(firebaseFirestore.getDocs).mockImplementation(mockGetDocs);
vi.mocked(firebaseFirestore.deleteDoc).mockImplementation(mockDeleteDoc);
vi.mocked(firebaseFirestore.updateDoc).mockImplementation(mockUpdateDoc);
vi.mocked(firebaseFirestore.onSnapshot).mockImplementation(mockOnSnapshot);
vi.mocked(firebaseFirestore.query).mockImplementation(mockQuery);
vi.mocked(firebaseFirestore.where).mockImplementation(mockWhere);
vi.mocked(firebaseFirestore.orderBy).mockImplementation(mockOrderBy);
vi.mocked(firebaseFirestore.collection).mockImplementation(mockCollection);
vi.mocked(firebaseFirestore.doc).mockImplementation(mockDoc);

// Helper functions to reduce nesting complexity
const createMockExpenseDoc = (expense: Expense) => ({
  id: expense.id,
  data: () => ({
    description: expense.description,
    amount: expense.amount,
    categoryId: expense.categoryId,
    subCategory: expense.subCategory,
    createdAt: expense.createdAt
  })
});

const createMockCategoryDoc = (category: Category) => ({
  id: category.id,
  data: () => ({
    name: category.name,
    isDefault: category.isDefault,
    subcategories: category.subcategories || [],
    icon: category.icon,
    color: category.color
  })
});

// Componente de prueba que simula la gestión de gastos
const TestExpensesComponent = ({ userId }: { userId: string }) => {
  return (
    <ExpensesProvider userId={userId}>
      <div data-testid="expenses-content">
        <span data-testid="user-id">{userId}</span>
      </div>
    </ExpensesProvider>
  );
};

describe('Integration: Expenses Management Flow', () => {
  const mockUserId = 'test-user-123';
  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'Alimentación',
      isDefault: true,
      subcategories: [
        { id: 'sub-1', name: 'Supermercado' },
        { id: 'sub-2', name: 'Restaurantes' }
      ],
      icon: '🍕',
      color: '#FF6B6B'
    },
    {
      id: 'cat-2', 
      name: 'Transporte',
      isDefault: true,
      subcategories: [
        { id: 'sub-3', name: 'Combustible' },
        { id: 'sub-4', name: 'Transporte público' }
      ],
      icon: '🚗',
      color: '#4ECDC4'
    }
  ];

  const mockExpenses: Expense[] = [
    {
      id: 'exp-1',
      description: 'Compra supermercado',
      amount: 50.25,
      categoryId: 'cat-1',
      subCategory: 'Supermercado',
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
    },
    {
      id: 'exp-2', 
      description: 'Gasolina',
      amount: 45.00,
      categoryId: 'cat-2',
      subCategory: 'Combustible',
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock colecciones de Firestore
    mockCollection.mockReturnValue('mock-collection-ref');
    mockDoc.mockReturnValue('mock-doc-ref');
    mockQuery.mockReturnValue('mock-query-ref');
    mockWhere.mockReturnValue('mock-where-ref');
    mockOrderBy.mockReturnValue('mock-order-ref');

    // Mock respuestas por defecto
    mockGetDocs.mockResolvedValue({
      empty: false,
      docs: []
    });

    mockAddDoc.mockResolvedValue({
      id: 'new-expense-id'
    });

    mockDeleteDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  describe('Expense Creation', () => {
    it('should successfully create a new expense', async () => {
      // Arrange
      const newExpense = {
        description: 'Nueva compra',
        amount: 25.50,
        categoryId: 'cat-1',
        subCategory: 'Supermercado',
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      };

      mockAddDoc.mockResolvedValue({
        id: 'exp-new-123'
      });

      // Act
      const result = await expensesService.addExpense(mockUserId, newExpense);

      // Assert
      expect(result.id).toBe('exp-new-123');
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          description: newExpense.description,
          amount: newExpense.amount,
          categoryId: newExpense.categoryId,
          subCategory: newExpense.subCategory
        })
      );
    });

    it('should handle expense creation failure', async () => {
      // Arrange
      const newExpense = {
        description: 'Gasto fallido',
        amount: 30.00,
        categoryId: 'cat-1',
        subCategory: 'Supermercado',
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      };

      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      // Act & Assert
      await expect(expensesService.addExpense(mockUserId, newExpense))
        .rejects.toThrow('Firestore error');
    });
  });

  describe('Expense Retrieval', () => {
    it('should successfully get expenses through onExpensesUpdate', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockDocs = mockExpenses.map(createMockExpenseDoc);

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({ docs: mockDocs });
        return vi.fn(); // mock unsubscribe
      });

      // Act
      const unsubscribe = expensesService.onExpensesUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'exp-1',
            description: 'Compra supermercado',
            amount: 50.25,
            categoryId: 'cat-1',
            subCategory: 'Supermercado'
          }),
          expect.objectContaining({
            id: 'exp-2',
            description: 'Gasolina',
            amount: 45.00,
            categoryId: 'cat-2',
            subCategory: 'Combustible'
          })
        ])
      );
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle empty expenses list', async () => {
      // Arrange
      const mockCallback = vi.fn();

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({ docs: [] });
        return vi.fn(); // mock unsubscribe
      });

      // Act
      expensesService.onExpensesUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith([]);
    });
  });

  describe('Expense Updates', () => {
    it('should successfully update an expense', async () => {
      // Arrange
      const updatedData = {
        description: 'Compra actualizada',
        amount: 75.00,
        categoryId: 'cat-2',
        subCategory: 'Combustible'
      };

      mockUpdateDoc.mockResolvedValue(undefined);

      // Act
      await expensesService.updateExpense(mockUserId, 'exp-1', updatedData);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining(updatedData)
      );
    });

    it('should handle expense update failure', async () => {
      // Arrange
      const updatedData = {
        description: 'Actualización fallida',
        amount: 100.00
      };

      mockUpdateDoc.mockRejectedValue(new Error('Update failed'));

      // Act & Assert
      await expect(expensesService.updateExpense(mockUserId, 'exp-1', updatedData))
        .rejects.toThrow('Update failed');
    });
  });

  describe('Expense Deletion', () => {
    it('should successfully delete an expense', async () => {
      // Arrange
      mockDeleteDoc.mockResolvedValue(undefined);

      // Act
      await expensesService.deleteExpense(mockUserId, 'exp-1');

      // Assert
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
    });

    it('should handle expense deletion failure', async () => {
      // Arrange
      mockDeleteDoc.mockRejectedValue(new Error('Delete failed'));

      // Act & Assert
      await expect(expensesService.deleteExpense(mockUserId, 'exp-1'))
        .rejects.toThrow('Delete failed');
    });
  });

  describe('Category Integration', () => {
    it('should work correctly with categories when creating expenses', async () => {
      // Arrange - Mock categories through onCategoriesUpdate
      const mockCategoryCallback = vi.fn();
      const mockCategoryDocs = mockCategories.map(createMockCategoryDoc);
      
      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({ docs: mockCategoryDocs });
        return vi.fn(); // mock unsubscribe
      });

      // Act - Subscribe to categories
      const unsubscribeCategories = categoryService.onCategoriesUpdate(mockUserId, mockCategoryCallback);

      // Assert - Categories are loaded correctly
      expect(mockCategoryCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'cat-1',
            name: 'Alimentación'
          }),
          expect.objectContaining({
            id: 'cat-2',
            name: 'Transporte'
          })
        ])
      );

      // Arrange - Create expense with valid category
      const newExpense = {
        description: 'Compra con categoría válida',
        amount: 35.75,
        categoryId: 'cat-1',
        subCategory: 'Supermercado',
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      };

      mockAddDoc.mockResolvedValue({
        id: 'exp-with-category'
      });

      // Act - Create expense
      const expenseDoc = await expensesService.addExpense(mockUserId, newExpense);

      // Assert - Expense created with correct category
      expect(expenseDoc.id).toBe('exp-with-category');
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          categoryId: 'cat-1',
          subCategory: 'Supermercado'
        })
      );
      
      expect(typeof unsubscribeCategories).toBe('function');
    });
  });

  describe('Real-time Updates', () => {
    it('should set up real-time listener correctly', async () => {
      // Arrange
      const mockUnsubscribe = vi.fn();
      const mockCallback = vi.fn();
      const mockDocs = mockExpenses.map(createMockExpenseDoc);

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({ docs: mockDocs });
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = expensesService.onExpensesUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'exp-1',
            description: 'Compra supermercado'
          }),
          expect.objectContaining({
            id: 'exp-2',
            description: 'Gasolina'
          })
        ])
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('Expenses Context Integration', () => {
    it('should provide expenses context correctly', async () => {
      // Arrange - Mock para evitar el error de localeCompare
      mockOnSnapshot.mockImplementation((query, callback) => {
        // Para el contexto de gastos, devolvemos una respuesta vacía por defecto
        callback({ docs: [] });
        return vi.fn(); // mock unsubscribe
      });

      // Act
      render(<TestExpensesComponent userId={mockUserId} />);

      // Assert
      expect(screen.getByTestId('expenses-content')).toBeInTheDocument();
      expect(screen.getByTestId('user-id')).toHaveTextContent(mockUserId);
    });
  });
});
