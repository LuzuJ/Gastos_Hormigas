import { describe, it, expect, vi, beforeEach } from 'vitest';
import { savingsGoalService } from './index';
import { 
  collection, 
  addDoc, 
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp
} from 'firebase/firestore';
import type { SavingsGoalFormData } from '../../types';

// Mock de Firebase Firestore
vi.mock('firebase/firestore', () => {
  const collectionRef = { path: 'mock/collection' };
  const docRef = { id: 'mock-doc-id' };

  return {
    getFirestore: vi.fn(),
    collection: vi.fn(() => collectionRef),
    doc: vi.fn(() => docRef),
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn(),
    query: vi.fn(() => ({ type: 'query' })),
    serverTimestamp: vi.fn(() => 'MOCK_SERVER_TIMESTAMP'),
  };
});

// Mock del config de Firebase
vi.mock('../../config/firebase', () => ({
  db: { type: 'firestore' }
}));

describe('savingsGoalService', () => {
  const userId = 'test-user-123';
  
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('onSavingsGoalsUpdate', () => {
    it('debería configurar el listener con la colección correcta', () => {
      const callback = vi.fn();
      
      savingsGoalService.onSavingsGoalsUpdate(userId, callback);

      expect(collection).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId,
        'savingsGoals'
      );
      expect(query).toHaveBeenCalledWith({ path: 'mock/collection' });
      expect(onSnapshot).toHaveBeenCalledWith(
        { type: 'query' },
        expect.any(Function),
        expect.any(Function) // Error handler
      );
    });

    it('debería procesar los datos del snapshot correctamente', () => {
      const callback = vi.fn();
      const mockSnapshot = {
        docs: [
          {
            data: () => ({ name: 'Vacaciones', targetAmount: 2000, currentAmount: 500 }),
            id: 'goal-1'
          },
          {
            data: () => ({ name: 'Auto Nuevo', targetAmount: 25000, currentAmount: 8000 }),
            id: 'goal-2'
          }
        ]
      };

      // Mock de onSnapshot que ejecuta el callback inmediatamente
      vi.mocked(onSnapshot).mockImplementation((queryRef: any, successCallback: any, errorCallback: any) => {
        successCallback(mockSnapshot);
        return vi.fn();
      });

      savingsGoalService.onSavingsGoalsUpdate(userId, callback);

      expect(callback).toHaveBeenCalledWith([
        { id: 'goal-1', name: 'Vacaciones', targetAmount: 2000, currentAmount: 500 },
        { id: 'goal-2', name: 'Auto Nuevo', targetAmount: 25000, currentAmount: 8000 }
      ]);
    });

    it('debería manejar errores correctamente', () => {
      const callback = vi.fn();
      const error = new Error('Firestore error');

      // Mock de onSnapshot que ejecuta el error callback
      vi.mocked(onSnapshot).mockImplementation((queryRef: any, successCallback: any, errorCallback: any) => {
        errorCallback(error);
        return vi.fn();
      });

      savingsGoalService.onSavingsGoalsUpdate(userId, callback);

      expect(callback).toHaveBeenCalledWith([], error);
    });

    it('debería retornar una función unsubscribe', () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();
      
      vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe);

      const unsubscribe = savingsGoalService.onSavingsGoalsUpdate(userId, callback);

      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('addSavingsGoal', () => {
    it('debería agregar una meta de ahorro correctamente', async () => {
      const goalData: SavingsGoalFormData = {
        name: 'Vacaciones de Verano',
        targetAmount: 2000
      };

      await savingsGoalService.addSavingsGoal(userId, goalData);

      expect(collection).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId,
        'savingsGoals'
      );
      expect(addDoc).toHaveBeenCalledWith(
        { path: 'mock/collection' },
        {
          ...goalData,
          currentAmount: 0,
          createdAt: 'MOCK_SERVER_TIMESTAMP'
        }
      );
      expect(serverTimestamp).toHaveBeenCalled();
    });

    it('debería incluir currentAmount inicial en 0', async () => {
      const goalData: SavingsGoalFormData = {
        name: 'Fondo de Emergencia',
        targetAmount: 5000
      };

      await savingsGoalService.addSavingsGoal(userId, goalData);

      expect(addDoc).toHaveBeenCalledWith(
        { path: 'mock/collection' },
        expect.objectContaining({
          currentAmount: 0
        })
      );
    });

    it('debería incluir timestamp de creación', async () => {
      const goalData: SavingsGoalFormData = {
        name: 'Nuevo Auto',
        targetAmount: 25000
      };

      await savingsGoalService.addSavingsGoal(userId, goalData);

      expect(addDoc).toHaveBeenCalledWith(
        { path: 'mock/collection' },
        expect.objectContaining({
          createdAt: 'MOCK_SERVER_TIMESTAMP'
        })
      );
    });
  });

  describe('deleteSavingsGoal', () => {
    it('debería eliminar una meta de ahorro correctamente', async () => {
      const goalId = 'goal-to-delete';

      await savingsGoalService.deleteSavingsGoal(userId, goalId);

      expect(doc).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId,
        'savingsGoals',
        goalId
      );
      expect(deleteDoc).toHaveBeenCalledWith({ id: 'mock-doc-id' });
    });
  });
});
