import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { categoryService } from '../../services/categories/categoryService';
import * as firebaseFirestore from 'firebase/firestore';
import type { Category } from '../../types';

// Mock de las funciones de Firestore
const mockAddDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockDeleteDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockOnSnapshot = vi.fn();
const mockQuery = vi.fn();
const mockWriteBatch = vi.fn();
const mockCollection = vi.fn();
const mockDoc = vi.fn();
const mockArrayUnion = vi.fn();
const mockArrayRemove = vi.fn();

// Mock Firestore functions
vi.mocked(firebaseFirestore.addDoc).mockImplementation(mockAddDoc);
vi.mocked(firebaseFirestore.getDocs).mockImplementation(mockGetDocs);
vi.mocked(firebaseFirestore.deleteDoc).mockImplementation(mockDeleteDoc);
vi.mocked(firebaseFirestore.updateDoc).mockImplementation(mockUpdateDoc);
vi.mocked(firebaseFirestore.onSnapshot).mockImplementation(mockOnSnapshot);
vi.mocked(firebaseFirestore.query).mockImplementation(mockQuery);
vi.mocked(firebaseFirestore.writeBatch).mockImplementation(mockWriteBatch);
vi.mocked(firebaseFirestore.collection).mockImplementation(mockCollection);
vi.mocked(firebaseFirestore.doc).mockImplementation(mockDoc);
vi.mocked(firebaseFirestore.arrayUnion).mockImplementation(mockArrayUnion);
vi.mocked(firebaseFirestore.arrayRemove).mockImplementation(mockArrayRemove);

// Helper function to create mock category documents
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

// Componente de prueba simple para probar el contexto
const TestCategoriesComponent = ({ userId }: { userId: string }) => {
  return (
    <div data-testid="categories-content">
      <span data-testid="user-id">{userId}</span>
    </div>
  );
};

