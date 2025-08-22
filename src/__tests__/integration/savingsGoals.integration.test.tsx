import { describe, it, expect, vi, beforeEach } from 'vitest';
import { savingsGoalService } from '../../services/savings/savingsGoalService';
import * as firebaseFirestore from 'firebase/firestore';
import type { SavingsGoal, SavingsGoalFormData } from '../../types';

// Mock de las funciones de Firestore
const mockAddDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockDoc = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockOnSnapshot = vi.fn();
const mockServerTimestamp = vi.fn();

// Mock Firestore functions
vi.mocked(firebaseFirestore.addDoc).mockImplementation(mockAddDoc);
vi.mocked(firebaseFirestore.deleteDoc).mockImplementation(mockDeleteDoc);
vi.mocked(firebaseFirestore.doc).mockImplementation(mockDoc);
vi.mocked(firebaseFirestore.collection).mockImplementation(mockCollection);
vi.mocked(firebaseFirestore.query).mockImplementation(mockQuery);
vi.mocked(firebaseFirestore.onSnapshot).mockImplementation(mockOnSnapshot);
vi.mocked(firebaseFirestore.serverTimestamp).mockImplementation(mockServerTimestamp);

// Helper function to create mock savings goal document
const createMockSavingsGoalDoc = (goal: SavingsGoal) => ({
  id: goal.id,
  data: () => ({
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount
  })
});

// Helper function to create mock savings goals query snapshot
const createMockSavingsGoalsSnapshot = (goals: SavingsGoal[]) => ({
  docs: goals.map(goal => createMockSavingsGoalDoc(goal))
});

// Componente de prueba para el contexto de metas de ahorro
const TestSavingsGoalsComponent = ({ userId }: { userId: string }) => {
  return (
    <div data-testid="savings-goals-content">
      <span data-testid="user-id">{userId}</span>
    </div>
  );
};

