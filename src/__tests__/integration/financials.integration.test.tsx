import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinancialsProvider } from '../../contexts/FinancialsContext';
import { financialsService } from '../../services/financials/financialsService';
import * as firebaseFirestore from 'firebase/firestore';
import type { Financials } from '../../types';

// Mock de las funciones de Firestore
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDoc = vi.fn();
const mockOnSnapshot = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockAddDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockGetDocs = vi.fn();

// Mock Firestore functions
vi.mocked(firebaseFirestore.getDoc).mockImplementation(mockGetDoc);
vi.mocked(firebaseFirestore.setDoc).mockImplementation(mockSetDoc);
vi.mocked(firebaseFirestore.updateDoc).mockImplementation(mockUpdateDoc);
vi.mocked(firebaseFirestore.doc).mockImplementation(mockDoc);
vi.mocked(firebaseFirestore.onSnapshot).mockImplementation(mockOnSnapshot);
vi.mocked(firebaseFirestore.collection).mockImplementation(mockCollection);
vi.mocked(firebaseFirestore.query).mockImplementation(mockQuery);
vi.mocked(firebaseFirestore.addDoc).mockImplementation(mockAddDoc);
vi.mocked(firebaseFirestore.deleteDoc).mockImplementation(mockDeleteDoc);
vi.mocked(firebaseFirestore.getDocs).mockImplementation(mockGetDocs);

// Helper function to create mock financials document
const createMockFinancialsDoc = (financials: Financials) => ({
  exists: () => true,
  data: () => ({
    monthlyIncome: financials.monthlyIncome
  })
});

// Helper function to create an empty doc snapshot
const createEmptyDocSnapshot = () => ({
  exists: () => false,
  data: () => undefined
});

// Componente de prueba para el contexto financiero
const TestFinancialsComponent = ({ userId }: { userId: string }) => {
  return (
    <FinancialsProvider userId={userId}>
      <div data-testid="financials-content">
        <span data-testid="user-id">{userId}</span>
      </div>
    </FinancialsProvider>
  );
};

