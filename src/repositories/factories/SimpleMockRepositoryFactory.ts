import { vi } from 'vitest';
import type { IRepositoryFactory } from '../interfaces';

/**
 * Mock Factory para pruebas
 * Utilizar solo como ejemplo de mocking en tests
 */
export class MockRepositoryFactory implements IRepositoryFactory {
  getUserRepository() {
    return {
      getById: vi.fn().mockResolvedValue(null),
      getAll: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue(true),
      getUserProfile: vi.fn().mockResolvedValue(null),
      createUserProfile: vi.fn().mockResolvedValue(true)
    };
  }
  
  getCategoryRepository() {
    return {
      getById: vi.fn().mockResolvedValue(null),
      getAll: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue(true),
      initializeDefaultCategories: vi.fn().mockResolvedValue(true),
      getCategoriesWithSubcategories: vi.fn().mockResolvedValue([]),
      addSubcategory: vi.fn().mockResolvedValue({}),
      deleteSubcategory: vi.fn().mockResolvedValue(true),
      updateSubcategory: vi.fn().mockResolvedValue({}),
      subscribeToCategories: vi.fn().mockReturnValue(() => {})
    };
  }
  
  getExpenseRepository(): any {
    throw new Error('No implementado para pruebas');
  }
  
  getFixedExpenseRepository(): any {
    throw new Error('No implementado para pruebas');
  }
  
  getFinancialsRepository(): any {
    throw new Error('No implementado para pruebas');
  }
  
  getSavingsGoalRepository(): any {
    throw new Error('No implementado para pruebas');
  }
  
  getAssetRepository(): any {
    throw new Error('No implementado para pruebas');
  }
  
  getLiabilityRepository(): any {
    throw new Error('No implementado para pruebas');
  }
  
  getPaymentSourceRepository(): any {
    throw new Error('No implementado para pruebas');
  }
  
  getUserStatsRepository(): any {
    throw new Error('No implementado para pruebas');
  }
}

/**
 * Ejemplo de uso en una prueba:
 * 
 * ```typescript
 * import { MockRepositoryFactory } from '../repositories/factories/MockRepositoryFactory';
 * import { userService } from '../services/profile/userService';
 * 
 * // Sobrescribir la fábrica real con la fábrica mock
 * vi.mock('../repositories', () => {
 *   return {
 *     repositoryFactory: new MockRepositoryFactory()
 *   };
 * });
 * 
 * describe('userService', () => {
 *   it('debería obtener el perfil de un usuario', async () => {
 *     // Configurar el comportamiento del mock
 *     const mockProfile = { displayName: 'Test User', email: 'test@example.com', currency: 'USD' };
 *     const mockFactory = vi.mocked(repositoryFactory);
 *     mockFactory.getUserRepository().getUserProfile.mockResolvedValue(mockProfile);
 *     
 *     // Ejecutar la función que queremos probar
 *     const result = await userService.getUserProfile('user-123');
 *     
 *     // Verificar el resultado
 *     expect(result).toEqual(mockProfile);
 *     expect(mockFactory.getUserRepository().getUserProfile).toHaveBeenCalledWith('user-123');
 *   });
 * });
 * ```
 */
