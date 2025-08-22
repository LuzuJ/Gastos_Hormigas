import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assetService } from '../../services/financials/assetService';
import * as firebaseFirestore from 'firebase/firestore';
import type { Asset, AssetFormData } from '../../types';

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

// Helper function to create mock asset document
const createMockAssetDoc = (asset: Asset) => ({
  id: asset.id,
  data: () => ({
    name: asset.name,
    value: asset.value,
    type: asset.type
  })
});

// Helper function to create mock assets query snapshot
const createMockAssetsSnapshot = (assets: Asset[]) => ({
  docs: assets.map(asset => createMockAssetDoc(asset))
});

describe('Integration: Assets Management Flow', () => {
  const mockUserId = 'test-user-123';
  
  const mockAssets: Asset[] = [
    {
      id: 'asset-1',
      name: 'Cuenta de Ahorros',
      value: 5000,
      type: 'cash'
    },
    {
      id: 'asset-2', 
      name: 'Inversiones ETF',
      value: 12500,
      type: 'investment'
    },
    {
      id: 'asset-3',
      name: 'Casa',
      value: 250000,
      type: 'property'
    }
  ];

  const mockAssetFormData: AssetFormData = {
    name: 'Nuevo Activo',
    value: 10000,
    type: 'investment'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock referencias de Firestore
    mockDoc.mockReturnValue('mock-doc-ref');
    mockCollection.mockReturnValue('mock-collection-ref');
    mockQuery.mockReturnValue('mock-query-ref');
    
    // Mock respuestas por defecto
    mockAddDoc.mockResolvedValue({ id: 'new-asset-id' });
    mockDeleteDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);

    // Mock onSnapshot por defecto
    mockOnSnapshot.mockImplementation((queryRef, callback) => {
      callback(createMockAssetsSnapshot([]));
      return vi.fn(); // mock unsubscribe
    });
  });

  describe('Assets Creation', () => {
    it('should successfully add a new asset', async () => {
      // Arrange
      mockAddDoc.mockResolvedValue({ id: 'new-asset-id' });

      // Act
      const result = await assetService.addAsset(mockUserId, mockAssetFormData);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          ...mockAssetFormData,
          lastUpdated: expect.any(Object)
        })
      );
      expect(result).toEqual({ id: 'new-asset-id' });
    });

    it('should handle asset creation failure', async () => {
      // Arrange
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      // Act & Assert
      await expect(assetService.addAsset(mockUserId, mockAssetFormData))
        .rejects.toThrow('Firestore error');
    });

    it('should create different asset types correctly', async () => {
      // Arrange
      const assetTypes: AssetFormData[] = [
        { name: 'Efectivo', value: 1000, type: 'cash' },
        { name: 'Acciones', value: 5000, type: 'investment' },
        { name: 'Departamento', value: 150000, type: 'property' }
      ];

      // Act
      for (const asset of assetTypes) {
        await assetService.addAsset(mockUserId, asset);
      }

      // Assert
      expect(mockAddDoc).toHaveBeenCalledTimes(3);
      expect(mockAddDoc).toHaveBeenNthCalledWith(1, 'mock-collection-ref', 
        expect.objectContaining({ type: 'cash' }));
      expect(mockAddDoc).toHaveBeenNthCalledWith(2, 'mock-collection-ref', 
        expect.objectContaining({ type: 'investment' }));
      expect(mockAddDoc).toHaveBeenNthCalledWith(3, 'mock-collection-ref', 
        expect.objectContaining({ type: 'property' }));
    });
  });

  describe('Assets Updates', () => {
    it('should successfully update an asset', async () => {
      // Arrange
      const assetId = 'asset-to-update';
      const updateData: Partial<AssetFormData> = {
        value: 15000,
        name: 'Updated Asset Name'
      };
      
      mockUpdateDoc.mockResolvedValue(undefined);

      // Act
      await assetService.updateAsset(mockUserId, assetId, updateData);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', expect.objectContaining({
        ...updateData,
        lastUpdated: expect.any(Object)
      }));
      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(), // db
        'users',
        mockUserId,
        'assets',
        assetId
      );
    });

    it('should handle partial updates correctly', async () => {
      // Arrange
      const assetId = 'asset-to-update';
      const partialUpdate: Partial<AssetFormData> = {
        value: 8500
      };

      // Act
      await assetService.updateAsset(mockUserId, assetId, partialUpdate);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          value: 8500
        })
      );
    });

    it('should handle asset update failure', async () => {
      // Arrange
      const assetId = 'asset-to-update';
      const updateData: Partial<AssetFormData> = { value: 20000 };
      mockUpdateDoc.mockRejectedValue(new Error('Update failed'));

      // Act & Assert
      await expect(assetService.updateAsset(mockUserId, assetId, updateData))
        .rejects.toThrow('Update failed');
    });

    it('should update asset type correctly', async () => {
      // Arrange
      const assetId = 'asset-to-update';
      const typeUpdate: Partial<AssetFormData> = {
        type: 'property'
      };

      // Act
      await assetService.updateAsset(mockUserId, assetId, typeUpdate);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          type: 'property'
        })
      );
    });
  });

  describe('Assets Deletion', () => {
    it('should successfully delete an asset', async () => {
      // Arrange
      const assetId = 'asset-to-delete';
      mockDeleteDoc.mockResolvedValue(undefined);

      // Act
      await assetService.deleteAsset(mockUserId, assetId);

      // Assert
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(), // db
        'users',
        mockUserId,
        'assets',
        assetId
      );
    });

    it('should handle asset deletion failure', async () => {
      // Arrange
      const assetId = 'asset-to-delete';
      mockDeleteDoc.mockRejectedValue(new Error('Delete failed'));

      // Act & Assert
      await expect(assetService.deleteAsset(mockUserId, assetId))
        .rejects.toThrow('Delete failed');
    });
  });

  describe('Real-time Assets Updates', () => {
    it('should successfully subscribe to assets updates', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const mockSnapshot = createMockAssetsSnapshot(mockAssets);

      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = assetService.onAssetsUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockOnSnapshot).toHaveBeenCalledWith(
        'mock-query-ref',
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'asset-1',
            name: 'Cuenta de Ahorros',
            value: 5000,
            type: 'cash'
          }),
          expect.objectContaining({
            id: 'asset-2',
            name: 'Inversiones ETF',
            value: 12500,
            type: 'investment'
          }),
          expect.objectContaining({
            id: 'asset-3',
            name: 'Casa',
            value: 250000,
            type: 'property'
          })
        ])
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle empty assets list', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const emptySnapshot = createMockAssetsSnapshot([]);

      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(emptySnapshot);
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = assetService.onAssetsUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith([]);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle subscription without error callback', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockAssetsSnapshot(mockAssets));
        return mockUnsubscribe;
      });

      // Act
      const unsubscribe = assetService.onAssetsUpdate(mockUserId, mockCallback);

      // Assert
      expect(mockOnSnapshot).toHaveBeenCalledWith(
        'mock-query-ref',
        expect.any(Function)
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('Asset Value Management', () => {
    it('should handle large asset values', async () => {
      // Arrange
      const highValueAsset: AssetFormData = {
        name: 'Mansion',
        value: 1000000,
        type: 'property'
      };

      // Act
      await assetService.addAsset(mockUserId, highValueAsset);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          value: 1000000
        })
      );
    });

    it('should handle decimal asset values', async () => {
      // Arrange
      const decimalAsset: AssetFormData = {
        name: 'Crypto Portfolio',
        value: 1234.56,
        type: 'investment'
      };

      // Act
      await assetService.addAsset(mockUserId, decimalAsset);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          value: 1234.56
        })
      );
    });

    it('should handle zero value assets', async () => {
      // Arrange
      const zeroValueAsset: AssetFormData = {
        name: 'Depreciated Asset',
        value: 0,
        type: 'property'
      };

      // Act
      await assetService.addAsset(mockUserId, zeroValueAsset);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          value: 0
        })
      );
    });
  });

  describe('Asset Portfolio Calculations', () => {
    it('should provide data for net worth calculations', async () => {
      // Arrange
      const portfolioAssets: Asset[] = [
        { id: '1', name: 'Cash', value: 10000, type: 'cash' },
        { id: '2', name: 'Stocks', value: 25000, type: 'investment' },
        { id: '3', name: 'House', value: 300000, type: 'property' }
      ];

      const mockCallback = vi.fn();
      
      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockAssetsSnapshot(portfolioAssets));
        return vi.fn();
      });

      // Act
      assetService.onAssetsUpdate(mockUserId, mockCallback);

      // Assert
      const receivedAssets = mockCallback.mock.calls[0][0];
      const totalValue = receivedAssets.reduce((sum: number, asset: Asset) => sum + asset.value, 0);
      
      expect(totalValue).toBe(335000);
      expect(receivedAssets).toHaveLength(3);
      
      // Verify each asset type is present
      const assetTypes = receivedAssets.map((asset: Asset) => asset.type);
      expect(assetTypes).toContain('cash');
      expect(assetTypes).toContain('investment');
      expect(assetTypes).toContain('property');
    });

    it('should calculate portfolio diversity correctly', async () => {
      // Arrange
      const diversifiedAssets: Asset[] = [
        { id: '1', name: 'Savings', value: 5000, type: 'cash' },
        { id: '2', name: 'ETF', value: 15000, type: 'investment' },
        { id: '3', name: 'Stocks', value: 10000, type: 'investment' },
        { id: '4', name: 'Apartment', value: 200000, type: 'property' }
      ];

      const mockCallback = vi.fn();
      
      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        callback(createMockAssetsSnapshot(diversifiedAssets));
        return vi.fn();
      });

      // Act
      assetService.onAssetsUpdate(mockUserId, mockCallback);

      // Assert
      const receivedAssets = mockCallback.mock.calls[0][0];
      
      // Calculate by type
      const cashAssets = receivedAssets.filter((a: Asset) => a.type === 'cash');
      const investmentAssets = receivedAssets.filter((a: Asset) => a.type === 'investment');
      const propertyAssets = receivedAssets.filter((a: Asset) => a.type === 'property');
      
      expect(cashAssets).toHaveLength(1);
      expect(investmentAssets).toHaveLength(2);
      expect(propertyAssets).toHaveLength(1);
      
      const totalInvestments = investmentAssets.reduce((sum: number, asset: Asset) => sum + asset.value, 0);
      expect(totalInvestments).toBe(25000);
    });
  });

  describe('Multiple Assets Operations', () => {
    it('should handle multiple assets creation and updates', async () => {
      // Arrange
      const assetsToCreate: AssetFormData[] = [
        { name: 'Asset 1', value: 1000, type: 'cash' },
        { name: 'Asset 2', value: 2000, type: 'investment' },
        { name: 'Asset 3', value: 3000, type: 'property' }
      ];

      // Act - Create multiple assets
      const results = await Promise.all(
        assetsToCreate.map(asset => assetService.addAsset(mockUserId, asset))
      );

      // Act - Update all assets
      const updatePromises = ['asset-1', 'asset-2', 'asset-3'].map((id, index) => 
        assetService.updateAsset(mockUserId, id, { value: (index + 1) * 1500 })
      );
      await Promise.all(updatePromises);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledTimes(3);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
      expect(results).toHaveLength(3);
      
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, 'mock-doc-ref', expect.objectContaining({
        value: 1500,
        lastUpdated: expect.any(Object)
      }));
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, 'mock-doc-ref', expect.objectContaining({
        value: 3000,
        lastUpdated: expect.any(Object)
      }));
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(3, 'mock-doc-ref', expect.objectContaining({
        value: 4500,
        lastUpdated: expect.any(Object)
      }));
    });

    it('should handle sequential asset deletion', async () => {
      // Arrange
      const assetIds = ['asset-1', 'asset-2', 'asset-3'];
      mockDeleteDoc.mockResolvedValue(undefined);

      // Act
      for (const assetId of assetIds) {
        await assetService.deleteAsset(mockUserId, assetId);
      }

      // Assert
      expect(mockDeleteDoc).toHaveBeenCalledTimes(3);
      assetIds.forEach((assetId, index) => {
        expect(mockDoc).toHaveBeenNthCalledWith(
          index + 1,
          expect.anything(),
          'users',
          mockUserId,
          'assets',
          assetId
        );
      });
    });
  });

  describe('Service Integration and Workflow', () => {
    it('should demonstrate complete asset lifecycle', async () => {
      // Arrange
      const mockCallback = vi.fn();
      let operationCount = 0;

      // Step 1: Subscribe to empty assets list
      mockOnSnapshot.mockImplementation((queryRef, callback) => {
        if (operationCount === 0) {
          callback(createMockAssetsSnapshot([]));
        } else {
          // Simulate asset creation and updates
          const lifecycleAsset: Asset = {
            id: 'lifecycle-asset',
            name: 'Lifecycle Test Asset',
            value: 5000,
            type: 'investment'
          };
          callback(createMockAssetsSnapshot([lifecycleAsset]));
        }
        return vi.fn();
      });

      // Step 2: Start subscription
      const unsubscribe = assetService.onAssetsUpdate(mockUserId, mockCallback);

      // Step 3: Add new asset
      operationCount++;
      await assetService.addAsset(mockUserId, {
        name: 'Lifecycle Test Asset',
        value: 5000,
        type: 'investment'
      });

      // Step 4: Update asset
      await assetService.updateAsset(mockUserId, 'lifecycle-asset', {
        value: 7500,
        name: 'Updated Asset'
      });

      // Step 5: Delete asset
      await assetService.deleteAsset(mockUserId, 'lifecycle-asset');

      // Assert all operations
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          name: 'Lifecycle Test Asset',
          value: 5000,
          type: 'investment'
        })
      );
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          value: 7500,
          name: 'Updated Asset'
        })
      );
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('Data Validation and Edge Cases', () => {
    it('should handle assets with special characters in names', async () => {
      // Arrange
      const specialCharAsset: AssetFormData = {
        name: 'Inversión en €uros & Dólares (2024)',
        value: 5000,
        type: 'investment'
      };

      // Act
      await assetService.addAsset(mockUserId, specialCharAsset);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          name: 'Inversión en €uros & Dólares (2024)'
        })
      );
    });

    it('should handle long asset names', async () => {
      // Arrange
      const longNameAsset: AssetFormData = {
        name: 'This is a very long asset name that might be used to describe complex investment portfolios or property descriptions with extensive details',
        value: 15000,
        type: 'investment'
      };

      // Act
      await assetService.addAsset(mockUserId, longNameAsset);

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          name: longNameAsset.name
        })
      );
    });

    it('should handle all asset types correctly', async () => {
      // Arrange
      const allTypeAssets: AssetFormData[] = [
        { name: 'Cash Asset', value: 1000, type: 'cash' },
        { name: 'Investment Asset', value: 2000, type: 'investment' },
        { name: 'Property Asset', value: 3000, type: 'property' }
      ];

      // Act
      for (const asset of allTypeAssets) {
        await assetService.addAsset(mockUserId, asset);
      }

      // Assert
      expect(mockAddDoc).toHaveBeenCalledTimes(3);
      allTypeAssets.forEach((asset, index) => {
        expect(mockAddDoc).toHaveBeenNthCalledWith(
          index + 1,
          'mock-collection-ref',
          expect.objectContaining({
            type: asset.type
          })
        );
      });
    });
  });
});
