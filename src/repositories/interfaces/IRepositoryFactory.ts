import { IUserRepository } from './IUserRepository';
import { ICategoryRepository } from './ICategoryRepository';
import { IExpenseRepository } from './IExpenseRepository';
import { IFixedExpenseRepository } from './IFixedExpenseRepository';
import { IFinancialsRepository } from './IFinancialsRepository';
import { ISavingsGoalRepository } from './ISavingsGoalRepository';
import { IAssetRepository } from './IAssetRepository';
import { ILiabilityRepository } from './ILiabilityRepository';
import { IPaymentSourceRepository } from './IPaymentSourceRepository';
import { IUserStatsRepository } from './IUserStatsRepository';

/**
 * Interfaz para la fábrica de repositorios
 * Proporciona acceso centralizado a todos los repositorios de la aplicación
 */
export interface IRepositoryFactory {
  /**
   * Obtiene el repositorio de usuarios
   */
  getUserRepository(): IUserRepository;
  
  /**
   * Obtiene el repositorio de categorías
   */
  getCategoryRepository(): ICategoryRepository;
  
  /**
   * Obtiene el repositorio de gastos
   */
  getExpenseRepository(): IExpenseRepository;
  
  /**
   * Obtiene el repositorio de gastos fijos
   */
  getFixedExpenseRepository(): IFixedExpenseRepository;
  
  /**
   * Obtiene el repositorio de información financiera
   */
  getFinancialsRepository(): IFinancialsRepository;
  
  /**
   * Obtiene el repositorio de metas de ahorro
   */
  getSavingsGoalRepository(): ISavingsGoalRepository;
  
  /**
   * Obtiene el repositorio de activos
   */
  getAssetRepository(): IAssetRepository;
  
  /**
   * Obtiene el repositorio de pasivos
   */
  getLiabilityRepository(): ILiabilityRepository;
  
  /**
   * Obtiene el repositorio de fuentes de pago
   */
  getPaymentSourceRepository(): IPaymentSourceRepository;
  
  /**
   * Obtiene el repositorio de estadísticas de usuario
   */
  getUserStatsRepository(): IUserStatsRepository;
}