describe('Integration: Savings Goals Management Flow', () => {
  const mockUserId = 'test-user-123';
  
  const mockSavingsGoals: SavingsGoal[] = [
    {
      id: 'goal-1',
      name: 'Vacaciones',
      targetAmount: 2000,
      currentAmount: 500
    },
    {
      id: 'goal-2', 
      name: 'Fondo de emergencia',
      targetAmount: 5000,
      currentAmount: 1200
    }
  ];

  const mockFormData: SavingsGoalFormData = {
    name: 'Nueva Meta',
    targetAmount: 1000
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock referencias de Firestore
    mockDoc.mockReturnValue('mock-doc-ref');
    mockCollection.mockReturnValue('mock-collection-ref');
    mockQuery.mockReturnValue('mock-query-ref');
    
    // Mock respuestas por defecto
    mockAddDoc.mockResolvedValue({ id: 'new-goal-id' });
    mockDeleteDoc.mockResolvedValue(undefined);
    mockServerTimestamp.mockReturnValue('mock-timestamp');

    // Mock onSnapshot por defecto
    mockOnSnapshot.mockImplementation((queryRef, callback, errorCallback) => {
      callback(createMockSavingsGoalsSnapshot([]));
      return vi.fn(); // mock unsubscribe
    });
  });

  describe('Savings Goals Creation', () => {
    it('should successfully add a new savings goal', async () => {
      // Arrange
      const expectedGoalData = {
        ...mockFormData,
        currentAmount: 0,
        createdAt: 'mock-timestamp'
      };
      
      mockAddDoc.mockResolvedValue({ id: 'new-goal-id' });

      // Act
      const result = await savingsGoalService.addSavingsGoal(mockUserId, mockFormData);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expectedGoalData
      );
      expect(result).toEqual({ id: 'new-goal-id' });
    });

    it('should handle savings goal creation failure', async () => {
      // Arrange
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      // Act & Assert
      await expect(savingsGoalService.addSavingsGoal(mockUserId, mockFormData))
        .rejects.toThrow('Firestore error');
    });

    it('should create goal with correct initial values', async () => {
      // Arrange
      const goalData: SavingsGoalFormData = {
        name: 'Test Goal',
        targetAmount: 2500
      };

      // Act
      await savingsGoalService.addSavingsGoal(mockUserId, goalData);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          name: 'Test Goal',
          targetAmount: 2500,
          currentAmount: 0,
          createdAt: 'mock-timestamp'
        })
      );
    });
  });

  describe('Savings Goals Deletion', () => {
    it('should successfully delete a savings goal', async () => {
      // Arrange
      const goalId = 'goal-to-delete';
      mockDeleteDoc.mockResolvedValue(undefined);

      // Act
      await savingsGoalService.deleteSavingsGoal(mockUserId, goalId);

      // Assert
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(), // db
        'users',
        mockUserId,
        'savingsGoals',
        goalId
      );
    });

    it('should handle savings goal deletion failure', async () => {
      // Arrange
      const goalId = 'goal-to-delete';
      mockDeleteDoc.mockRejectedValue(new Error('Delete failed'));

      // Act & Assert
      await expect(savingsGoalService.deleteSavingsGoal(mockUserId, goalId))
        .rejects.toThrow('Delete failed');
    });
  });

  describe('Real-time Savings Goals Updates', () => {
    it('should successfully subscribe to savings goals updates', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const mockSnapshot = createMockSavingsGoalsSnapshot(mockSavingsGoals);

      mockOnSnapshot.mockImplementation((queryRef, callback, errorCallback) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = savingsGoalService.onSavingsGoalsUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockOnSnapshot).toHaveBeenCalledWith(
        'mock-query-ref',
        expect.any(Function),
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'goal-1',
            name: 'Vacaciones',
            targetAmount: 2000,
            currentAmount: 500
          }),
          expect.objectContaining({
            id: 'goal-2',
            name: 'Fondo de emergencia',
            targetAmount: 5000,
            currentAmount: 1200
          })
        ])
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle empty savings goals list', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const emptySnapshot = createMockSavingsGoalsSnapshot([]);

      mockOnSnapshot.mockImplementation((queryRef, callback, errorCallback) => {
        callback(emptySnapshot);
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = savingsGoalService.onSavingsGoalsUpdate(mockUserId, mockCallback);

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
      const unsubscribe = savingsGoalService.onSavingsGoalsUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith([], expect.objectContaining({
        message: 'Subscription error'
      }));
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('Multiple Savings Goals Management', () => {
    it('should handle multiple goals creation and subscription', async () => {
      // Arrange
      const goalsToCreate: SavingsGoalFormData[] = [
        { name: 'Goal 1', targetAmount: 1000 },
        { name: 'Goal 2', targetAmount: 2000 },
        { name: 'Goal 3', targetAmount: 3000 }
      ];

      const mockCallback = vi.fn();
      let callCount = 0;

      mockAddDoc.mockImplementation(() => {
        callCount++;
        return Promise.resolve({ id: `goal-${callCount}` });
      });

      // Act - Create multiple goals
      const results = await Promise.all(
        goalsToCreate.map(goal => savingsGoalService.addSavingsGoal(mockUserId, goal))
      );

      // Setup subscription with all created goals
      const allGoals: SavingsGoal[] = goalsToCreate.map((goal, index) => ({
        id: `goal-${index + 1}`,
        ...goal,
        currentAmount: 0
      }));

      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockSavingsGoalsSnapshot(allGoals));
        return vi.fn();
      });

      savingsGoalService.onSavingsGoalsUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledTimes(3);
      expect(results).toHaveLength(3);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Goal 1', targetAmount: 1000 }),
          expect.objectContaining({ name: 'Goal 2', targetAmount: 2000 }),
          expect.objectContaining({ name: 'Goal 3', targetAmount: 3000 })
        ])
      );
    });

    it('should handle sequential goal deletion', async () => {
      // Arrange
      const goalIds = ['goal-1', 'goal-2', 'goal-3'];
      mockDeleteDoc.mockResolvedValue(undefined);

      // Act
      for (const goalId of goalIds) {
        await savingsGoalService.deleteSavingsGoal(mockUserId, goalId);
      }

      // Assert
      expect(mockDeleteDoc).toHaveBeenCalledTimes(3);
      goalIds.forEach((goalId, index) => {
        expect(mockDoc).toHaveBeenNthCalledWith(
          index + 1,
          expect.anything(),
          'users',
          mockUserId,
          'savingsGoals',
          goalId
        );
      });
    });
  });

  describe('Savings Goals Progress Tracking', () => {
    it('should track progress for different goal amounts', async () => {
      // Arrange
      const progressGoals: SavingsGoal[] = [
        { id: 'g1', name: 'Short term', targetAmount: 500, currentAmount: 250 }, // 50%
        { id: 'g2', name: 'Medium term', targetAmount: 2000, currentAmount: 600 }, // 30%
        { id: 'g3', name: 'Long term', targetAmount: 10000, currentAmount: 8500 }, // 85%
        { id: 'g4', name: 'Completed', targetAmount: 1000, currentAmount: 1000 } // 100%
      ];

      const mockCallback = vi.fn();

      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockSavingsGoalsSnapshot(progressGoals));
        return vi.fn();
      });

      // Act
      savingsGoalService.onSavingsGoalsUpdate(mockUserId, mockCallback);

      // Assert
      const receivedGoals = mockCallback.mock.calls[0][0];
      
      // Verify different progress levels
      const shortTermGoal = receivedGoals.find((g: SavingsGoal) => g.name === 'Short term');
      const mediumTermGoal = receivedGoals.find((g: SavingsGoal) => g.name === 'Medium term');
      const longTermGoal = receivedGoals.find((g: SavingsGoal) => g.name === 'Long term');
      const completedGoal = receivedGoals.find((g: SavingsGoal) => g.name === 'Completed');

      expect(shortTermGoal.currentAmount / shortTermGoal.targetAmount).toBe(0.5);
      expect(mediumTermGoal.currentAmount / mediumTermGoal.targetAmount).toBe(0.3);
      expect(longTermGoal.currentAmount / longTermGoal.targetAmount).toBe(0.85);
      expect(completedGoal.currentAmount / completedGoal.targetAmount).toBe(1.0);
    });

    it('should handle goals with zero current amount', async () => {
      // Arrange
      const newGoals: SavingsGoal[] = [
        { id: 'new1', name: 'New Goal 1', targetAmount: 1000, currentAmount: 0 },
        { id: 'new2', name: 'New Goal 2', targetAmount: 5000, currentAmount: 0 }
      ];

      const mockCallback = vi.fn();

      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockSavingsGoalsSnapshot(newGoals));
        return vi.fn();
      });

      // Act
      savingsGoalService.onSavingsGoalsUpdate(mockUserId, mockCallback);

      // Assert
      const receivedGoals = mockCallback.mock.calls[0][0];
      
      receivedGoals.forEach((goal: SavingsGoal) => {
        expect(goal.currentAmount).toBe(0);
        expect(goal.currentAmount / goal.targetAmount).toBe(0);
      });
    });
  });

  describe('Data Validation and Edge Cases', () => {
    it('should handle very large target amounts', async () => {
      // Arrange
      const largeAmountGoal: SavingsGoalFormData = {
        name: 'House down payment',
        targetAmount: 100000
      };

      // Act
      await savingsGoalService.addSavingsGoal(mockUserId, largeAmountGoal);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          targetAmount: 100000
        })
      );
    });

    it('should handle goals with decimal amounts', async () => {
      // Arrange
      const decimalGoal: SavingsGoalFormData = {
        name: 'Precise goal',
        targetAmount: 1234.56
      };

      // Act
      await savingsGoalService.addSavingsGoal(mockUserId, decimalGoal);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          targetAmount: 1234.56
        })
      );
    });

    it('should handle goals with special characters in names', async () => {
      // Arrange
      const specialCharGoal: SavingsGoalFormData = {
        name: 'Viaje a España & Francia (2024)',
        targetAmount: 3000
      };

      // Act
      await savingsGoalService.addSavingsGoal(mockUserId, specialCharGoal);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          name: 'Viaje a España & Francia (2024)'
        })
      );
    });
  });

  describe('Service Integration and Workflow', () => {
    it('should demonstrate complete goal lifecycle', async () => {
      // Arrange
      const mockCallback = vi.fn();
      let goalCount = 0;

      // Step 1: Subscribe to empty goals list
      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        if (goalCount === 0) {
          callback(createMockSavingsGoalsSnapshot([]));
        } else {
          // Simulate goal creation
          const newGoals: SavingsGoal[] = [
            { id: 'lifecycle-goal', name: 'Lifecycle Test', targetAmount: 1500, currentAmount: 0 }
          ];
          callback(createMockSavingsGoalsSnapshot(newGoals));
        }
        return vi.fn();
      });

      // Step 2: Start subscription
      const unsubscribe = savingsGoalService.onSavingsGoalsUpdate(mockUserId, mockCallback);

      // Step 3: Add a new goal
      goalCount++;
      await savingsGoalService.addSavingsGoal(mockUserId, {
        name: 'Lifecycle Test',
        targetAmount: 1500
      });

      // Step 4: Simulate subscription update
      mockCallback.mockClear();
      mockOnSnapshot.mock.calls[0][1](createMockSavingsGoalsSnapshot([
        { id: 'lifecycle-goal', name: 'Lifecycle Test', targetAmount: 1500, currentAmount: 0 }
      ]));

      // Step 5: Delete the goal
      await savingsGoalService.deleteSavingsGoal(mockUserId, 'lifecycle-goal');

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          name: 'Lifecycle Test',
          targetAmount: 1500,
          currentAmount: 0
        })
      );
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(mockCallback).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'lifecycle-goal',
          name: 'Lifecycle Test'
        })
      ]);
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
