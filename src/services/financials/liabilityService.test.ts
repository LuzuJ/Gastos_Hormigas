import { describe, it, expect, vi, beforeEach } from 'vitest';
import { liabilityService } from './index';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query
} from 'firebase/firestore';
import type { LiabilityFormData } from '../../types';

// Mock de Firebase Firestore
vi.mock('firebase/firestore', () => {
  const collectionRef = { path: 'mock/collection' };
  const docRef = { id: 'mock-doc-id' };

  return {
    getFirestore: vi.fn(),
    collection: vi.fn(() => collectionRef),
    doc: vi.fn(() => docRef),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn(),
    query: vi.fn(() => ({ type: 'query' })),
    Timestamp: {
      now: vi.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
      fromDate: vi.fn((date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })),
    },
  };
});

// Mock del config de Firebase
vi.mock('../../config/firebase', () => ({
  db: { type: 'firestore' }
}));

describe('liabilityService', () => {
  const userId = 'test-user-123';
  
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('onLiabilitiesUpdate', () => {
    it('debería configurar el listener con la colección correcta', () => {
      const callback = vi.fn();
      
      liabilityService.onLiabilitiesUpdate(userId, callback);

      expect(collection).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId,
        'liabilities'
      );
      expect(query).toHaveBeenCalledWith({ path: 'mock/collection' });
      expect(onSnapshot).toHaveBeenCalledWith(
        { type: 'query' },
        expect.any(Function)
      );
    });

    it('debería procesar los datos del snapshot correctamente', () => {
      const callback = vi.fn();
      const mockSnapshot = {
        docs: [
          {
            data: () => ({ name: 'Préstamo Auto', amount: 15000, type: 'loan' }),
            id: 'liability-1'
          },
          {
            data: () => ({ name: 'Tarjeta Crédito', amount: 3500, type: 'credit_card' }),
            id: 'liability-2'
          }
        ]
      };

      // Mock de onSnapshot que ejecuta el callback inmediatamente
      vi.mocked(onSnapshot).mockImplementation((queryRef: any, snapshotCallback: any) => {
        snapshotCallback(mockSnapshot);
        return vi.fn();
      });

      liabilityService.onLiabilitiesUpdate(userId, callback);

      expect(callback).toHaveBeenCalledWith([
        { id: 'liability-1', name: 'Préstamo Auto', amount: 15000, type: 'loan' },
        { id: 'liability-2', name: 'Tarjeta Crédito', amount: 3500, type: 'credit_card' }
      ]);
    });

    it('debería retornar una función unsubscribe', () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();
      
      vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe);

      const unsubscribe = liabilityService.onLiabilitiesUpdate(userId, callback);

      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('addLiability', () => {
    it('debería agregar un pasivo correctamente', async () => {
      const liabilityData: LiabilityFormData = {
        name: 'Préstamo Estudiantil',
        amount: 15000,
        type: 'loan'
      };

      await liabilityService.addLiability(userId, liabilityData);

      expect(collection).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId,
        'liabilities'
      );
      expect(addDoc).toHaveBeenCalledWith(
        { path: 'mock/collection' },
        expect.objectContaining(liabilityData)
      );
    });

    it('debería permitir agregar diferentes tipos de pasivos', async () => {
      const creditCardData: LiabilityFormData = {
        name: 'Tarjeta de Crédito',
        amount: 3500,
        type: 'credit_card'
      };

      await liabilityService.addLiability(userId, creditCardData);

      expect(addDoc).toHaveBeenCalledWith(
        { path: 'mock/collection' },
        expect.objectContaining(creditCardData)
      );
    });
  });

  describe('updateLiability', () => {
    it('debería actualizar un pasivo correctamente', async () => {
      const liabilityId = 'liability-123';
      const updateData = { amount: 12000 };

      await liabilityService.updateLiability(userId, liabilityId, updateData);

      expect(doc).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId,
        'liabilities',
        liabilityId
      );
      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-id' },
        expect.objectContaining(updateData)
      );
    });

    it('debería permitir actualizar múltiples campos', async () => {
      const liabilityId = 'liability-456';
      const updateData = { 
        name: 'Pasivo Actualizado',
        amount: 8500,
        type: 'credit_card' as const
      };

      await liabilityService.updateLiability(userId, liabilityId, updateData);

      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-id' },
        expect.objectContaining(updateData)
      );
    });
  });

  describe('deleteLiability', () => {
    it('debería eliminar un pasivo correctamente', async () => {
      const liabilityId = 'liability-to-delete';

      await liabilityService.deleteLiability(userId, liabilityId);

      expect(doc).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId,
        'liabilities',
        liabilityId
      );
      expect(deleteDoc).toHaveBeenCalledWith({ id: 'mock-doc-id' });
    });
  });
});
