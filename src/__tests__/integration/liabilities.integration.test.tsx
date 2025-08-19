import { describe, it, expect, vi, beforeEach } from 'vitest';
import { liabilityService } from '../../services/liabilityService';
import * as firebaseFirestore from 'firebase/firestore';
import type { Liability, LiabilityFormData } from '../../types';

// Mock de las funciones de Firestore
const mockAddDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDoc = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockOnSnapshot = vi.fn();

// Mock Firestore functions
vi.mocked(firebaseFirestore.addDoc).mockImplementation(mockAddDoc);
vi.mocked(firebaseFirestore.deleteDoc).mockImplementation(mockDeleteDoc);
vi.mocked(firebaseFirestore.updateDoc).mockImplementation(mockUpdateDoc);
vi.mocked(firebaseFirestore.doc).mockImplementation(mockDoc);
vi.mocked(firebaseFirestore.collection).mockImplementation(mockCollection);
vi.mocked(firebaseFirestore.query).mockImplementation(mockQuery);
vi.mocked(firebaseFirestore.onSnapshot).mockImplementation(mockOnSnapshot);

// Helper function to create mock liability document
const createMockLiabilityDoc = (liability: Liability) => ({
  id: liability.id,
  data: () => ({
    name: liability.name,
    amount: liability.amount,
    type: liability.type
  })
});

// Helper function to create mock liabilities query snapshot
const createMockLiabilitiesSnapshot = (liabilities: Liability[]) => ({
  docs: liabilities.map(liability => createMockLiabilityDoc(liability))
});