describe('Integration: Financials Management Flow', () => {
  const mockUserId = 'test-user-123';

  const mockFinancials: Financials = {
    monthlyIncome: 3000.00
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock documento de Firestore
    mockDoc.mockReturnValue('mock-doc-ref');
    mockCollection.mockReturnValue('mock-collection-ref');
    mockQuery.mockReturnValue('mock-query-ref');

    // Mock respuestas por defecto
    mockSetDoc.mockResolvedValue(undefined);
    mockAddDoc.mockResolvedValue({ id: 'mock-fixed-expense-id' });
    mockDeleteDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
    
    // Mock para el servicio de gastos fijos
    mockGetDocs.mockResolvedValue({
      docs: []
    });

    // Mock onSnapshot para el fixed expense service (segunda implementación)
    mockOnSnapshot.mockImplementation((queryRef, callback, errorCallback) => {
      // Si es una query (fixed expenses), devolver snapshot vacío
      if (queryRef === 'mock-query-ref') {
        callback({
          docs: []
        });
      } else {
        // Si es un doc (financials), usar el comportamiento del test específico
        callback(createEmptyDocSnapshot());
      }
      return vi.fn();
    });
  });

  describe('Monthly Income Management', () => {
    it('should successfully set monthly income', async () => {
      // Arrange
      const monthlyIncome = 2500.00;
      mockSetDoc.mockResolvedValue(undefined);

      // Act
      await financialsService.setMonthlyIncome(mockUserId, monthlyIncome);

      // Assert
      expect(mockSetDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          monthlyIncome: monthlyIncome
        }),
        { merge: true }
      );
    });

    it('should handle monthly income setting failure', async () => {
      // Arrange
      const monthlyIncome = 2500.00;
      mockSetDoc.mockRejectedValue(new Error('Firestore error'));

      // Act & Assert
      await expect(financialsService.setMonthlyIncome(mockUserId, monthlyIncome))
        .rejects.toThrow('Firestore error');
    });
  });

  describe('Real-time Financials Updates', () => {
    it('should successfully subscribe to financials updates', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const mockFinancialsDoc = createMockFinancialsDoc(mockFinancials);

      mockOnSnapshot.mockImplementation((docRef, callback, errorCallback) => {
        callback(mockFinancialsDoc);
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = financialsService.onFinancialsUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockOnSnapshot).toHaveBeenCalledWith('mock-doc-ref', expect.any(Function), expect.any(Function));
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          monthlyIncome: mockFinancials.monthlyIncome
        })
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle non-existent financials document in subscription', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockOnSnapshot.mockImplementation((docRef, callback, errorCallback) => {
        callback(createEmptyDocSnapshot());
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = financialsService.onFinancialsUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(null);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle subscription errors', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockOnSnapshot.mockImplementation((docRef, callback, errorCallback) => {
        errorCallback(new Error('Subscription error'));
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = financialsService.onFinancialsUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
        message: 'Subscription error'
      }));
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('Multiple Income Updates', () => {
    it('should handle multiple sequential income updates', async () => {
      // Arrange
      const incomeUpdates = [2000, 2500, 3000, 3500];
      mockSetDoc.mockResolvedValue(undefined);

      // Act
      for (const income of incomeUpdates) {
        await financialsService.setMonthlyIncome(mockUserId, income);
      }

      // Assert
      expect(mockSetDoc).toHaveBeenCalledTimes(4);
      expect(mockSetDoc).toHaveBeenLastCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          monthlyIncome: 3500
        }),
        { merge: true }
      );
    });
  });

  describe('Income Value Scenarios', () => {
    it('should handle zero income correctly', async () => {
      // Arrange
      const zeroIncome = 0;
      mockSetDoc.mockResolvedValue(undefined);

      // Act
      await financialsService.setMonthlyIncome(mockUserId, zeroIncome);

      // Assert
      expect(mockSetDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          monthlyIncome: 0
        }),
        { merge: true }
      );
    });

    it('should handle very large income values', async () => {
      // Arrange
      const largeIncome = 999999.99;
      mockSetDoc.mockResolvedValue(undefined);

      // Act
      await financialsService.setMonthlyIncome(mockUserId, largeIncome);

      // Assert
      expect(mockSetDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          monthlyIncome: largeIncome
        }),
        { merge: true }
      );
    });

    it('should handle decimal income values correctly', async () => {
      // Arrange
      const decimalIncome = 2545.67;
      mockSetDoc.mockResolvedValue(undefined);

      // Act
      await financialsService.setMonthlyIncome(mockUserId, decimalIncome);

      // Assert
      expect(mockSetDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          monthlyIncome: decimalIncome
        }),
        { merge: true }
      );
    });
  });

  describe('Integration with Financial Calculations', () => {
    it('should provide data for expense calculations through subscription', async () => {
      // Arrange
      const monthlyIncome = 3000;
      const monthlyExpenses = 2200;
      const expectedSavings = monthlyIncome - monthlyExpenses;
      
      const mockCallback = vi.fn();
      const mockFinancialsDoc = createMockFinancialsDoc({ monthlyIncome });

      mockOnSnapshot.mockImplementation((docRef, callback, errorCallback) => {
        callback(mockFinancialsDoc);
        return vi.fn();
      });

      // Act
      financialsService.onFinancialsUpdate(mockUserId, mockCallback);

      // Assert
      const receivedFinancials = mockCallback.mock.calls[0][0];
      const calculatedSavings = receivedFinancials.monthlyIncome - monthlyExpenses;
      
      expect(calculatedSavings).toBe(expectedSavings);
      expect(calculatedSavings).toBe(800);
    });

    it('should handle negative savings scenario', async () => {
      // Arrange
      const monthlyIncome = 2000;
      const monthlyExpenses = 2500;
      const expectedDeficit = monthlyIncome - monthlyExpenses;
      
      const mockCallback = vi.fn();
      const mockFinancialsDoc = createMockFinancialsDoc({ monthlyIncome });

      mockOnSnapshot.mockImplementation((docRef, callback, errorCallback) => {
        callback(mockFinancialsDoc);
        return vi.fn();
      });

      // Act
      financialsService.onFinancialsUpdate(mockUserId, mockCallback);

      // Assert
      const receivedFinancials = mockCallback.mock.calls[0][0];
      const calculatedSavings = receivedFinancials.monthlyIncome - monthlyExpenses;
      
      expect(calculatedSavings).toBe(expectedDeficit);
      expect(calculatedSavings).toBe(-500);
      expect(calculatedSavings).toBeLessThan(0);
    });
  });

  describe('Financials Context Integration', () => {
    it('should provide financials context correctly', async () => {
      // Arrange - Mock específico para esta prueba
      mockOnSnapshot.mockImplementation((ref, callback, errorCallback) => {
        // Financials service (doc ref)
        if (ref === 'mock-doc-ref') {
          callback(createEmptyDocSnapshot());
        }
        // Fixed expenses service (query ref)  
        else if (ref === 'mock-query-ref') {
          callback({
            docs: [] // Array vacío de documentos
          });
        }
        return vi.fn(); // mock unsubscribe
      });

      // Act
      render(<TestFinancialsComponent userId={mockUserId} />);

      // Assert
      expect(screen.getByTestId('financials-content')).toBeInTheDocument();
      expect(screen.getByTestId('user-id')).toHaveTextContent(mockUserId);
    });
  });

  describe('Data Persistence and State Management', () => {
    it('should demonstrate income update and subscription workflow', async () => {
      // Arrange
      let capturedFinancials: Financials | null = null;
      const mockCallback = vi.fn((financials: Financials | null) => {
        capturedFinancials = financials;
      });

      // Step 1: Set initial income
      await financialsService.setMonthlyIncome(mockUserId, 2000);

      // Step 2: Setup subscription that will receive the update
      mockOnSnapshot.mockImplementation((docRef, callback, errorCallback) => {
        callback(createMockFinancialsDoc({ monthlyIncome: 2500 }));
        return vi.fn();
      });

      // Step 3: Subscribe to updates
      const unsubscribe = financialsService.onFinancialsUpdate(mockUserId, mockCallback);

      // Step 4: Update income again
      await financialsService.setMonthlyIncome(mockUserId, 2500);

      // Assert
      expect(mockSetDoc).toHaveBeenCalledTimes(2);
      expect(mockSetDoc).toHaveBeenNthCalledWith(1, 'mock-doc-ref', { monthlyIncome: 2000 }, { merge: true });
      expect(mockSetDoc).toHaveBeenNthCalledWith(2, 'mock-doc-ref', { monthlyIncome: 2500 }, { merge: true });
      expect(mockCallback).toHaveBeenCalledWith({ monthlyIncome: 2500 });
      expect(capturedFinancials).toEqual({ monthlyIncome: 2500 });
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
