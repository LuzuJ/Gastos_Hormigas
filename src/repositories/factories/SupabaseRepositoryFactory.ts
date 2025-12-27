import type { IRepositoryFactory } from '../interfaces/IRepositoryFactory';
import type { 
  IUserRepository, 
  ICategoryRepository,
  IExpenseRepository,
  IIncomeRepository,
  IFixedExpenseRepository,
  IFinancialsRepository,
  ISavingsGoalRepository,
  IAssetRepository,
  ILiabilityRepository,
  IPaymentSourceRepository,
  IUserStatsRepository
} from '../interfaces';

import { 
  SupabaseUserRepository, 
  SupabaseCategoryRepositoryV2,
  SupabaseExpenseRepository,
  SupabaseIncomeRepository,
  SupabaseUserStatsRepository,
  SupabaseFixedExpenseRepository,
  SupabaseSavingsGoalRepository,
  SupabaseFinancialsRepository,
  SupabaseAssetRepository,
  SupabaseLiabilityRepository,
  SupabasePaymentSourceRepository
} from '../implementations';

/**
 * Implementación de la fábrica de repositorios para Supabase
 * Crea y devuelve instancias de los repositorios configurados para Supabase
 */
export class SupabaseRepositoryFactory implements IRepositoryFactory {
  private userRepository: IUserRepository | null = null;
  private categoryRepository: ICategoryRepository | null = null;
  private expenseRepository: IExpenseRepository | null = null;
  private incomeRepository: IIncomeRepository | null = null;
  private fixedExpenseRepository: IFixedExpenseRepository | null = null;
  private financialsRepository: IFinancialsRepository | null = null;
  private savingsGoalRepository: ISavingsGoalRepository | null = null;
  private assetRepository: IAssetRepository | null = null;
  private liabilityRepository: ILiabilityRepository | null = null;
  private paymentSourceRepository: IPaymentSourceRepository | null = null;
  private userStatsRepository: IUserStatsRepository | null = null;
  
  /**
   * Obtiene el repositorio de usuarios
   * @returns Instancia del repositorio de usuarios
   */
  getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new SupabaseUserRepository();
    }
    return this.userRepository!;
  }
  
  /**
   * Obtiene el repositorio de categorías
   * @returns Instancia del repositorio de categorías
   */
  getCategoryRepository(): ICategoryRepository {
    if (!this.categoryRepository) {
      this.categoryRepository = new SupabaseCategoryRepositoryV2();
    }
    return this.categoryRepository!;
  }
  
  /**
   * Obtiene el repositorio de gastos
   * @returns Instancia del repositorio de gastos
   */
  getExpenseRepository(): IExpenseRepository {
    if (!this.expenseRepository) {
      this.expenseRepository = new SupabaseExpenseRepository();
    }
    return this.expenseRepository;
  }
  
  /**
   * Obtiene el repositorio de ingresos
   * @returns Instancia del repositorio de ingresos
   */
  getIncomeRepository(): IIncomeRepository {
    if (!this.incomeRepository) {
      this.incomeRepository = new SupabaseIncomeRepository();
    }
    return this.incomeRepository;
  }
  
  /**
   * Obtiene el repositorio de gastos fijos
   * @returns Instancia del repositorio de gastos fijos
   */
  getFixedExpenseRepository(): IFixedExpenseRepository {
    if (!this.fixedExpenseRepository) {
      this.fixedExpenseRepository = new SupabaseFixedExpenseRepository();
    }
    return this.fixedExpenseRepository;
  }
  
  /**
   * Obtiene el repositorio de información financiera
   * @returns Instancia del repositorio de información financiera
   */
  getFinancialsRepository(): IFinancialsRepository {
    if (!this.financialsRepository) {
      this.financialsRepository = new SupabaseFinancialsRepository();
    }
    return this.financialsRepository;
  }
  
  /**
   * Obtiene el repositorio de metas de ahorro
   * @returns Instancia del repositorio de metas de ahorro
   */
  getSavingsGoalRepository(): ISavingsGoalRepository {
    if (!this.savingsGoalRepository) {
      this.savingsGoalRepository = new SupabaseSavingsGoalRepository();
    }
    return this.savingsGoalRepository;
  }
  
  /**
   * Obtiene el repositorio de activos
   * @returns Instancia del repositorio de activos
   */
  getAssetRepository(): IAssetRepository {
    if (!this.assetRepository) {
      this.assetRepository = new SupabaseAssetRepository();
    }
    return this.assetRepository;
  }
  
  /**
   * Obtiene el repositorio de pasivos
   * @returns Instancia del repositorio de pasivos
   */
  getLiabilityRepository(): ILiabilityRepository {
    if (!this.liabilityRepository) {
      this.liabilityRepository = new SupabaseLiabilityRepository();
    }
    return this.liabilityRepository;
  }
  
  /**
   * Obtiene el repositorio de fuentes de pago
   * @returns Instancia del repositorio de fuentes de pago
   */
  getPaymentSourceRepository(): IPaymentSourceRepository {
    if (!this.paymentSourceRepository) {
      this.paymentSourceRepository = new SupabasePaymentSourceRepository();
    }
    return this.paymentSourceRepository;
  }
  
  /**
   * Obtiene el repositorio de estadísticas de usuario
   * @returns Instancia del repositorio de estadísticas de usuario
   */
  getUserStatsRepository(): IUserStatsRepository {
    if (!this.userStatsRepository) {
      this.userStatsRepository = new SupabaseUserStatsRepository();
    }
    return this.userStatsRepository;
  }
}
