import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assetService } from './assetService';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query
} from 'firebase/firestore';
import type { AssetFormData } from '../types';

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
  };
});

// Mock del config de Firebase
vi.mock('../config/firebase', () => ({
  db: { type: 'firestore' }
}));

describe('assetService', () => {
  const userId = 'test-user-123';
  
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('onAssetsUpdate', () => {
    it('debería configurar el listener con la colección correcta', () => {
      const callback = vi.fn();
      
      assetService.onAssetsUpdate(userId, callback);

      expect(collection).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId,
        'assets'
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
            data: () => ({ name: 'Cuenta Ahorros', value: 5000, type: 'cash' }),
            id: 'asset-1'
          },
          {
            data: () => ({ name: 'Inversiones', value: 10000, type: 'investment' }),
            id: 'asset-2'
          }
        ]
      };

      // Mock de onSnapshot que ejecuta el callback inmediatamente
      vi.mocked(onSnapshot).mockImplementation((queryRef: any, snapshotCallback: any) => {
        // Ejecutamos el callback con nuestros datos mock
        snapshotCallback(mockSnapshot);
        // Retornamos una función unsubscribe mock
        return vi.fn();
      });

      assetService.onAssetsUpdate(userId, callback);

      expect(callback).toHaveBeenCalledWith([
        { id: 'asset-1', name: 'Cuenta Ahorros', value: 5000, type: 'cash' },
        { id: 'asset-2', name: 'Inversiones', value: 10000, type: 'investment' }
      ]);
    });

    it('debería retornar una función unsubscribe', () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();
      
      vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe);

      const unsubscribe = assetService.onAssetsUpdate(userId, callback);

      expect(unsubscribe).toBe(mockUnsubscribe);
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('addAsset', () => {
    it('debería agregar un activo correctamente', async () => {
      const assetData: AssetFormData = {
        name: 'Nuevo Activo',
        value: 7500,
        type: 'property'
      };

      await assetService.addAsset(userId, assetData);

      expect(collection).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId,
        'assets'
      );
      expect(addDoc).toHaveBeenCalledWith(
        { path: 'mock/collection' },
        assetData
      );
    });
  });

  describe('updateAsset', () => {
    it('debería actualizar un activo correctamente', async () => {
      const assetId = 'asset-123';
      const updateData = { value: 8000 };

      await assetService.updateAsset(userId, assetId, updateData);

      expect(doc).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId,
        'assets',
        assetId
      );
      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-id' },
        updateData
      );
    });

    it('debería permitir actualizar múltiples campos', async () => {
      const assetId = 'asset-456';
      const updateData = { 
        name: 'Activo Actualizado',
        value: 12000,
        type: 'investment' as const
      };

      await assetService.updateAsset(userId, assetId, updateData);

      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-id' },
        updateData
      );
    });
  });

  describe('deleteAsset', () => {
    it('debería eliminar un activo correctamente', async () => {
      const assetId = 'asset-to-delete';

      await assetService.deleteAsset(userId, assetId);

      expect(doc).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId,
        'assets',
        assetId
      );
      expect(deleteDoc).toHaveBeenCalledWith({ id: 'mock-doc-id' });
    });
  });
});
