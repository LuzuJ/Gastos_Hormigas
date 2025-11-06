import { repositoryFactory } from '../repositories';
import { PaymentSourceServiceRepo } from './paymentSourceServiceRepo';

/**
 * Servicio para inicializar todos los datos predefinidos de un usuario nuevo
 */
export class UserInitializationService {
  private paymentSourceService: PaymentSourceServiceRepo;

  constructor() {
    this.paymentSourceService = new PaymentSourceServiceRepo();
  }

  /**
   * Inicializa todos los datos por defecto para un usuario nuevo
   * @param userId - ID del usuario
   * @returns Promise<boolean> - true si la inicialización fue exitosa
   */
  async initializeCompleteUserData(userId: string): Promise<boolean> {
    try {
      console.log(`Inicializando datos completos para usuario: ${userId}`);
      
      // 1. Inicializar categorías (esto también llama a la función RPC completa)
      const categoryRepository = repositoryFactory.getCategoryRepository();
      const categoriesSuccess = await categoryRepository.initializeDefaultCategories(userId);
      
      if (!categoriesSuccess) {
        console.warn('Fallo la inicialización de categorías, continuando...');
      }
      
      // 2. Inicializar métodos de pago (fallback si no se crearon en RPC)
      try {
        await this.paymentSourceService.initializeDefaultPaymentSources(userId);
        console.log('Métodos de pago inicializados correctamente');
      } catch (error) {
        console.warn('Error al inicializar métodos de pago:', error);
      }
      
      // 3. Verificar e inicializar datos financieros básicos
      await this.ensureBasicFinancialData(userId);
      
      console.log(`Inicialización completa finalizada para usuario: ${userId}`);
      return true;
      
    } catch (error) {
      console.error('Error en inicialización completa de usuario:', error);
      return false;
    }
  }

  /**
   * Asegura que existan los registros básicos financieros
   * @param userId - ID del usuario
   */
  private async ensureBasicFinancialData(userId: string): Promise<void> {
    try {
      const financialsRepository = repositoryFactory.getFinancialsRepository();
      
      // Intentar obtener los datos financieros
      const existingFinancials = await financialsRepository.getFinancials(userId);
      
      // Si no existen, crear registro básico
      if (!existingFinancials) {
        await financialsRepository.updateFinancials(userId, { monthlyIncome: 0 });
        console.log('Registro financial básico creado');
      }
      
    } catch (error) {
      console.warn('Error al verificar datos financieros básicos:', error);
    }
  }

  /**
   * Reinicia todos los datos de un usuario (útil para testing)
   * @param userId - ID del usuario
   * @returns Promise<boolean> - true si el reinicio fue exitoso
   */
  async resetUserData(userId: string): Promise<boolean> {
    try {
      const categoryRepository = repositoryFactory.getCategoryRepository();
      
      // Usar la función RPC de reinicio si está disponible
      const { error } = await (categoryRepository as any).client.rpc('reset_user_data', { user_id: userId });
      
      if (error) {
        throw error;
      }
      
      console.log(`Datos del usuario ${userId} reiniciados correctamente`);
      return true;
      
    } catch (error) {
      console.error('Error al reiniciar datos del usuario:', error);
      return false;
    }
  }

  /**
   * Verifica si un usuario tiene datos inicializados
   * @param userId - ID del usuario
   * @returns Promise<{categories: boolean, paymentSources: boolean, financials: boolean}>
   */
  async checkUserDataStatus(userId: string): Promise<{
    categories: boolean;
    paymentSources: boolean;
    financials: boolean;
  }> {
    try {
      const categoryRepository = repositoryFactory.getCategoryRepository();
      const financialsRepository = repositoryFactory.getFinancialsRepository();
      
      // Verificar categorías
      const categories = await categoryRepository.getCategoriesWithSubcategories(userId);
      const hasCategories = categories.length > 0;
      
      // Verificar métodos de pago
      const paymentSources = await this.paymentSourceService.getPaymentSources(userId);
      const hasPaymentSources = paymentSources.length > 0;
      
      // Verificar datos financieros
      const financials = await financialsRepository.getFinancials(userId);
      const hasFinancials = financials !== null;
      
      return {
        categories: hasCategories,
        paymentSources: hasPaymentSources,
        financials: hasFinancials
      };
      
    } catch (error) {
      console.error('Error al verificar estado de datos del usuario:', error);
      return {
        categories: false,
        paymentSources: false,
        financials: false
      };
    }
  }
}

// Exportar instancia singleton
export const userInitializationService = new UserInitializationService();