import { vi } from 'vitest';
import type { 
  IUserRepository, 
  ICategoryRepository,
  IRepositoryFactory
} from '../interfaces';
import type { UserProfile, Category, SubCategory } from '../../types';

/**
 * Esta clase crea mocks de repositorios para pruebas
 * Facilita la creación de implementaciones simuladas para pruebas unitarias
 */
export class MockRepositoryFactory implements IRepositoryFactory {
  private readonly userRepository: IUserRepository;
  private readonly categoryRepository: ICategoryRepository;
  
  constructor() {
    // Crear mocks para cada repositorio utilizando funciones mockeadas con vitest
    
    // Repositorio de usuarios
    const mockUserRepository = {
      getById: vi.fn().mockResolvedValue(null),
      getAll: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(async (userId, data) => ({ ...data, id: 'mock-id' })),
      update: vi.fn().mockImplementation(async (userId, id, data) => ({ id, ...data })),
      delete: vi.fn().mockResolvedValue(true),
      getUserProfile: vi.fn().mockResolvedValue(null),
      createUserProfile: vi.fn().mockResolvedValue(true)
    };
    
    // Repositorio de categorías
    const mockCategoryRepository = {
      getById: vi.fn().mockResolvedValue(null),
      getAll: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(async (userId, data) => ({ ...data, id: 'mock-category-id' })),
      update: vi.fn().mockImplementation(async (userId, id, data) => ({ id, ...data })),
      delete: vi.fn().mockResolvedValue(true),
      initializeDefaultCategories: vi.fn().mockResolvedValue(true),
      getCategoriesWithSubcategories: vi.fn().mockResolvedValue([]),
      addSubcategory: vi.fn().mockImplementation(async (userId, categoryId, name) => ({ id: 'mock-subcategory-id', name })),
      deleteSubcategory: vi.fn().mockResolvedValue(true),
      updateSubcategory: vi.fn().mockImplementation(async (userId, categoryId, subCategoryId, name) => ({ id: subCategoryId, name })),
      subscribeToCategories: vi.fn().mockImplementation(() => () => {})
    };
    
    this.userRepository = mockUserRepository as unknown as IUserRepository;
    this.categoryRepository = mockCategoryRepository as unknown as ICategoryRepository;
  }
  
  // Métodos para obtener los repositorios
  getUserRepository(): IUserRepository {
    return this.userRepository;
  }
  
  getCategoryRepository(): ICategoryRepository {
    return this.categoryRepository;
  }
  
  getExpenseRepository(): any {
    throw new Error('Método no implementado para pruebas');
  }
  
  getFixedExpenseRepository(): any {
    throw new Error('Método no implementado para pruebas');
  }
  
  getFinancialsRepository(): any {
    throw new Error('Método no implementado para pruebas');
  }
  
  getSavingsGoalRepository(): any {
    throw new Error('Método no implementado para pruebas');
  }
  
  getAssetRepository(): any {
    throw new Error('Método no implementado para pruebas');
  }
  
  getLiabilityRepository(): any {
    throw new Error('Método no implementado para pruebas');
  }
  
  getPaymentSourceRepository(): any {
    throw new Error('Método no implementado para pruebas');
  }

  getUserStatsRepository(): any {
    throw new Error('Método no implementado para pruebas');
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
 *   const mockFactory = new MockRepositoryFactory();
 *   return {
 *     repositoryFactory: mockFactory
 *   };
 * });
 * 
 * describe('userService', () => {
 *   it('debería obtener el perfil de un usuario', async () => {
 *     // Configurar el comportamiento del mock
 *     const mockProfile = { displayName: 'Test User', email: 'test@example.com', currency: 'USD' };
 *     const mockFactory = new MockRepositoryFactory();
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