describe('Integration: Liabilities Management Flow', () => {
  const mockUserId = 'test-user-123';
  
  const mockLiabilities: Liability[] = [
    {
      id: 'liability-1',
      name: 'Tarjeta de Crédito Visa',
      amount: 2500,
      type: 'credit_card'
    },
    {
      id: 'liability-2', 
      name: 'Préstamo Hipotecario',
      amount: 180000,
      type: 'loan'
    },
    {
      id: 'liability-3',
      name: 'Tarjeta Mastercard',
      amount: 800,
      type: 'credit_card'
    }
  ];

  const mockLiabilityFormData: LiabilityFormData = {
    name: 'Nuevo Pasivo',
    amount: 5000,
    type: 'loan'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock referencias de Firestore
    mockDoc.mockReturnValue('mock-doc-ref');
    mockCollection.mockReturnValue('mock-collection-ref');
    mockQuery.mockReturnValue('mock-query-ref');
    
    // Mock respuestas por defecto
    mockAddDoc.mockResolvedValue({ id: 'new-liability-id' });
    mockDeleteDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);

    // Mock onSnapshot por defecto
    mockOnSnapshot.mockImplementation((queryRef, callback) => {
      callback(createMockLiabilitiesSnapshot([]));
      return vi.fn(); // mock unsubscribe
    });
  });

  describe('Liabilities Creation', () => {
    it('should successfully add a new liability', async () => {
      // Arrange
      mockAddDoc.mockResolvedValue({ id: 'new-liability-id' });

      // Act
      const result = await liabilityService.addLiability(mockUserId, mockLiabilityFormData);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          ...mockLiabilityFormData,
          originalAmount: mockLiabilityFormData.amount, // Se añade automáticamente
          lastUpdated: expect.any(Object)
        })
      );
      expect(result).toEqual({ id: 'new-liability-id' });
    });

    it('should handle liability creation failure', async () => {
      // Arrange
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      // Act & Assert
      await expect(liabilityService.addLiability(mockUserId, mockLiabilityFormData))
        .rejects.toThrow('Firestore error');
    });

    it('should create different liability types correctly', async () => {
      // Arrange
      const liabilityTypes: LiabilityFormData[] = [
        { name: 'Credit Card Debt', amount: 1500, type: 'credit_card' },
        { name: 'Car Loan', amount: 25000, type: 'loan' }
      ];

      // Act
      for (const liability of liabilityTypes) {
        await liabilityService.addLiability(mockUserId, liability);
      }

      // Assert
      expect(mockAddDoc).toHaveBeenCalledTimes(2);
      expect(mockAddDoc).toHaveBeenNthCalledWith(1, 'mock-collection-ref', 
        expect.objectContaining({ type: 'credit_card' }));
      expect(mockAddDoc).toHaveBeenNthCalledWith(2, 'mock-collection-ref', 
        expect.objectContaining({ type: 'loan' }));
    });
  });

  describe('Liabilities Updates', () => {
    it('should successfully update a liability', async () => {
      // Arrange
      const liabilityId = 'liability-to-update';
      const updateData: Partial<LiabilityFormData> = {
        amount: 3000,
        name: 'Updated Liability Name'
      };
      
      mockUpdateDoc.mockResolvedValue(undefined);

      // Act
      await liabilityService.updateLiability(mockUserId, liabilityId, updateData);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', expect.objectContaining({
        ...updateData,
        lastUpdated: expect.any(Object)
      }));
      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(), // db
        'users',
        mockUserId,
        'liabilities',
        liabilityId
      );
    });

    it('should handle partial updates correctly', async () => {
      // Arrange
      const liabilityId = 'liability-to-update';
      const partialUpdate: Partial<LiabilityFormData> = {
        amount: 1200
      };

      // Act
      await liabilityService.updateLiability(mockUserId, liabilityId, partialUpdate);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          amount: 1200
        })
      );
    });

    it('should handle liability update failure', async () => {
      // Arrange
      const liabilityId = 'liability-to-update';
      const updateData: Partial<LiabilityFormData> = { amount: 8000 };
      mockUpdateDoc.mockRejectedValue(new Error('Update failed'));

      // Act & Assert
      await expect(liabilityService.updateLiability(mockUserId, liabilityId, updateData))
        .rejects.toThrow('Update failed');
    });

    it('should update liability type correctly', async () => {
      // Arrange
      const liabilityId = 'liability-to-update';
      const typeUpdate: Partial<LiabilityFormData> = {
        type: 'loan'
      };

      // Act
      await liabilityService.updateLiability(mockUserId, liabilityId, typeUpdate);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          type: 'loan'
        })
      );
    });
  });

  describe('Liabilities Deletion', () => {
    it('should successfully delete a liability', async () => {
      // Arrange
      const liabilityId = 'liability-to-delete';
      mockDeleteDoc.mockResolvedValue(undefined);

      // Act
      await liabilityService.deleteLiability(mockUserId, liabilityId);

      // Assert
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(), // db
        'users',
        mockUserId,
        'liabilities',
        liabilityId
      );
    });

    it('should handle liability deletion failure', async () => {
      // Arrange
      const liabilityId = 'liability-to-delete';
      mockDeleteDoc.mockRejectedValue(new Error('Delete failed'));

      // Act & Assert
      await expect(liabilityService.deleteLiability(mockUserId, liabilityId))
        .rejects.toThrow('Delete failed');
    });
  });

  describe('Real-time Liabilities Updates', () => {
    it('should successfully subscribe to liabilities updates', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const mockSnapshot = createMockLiabilitiesSnapshot(mockLiabilities);

      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = liabilityService.onLiabilitiesUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockOnSnapshot).toHaveBeenCalledWith(
        'mock-query-ref',
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'liability-1',
            name: 'Tarjeta de Crédito Visa',
            amount: 2500,
            type: 'credit_card'
          }),
          expect.objectContaining({
            id: 'liability-2',
            name: 'Préstamo Hipotecario',
            amount: 180000,
            type: 'loan'
          }),
          expect.objectContaining({
            id: 'liability-3',
            name: 'Tarjeta Mastercard',
            amount: 800,
            type: 'credit_card'
          })
        ])
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle empty liabilities list', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const emptySnapshot = createMockLiabilitiesSnapshot([]);

      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(emptySnapshot);
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = liabilityService.onLiabilitiesUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith([]);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle subscription without error callback', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockLiabilitiesSnapshot(mockLiabilities));
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = liabilityService.onLiabilitiesUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockOnSnapshot).toHaveBeenCalledWith(
        'mock-query-ref',
        expect.any(Function)
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('Debt Management and Calculations', () => {
    it('should handle large debt amounts', async () => {
      // Arrange
      const largeLiability: LiabilityFormData = {
        name: 'Business Loan',
        amount: 500000,
        type: 'loan'
      };

      // Act
      await liabilityService.addLiability(mockUserId, largeLiability);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          amount: 500000
        })
      );
    });

    it('should handle decimal debt amounts', async () => {
      // Arrange
      const decimalLiability: LiabilityFormData = {
        name: 'Credit Card Balance',
        amount: 1234.67,
        type: 'credit_card'
      };

      // Act
      await liabilityService.addLiability(mockUserId, decimalLiability);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          amount: 1234.67
        })
      );
    });

    it('should provide data for debt-to-income calculations', async () => {
      // Arrange
      const debtPortfolio: Liability[] = [
        { id: '1', name: 'Credit Card 1', amount: 3000, type: 'credit_card' },
        { id: '2', name: 'Auto Loan', amount: 15000, type: 'loan' },
        { id: '3', name: 'Credit Card 2', amount: 1500, type: 'credit_card' }
      ];

      const mockCallback = vi.fn();
      
      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockLiabilitiesSnapshot(debtPortfolio));
        return vi.fn();
      });

      // Act
      liabilityService.onLiabilitiesUpdate(mockUserId, mockCallback);

      // Assert
      const receivedLiabilities = mockCallback.mock.calls[0][0];
      const totalDebt = receivedLiabilities.reduce((sum: number, liability: Liability) => sum + liability.amount, 0);
      
      expect(totalDebt).toBe(19500);
      expect(receivedLiabilities).toHaveLength(3);
      
      // Verify debt types
      const creditCardDebt = receivedLiabilities
        .filter((l: Liability) => l.type === 'credit_card')
        .reduce((sum: number, l: Liability) => sum + l.amount, 0);
      const loanDebt = receivedLiabilities
        .filter((l: Liability) => l.type === 'loan')
        .reduce((sum: number, l: Liability) => sum + l.amount, 0);
      
      expect(creditCardDebt).toBe(4500);
      expect(loanDebt).toBe(15000);
    });
  });

  describe('Debt Portfolio Analysis', () => {
    it('should categorize different types of debt correctly', async () => {
      // Arrange
      const diversifiedDebt: Liability[] = [
        { id: '1', name: 'Visa Card', amount: 2000, type: 'credit_card' },
        { id: '2', name: 'MasterCard', amount: 1500, type: 'credit_card' },
        { id: '3', name: 'Mortgage', amount: 200000, type: 'loan' },
        { id: '4', name: 'Student Loan', amount: 30000, type: 'loan' }
      ];

      const mockCallback = vi.fn();
      
      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockLiabilitiesSnapshot(diversifiedDebt));
        return vi.fn();
      });

      // Act
      liabilityService.onLiabilitiesUpdate(mockUserId, mockCallback);

      // Assert
      const receivedLiabilities = mockCallback.mock.calls[0][0];
      
      // Calculate by type
      const creditCards = receivedLiabilities.filter((l: Liability) => l.type === 'credit_card');
      const loans = receivedLiabilities.filter((l: Liability) => l.type === 'loan');
      
      expect(creditCards).toHaveLength(2);
      expect(loans).toHaveLength(2);
      
      const totalCreditCardDebt = creditCards.reduce((sum: number, l: Liability) => sum + l.amount, 0);
      const totalLoanDebt = loans.reduce((sum: number, l: Liability) => sum + l.amount, 0);
      
      expect(totalCreditCardDebt).toBe(3500);
      expect(totalLoanDebt).toBe(230000);
    });

    it('should handle debt reduction scenarios', async () => {
      // Arrange
      const liabilityId = 'reducing-debt';
      const originalAmount = 5000;
      const reducedAmount = 3000;
      
      // Step 1: Add debt
      await liabilityService.addLiability(mockUserId, {
        name: 'Reducing Debt',
        amount: originalAmount,
        type: 'credit_card'
      });

      // Step 2: Reduce debt amount
      await liabilityService.updateLiability(mockUserId, liabilityId, {
        amount: reducedAmount
      });

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({ amount: originalAmount })
      );
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({ amount: reducedAmount })
      );
    });
  });

  describe('Multiple Liabilities Operations', () => {
    it('should handle multiple liabilities creation and updates', async () => {
      // Arrange
      const liabilitiesToCreate: LiabilityFormData[] = [
        { name: 'Debt 1', amount: 1000, type: 'credit_card' },
        { name: 'Debt 2', amount: 2000, type: 'loan' },
        { name: 'Debt 3', amount: 3000, type: 'credit_card' }
      ];

      // Act - Create multiple liabilities
      const results = await Promise.all(
        liabilitiesToCreate.map(liability => liabilityService.addLiability(mockUserId, liability))
      );

      // Act - Update all liabilities (reduce debt)
      const updatePromises = ['liability-1', 'liability-2', 'liability-3'].map((id, index) => 
        liabilityService.updateLiability(mockUserId, id, { amount: (index + 1) * 500 })
      );
      await Promise.all(updatePromises);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledTimes(3);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
      expect(results).toHaveLength(3);
      
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, 'mock-doc-ref', expect.objectContaining({
        amount: 500,
        lastUpdated: expect.any(Object)
      }));
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, 'mock-doc-ref', expect.objectContaining({
        amount: 1000,
        lastUpdated: expect.any(Object)
      }));
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(3, 'mock-doc-ref', expect.objectContaining({
        amount: 1500,
        lastUpdated: expect.any(Object)
      }));
    });

    it('should handle sequential liability deletion (debt payoff)', async () => {
      // Arrange
      const liabilityIds = ['liability-1', 'liability-2', 'liability-3'];
      mockDeleteDoc.mockResolvedValue(undefined);

      // Act
      for (const liabilityId of liabilityIds) {
        await liabilityService.deleteLiability(mockUserId, liabilityId);
      }

      // Assert
      expect(mockDeleteDoc).toHaveBeenCalledTimes(3);
      liabilityIds.forEach((liabilityId, index) => {
        expect(mockDoc).toHaveBeenNthCalledWith(
          index + 1,
          expect.anything(),
          'users',
          mockUserId,
          'liabilities',
          liabilityId
        );
      });
    });
  });

  describe('Service Integration and Workflow', () => {
    it('should demonstrate complete liability lifecycle', async () => {
      // Arrange
      const mockCallback = vi.fn();
      let operationCount = 0;

      // Step 1: Subscribe to empty liabilities list
      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        if (operationCount === 0) {
          callback(createMockLiabilitiesSnapshot([]));
        } else {
          // Simulate liability creation and updates
          const lifecycleLiability: Liability = {
            id: 'lifecycle-liability',
            name: 'Lifecycle Test Debt',
            amount: 8000,
            type: 'credit_card'
          };
          callback(createMockLiabilitiesSnapshot([lifecycleLiability]));
        }
        return vi.fn();
      });

      // Step 2: Start subscription
      const unsubscribe = liabilityService.onLiabilitiesUpdate(mockUserId, mockCallback);

      // Step 3: Add new liability
      operationCount++;
      await liabilityService.addLiability(mockUserId, {
        name: 'Lifecycle Test Debt',
        amount: 8000,
        type: 'credit_card'
      });

      // Step 4: Update liability (reduce debt)
      await liabilityService.updateLiability(mockUserId, 'lifecycle-liability', {
        amount: 6000,
        name: 'Reducing Debt'
      });

      // Step 5: Delete liability (paid off)
      await liabilityService.deleteLiability(mockUserId, 'lifecycle-liability');

      // Assert all operations
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          name: 'Lifecycle Test Debt',
          amount: 8000,
          type: 'credit_card'
        })
      );
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          amount: 6000,
          name: 'Reducing Debt'
        })
      );
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('Data Validation and Edge Cases', () => {
    it('should handle liabilities with special characters in names', async () => {
      // Arrange
      const specialCharLiability: LiabilityFormData = {
        name: 'Préstamo en €uros & Dólares (2024)',
        amount: 15000,
        type: 'loan'
      };

      // Act
      await liabilityService.addLiability(mockUserId, specialCharLiability);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          name: 'Préstamo en €uros & Dólares (2024)'
        })
      );
    });

    it('should handle long liability names', async () => {
      // Arrange
      const longNameLiability: LiabilityFormData = {
        name: 'This is a very long liability name that might be used to describe complex debt instruments or detailed loan descriptions with extensive information about terms and conditions',
        amount: 25000,
        type: 'loan'
      };

      // Act
      await liabilityService.addLiability(mockUserId, longNameLiability);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          name: longNameLiability.name
        })
      );
    });

    it('should handle all liability types correctly', async () => {
      // Arrange
      const allTypeLiabilities: LiabilityFormData[] = [
        { name: 'Credit Card Liability', amount: 2000, type: 'credit_card' },
        { name: 'Loan Liability', amount: 15000, type: 'loan' }
      ];

      // Act
      for (const liability of allTypeLiabilities) {
        await liabilityService.addLiability(mockUserId, liability);
      }

      // Assert
      expect(mockAddDoc).toHaveBeenCalledTimes(2);
      allTypeLiabilities.forEach((liability, index) => {
        expect(mockAddDoc).toHaveBeenNthCalledWith(
          index + 1,
          'mock-collection-ref',
          expect.objectContaining({
            type: liability.type
          })
        );
      });
    });

    it('should handle zero debt amounts (paid off debt)', async () => {
      // Arrange
      const paidOffLiability: LiabilityFormData = {
        name: 'Paid Off Debt',
        amount: 0,
        type: 'credit_card'
      };

      // Act
      await liabilityService.addLiability(mockUserId, paidOffLiability);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          amount: 0
        })
      );
    });
  });

  describe('Financial Calculations Integration', () => {
    it('should provide data for net worth calculations', async () => {
      // Arrange
      const totalLiabilities: Liability[] = [
        { id: '1', name: 'Credit Card', amount: 3000, type: 'credit_card' },
        { id: '2', name: 'Car Loan', amount: 20000, type: 'loan' },
        { id: '3', name: 'Student Loan', amount: 40000, type: 'loan' }
      ];

      const mockCallback = vi.fn();
      
      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockLiabilitiesSnapshot(totalLiabilities));
        return vi.fn();
      });

      // Act
      liabilityService.onLiabilitiesUpdate(mockUserId, mockCallback);

      // Assert
      const receivedLiabilities = mockCallback.mock.calls[0][0];
      const totalDebt = receivedLiabilities.reduce((sum: number, liability: Liability) => sum + liability.amount, 0);
      
      // This would be subtracted from total assets to get net worth
      expect(totalDebt).toBe(63000);
      expect(receivedLiabilities).toHaveLength(3);
    });

    it('should handle debt-free scenarios', async () => {
      // Arrange
      const mockCallback = vi.fn();
      
      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockLiabilitiesSnapshot([]));
        return vi.fn();
      });

      // Act
      liabilityService.onLiabilitiesUpdate(mockUserId, mockCallback);

      // Assert
      const receivedLiabilities = mockCallback.mock.calls[0][0];
      const totalDebt = receivedLiabilities.reduce((sum: number, liability: Liability) => sum + liability.amount, 0);
      
      expect(totalDebt).toBe(0);
      expect(receivedLiabilities).toHaveLength(0);
    });
  });
});