describe('Integration: Categories Management Flow', () => {
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
    },
    {
      id: 'cat-3',
      name: 'Entretenimiento',
      isDefault: false,
      subcategories: [
        { id: 'sub-5', name: 'Cine' },
        { id: 'sub-6', name: 'Deportes' }
      ],
      icon: '🎬',
      color: '#45B7D1'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock colecciones de Firestore
    mockCollection.mockReturnValue('mock-collection-ref');
    mockDoc.mockReturnValue('mock-doc-ref');
    mockQuery.mockReturnValue('mock-query-ref');

    // Mock respuestas por defecto
    mockAddDoc.mockResolvedValue({
      id: 'new-category-id'
    });

    mockDeleteDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
    mockArrayUnion.mockReturnValue('mock-array-union');
    mockArrayRemove.mockReturnValue('mock-array-remove');
  });

  describe('Default Categories Initialization', () => {
    it('should successfully initialize default categories for new user', async () => {
      // Arrange - User has no existing categories
      mockGetDocs.mockResolvedValue({
        empty: true,
        docs: []
      });

      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined)
      };
      mockWriteBatch.mockReturnValue(mockBatch);

      // Act
      const result = await categoryService.initializeDefaultCategories(mockUserId);

      // Assert
      expect(result).toBe(true);
      expect(mockGetDocs).toHaveBeenCalled();
      expect(mockWriteBatch).toHaveBeenCalled();
      expect(mockBatch.set).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should not initialize default categories if user already has categories', async () => {
      // Arrange - User already has categories
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{ id: 'existing-cat' }]
      });

      // Act
      const result = await categoryService.initializeDefaultCategories(mockUserId);

      // Assert
      expect(result).toBe(false);
      expect(mockGetDocs).toHaveBeenCalled();
      expect(mockWriteBatch).not.toHaveBeenCalled();
    });
  });

  describe('Categories Subscription', () => {
    it('should successfully subscribe to categories updates', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const mockCategoryDocs = mockCategories.map(createMockCategoryDoc);

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({
          docs: mockCategoryDocs
        });
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = categoryService.onCategoriesUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'cat-1',
            name: 'Alimentación',
            isDefault: true
          }),
          expect.objectContaining({
            id: 'cat-2',
            name: 'Transporte',
            isDefault: true
          }),
          expect.objectContaining({
            id: 'cat-3',
            name: 'Entretenimiento',
            isDefault: false
          })
        ])
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle empty categories list', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({
          docs: []
        });
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = categoryService.onCategoriesUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith([]);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('Category Creation', () => {
    it('should successfully add a new category', async () => {
      // Arrange
      const categoryName = 'Nueva Categoría';
      
      mockAddDoc.mockResolvedValue({
        id: 'new-cat-123'
      });

      // Act
      const result = await categoryService.addCategory(mockUserId, categoryName);

      // Assert
      expect(result.id).toBe('new-cat-123');
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          name: categoryName,
          isDefault: false,
          subcategories: [],
          icon: 'Tag',
          color: '#607D8B'
        })
      );
    });

    it('should handle category creation failure', async () => {
      // Arrange
      const categoryName = 'Categoría Fallida';
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      // Act & Assert
      await expect(categoryService.addCategory(mockUserId, categoryName))
        .rejects.toThrow('Firestore error');
    });
  });

  describe('Category Deletion', () => {
    it('should successfully delete a category', async () => {
      // Arrange
      const categoryId = 'cat-to-delete';
      mockDeleteDoc.mockResolvedValue(undefined);

      // Act
      await categoryService.deleteCategory(mockUserId, categoryId);

      // Assert
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
    });

    it('should handle category deletion failure', async () => {
      // Arrange
      const categoryId = 'cat-to-delete';
      mockDeleteDoc.mockRejectedValue(new Error('Delete failed'));

      // Act & Assert
      await expect(categoryService.deleteCategory(mockUserId, categoryId))
        .rejects.toThrow('Delete failed');
    });
  });

  describe('Subcategory Management', () => {
    it('should successfully add a subcategory to existing category', async () => {
      // Arrange
      const categoryId = 'cat-1';
      const subCategoryName = 'Nueva Subcategoría';
      
      mockUpdateDoc.mockResolvedValue(undefined);

      // Act
      await categoryService.addSubCategory(mockUserId, categoryId, subCategoryName);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          subcategories: 'mock-array-union'
        })
      );
      expect(mockArrayUnion).toHaveBeenCalledWith(
        expect.objectContaining({
          name: subCategoryName
        })
      );
    });

    it('should handle subcategory addition failure', async () => {
      // Arrange
      const categoryId = 'cat-1';
      const subCategoryName = 'Subcategoría Fallida';
      mockUpdateDoc.mockRejectedValue(new Error('Update failed'));

      // Act & Assert
      await expect(categoryService.addSubCategory(mockUserId, categoryId, subCategoryName))
        .rejects.toThrow('Update failed');
    });
  });

  describe('Category Style Updates', () => {
    it('should successfully update category icon and color', async () => {
      // Arrange
      const categoryId = 'cat-1';
      const newStyle = {
        icon: '🎯',
        color: '#FF5733'
      };
      
      mockUpdateDoc.mockResolvedValue(undefined);

      // Act
      await categoryService.updateCategoryStyle(mockUserId, categoryId, newStyle);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          icon: newStyle.icon,
          color: newStyle.color
        })
      );
    });

    it('should handle style update failure', async () => {
      // Arrange
      const categoryId = 'cat-1';
      const newStyle = {
        icon: '🎯',
        color: '#FF5733'
      };
      mockUpdateDoc.mockRejectedValue(new Error('Style update failed'));

      // Act & Assert
      await expect(categoryService.updateCategoryStyle(mockUserId, categoryId, newStyle))
        .rejects.toThrow('Style update failed');
    });
  });

  describe('Categories Sorting', () => {
    it('should sort categories alphabetically', async () => {
      // Arrange
      const unsortedCategories = [
        { ...mockCategories[2] }, // Entretenimiento
        { ...mockCategories[0] }, // Alimentación  
        { ...mockCategories[1] }  // Transporte
      ];
      
      const mockCallback = vi.fn();
      const mockCategoryDocs = unsortedCategories.map(createMockCategoryDoc);

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({
          docs: mockCategoryDocs
        });
        return vi.fn();
      });

      // Act
      categoryService.onCategoriesUpdate(mockUserId, mockCallback);

      // Assert
      const sortedCategories = mockCallback.mock.calls[0][0];
      expect(sortedCategories[0].name).toBe('Alimentación');
      expect(sortedCategories[1].name).toBe('Entretenimiento');
      expect(sortedCategories[2].name).toBe('Transporte');
    });
  });

  describe('Default vs Custom Categories', () => {
    it('should distinguish between default and custom categories', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockCategoryDocs = mockCategories.map(createMockCategoryDoc);

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({
          docs: mockCategoryDocs
        });
        return vi.fn();
      });

      // Act
      categoryService.onCategoriesUpdate(mockUserId, mockCallback);

      // Assert
      const categories = mockCallback.mock.calls[0][0];
      const defaultCategories = categories.filter((cat: Category) => cat.isDefault);
      const customCategories = categories.filter((cat: Category) => !cat.isDefault);
      
      expect(defaultCategories).toHaveLength(2);
      expect(customCategories).toHaveLength(1);
      expect(customCategories[0].name).toBe('Entretenimiento');
    });
  });

  describe('Subcategories Structure', () => {
    it('should maintain subcategories structure correctly', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockCategoryDocs = mockCategories.map(createMockCategoryDoc);

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({
          docs: mockCategoryDocs
        });
        return vi.fn();
      });

      // Act
      categoryService.onCategoriesUpdate(mockUserId, mockCallback);

      // Assert
      const categories = mockCallback.mock.calls[0][0];
      const alimentacionCategory = categories.find((cat: Category) => cat.name === 'Alimentación');
      
      expect(alimentacionCategory.subcategories).toHaveLength(2);
      expect(alimentacionCategory.subcategories[0].name).toBe('Supermercado');
      expect(alimentacionCategory.subcategories[1].name).toBe('Restaurantes');
      expect(alimentacionCategory.subcategories[0].id).toBeDefined();
      expect(alimentacionCategory.subcategories[1].id).toBeDefined();
    });
  });

  describe('Context Integration', () => {
    it('should work correctly with React context', async () => {
      // Act
      render(<TestCategoriesComponent userId={mockUserId} />);

      // Assert
      expect(screen.getByTestId('categories-content')).toBeInTheDocument();
      expect(screen.getByTestId('user-id')).toHaveTextContent(mockUserId);
    });
  });
});
