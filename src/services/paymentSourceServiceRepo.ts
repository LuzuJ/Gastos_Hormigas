import { repositoryFactory } from '../repositories';
import type { PaymentSource } from '../types';

/**
 * Servicio para gestionar las fuentes de pago de un usuario
 */
export class PaymentSourceServiceRepo {
  /**
   * Inicializa fuentes de pago por defecto para un nuevo usuario
   * @param userId - ID del usuario
   */
  async initializeDefaultPaymentSources(userId: string): Promise<void> {
    try {
      const paymentSourceRepository = repositoryFactory.getPaymentSourceRepository();
      
      // Verificar si ya existen fuentes de pago
      const existingSources = await paymentSourceRepository.getPaymentSources(userId);
      if (existingSources.length > 0) {
        console.log('Payment sources already exist, skipping default creation');
        return;
      }

      const defaultSources: Omit<PaymentSource, 'id'>[] = [
        {
          name: 'Efectivo',
          type: 'cash',
          description: 'Dinero en efectivo',
          isActive: true,
          icon: '💵',
          color: '#10B981',
          balance: 0,
          autoUpdate: false,
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Cuenta Corriente',
          type: 'checking',
          description: 'Cuenta bancaria principal',
          isActive: false,
          icon: '🏦',
          color: '#3B82F6',
          balance: 0,
          autoUpdate: false,
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Tarjeta de Crédito',
          type: 'credit_card',
          description: 'Tarjeta de crédito principal',
          isActive: false,
          icon: '💳',
          color: '#F59E0B',
          balance: 0,
          autoUpdate: false,
          lastUpdated: new Date().toISOString()
        }
      ];

      // Crear fuentes por defecto una por una, continuando si alguna falla
      for (const source of defaultSources) {
        try {
          await paymentSourceRepository.addPaymentSource(userId, source);
          console.log(`Created default payment source: ${source.name}`);
        } catch (sourceError: any) {
          // Si es error de duplicado (violación de restricción única), continuar
          if (sourceError?.code === '23505' || sourceError?.message?.includes('duplicate') || sourceError?.message?.includes('unique')) {
            console.log(`Payment source ${source.name} already exists, skipping`);
            continue;
          }
          console.error(`Error creating payment source ${source.name}:`, sourceError);
        }
      }
    } catch (error) {
      console.error('Error creating default payment sources:', error);
      // No lanzar el error para no interrumpir la aplicación
    }
  }

  /**
   * Obtiene todas las fuentes de pago de un usuario
   * @param userId - ID del usuario
   * @returns Promise con la lista de fuentes de pago
   */
  async getPaymentSources(userId: string): Promise<PaymentSource[]> {
    const paymentSourceRepository = repositoryFactory.getPaymentSourceRepository();
    return paymentSourceRepository.getPaymentSources(userId);
  }
  
  /**
   * Agrega una nueva fuente de pago
   * @param userId - ID del usuario
   * @param paymentSourceData - Datos de la nueva fuente de pago
   * @returns Promise con la fuente de pago creada
   */
  async addPaymentSource(
    userId: string, 
    paymentSourceData: Omit<PaymentSource, 'id'>
  ): Promise<PaymentSource> {
    const paymentSourceRepository = repositoryFactory.getPaymentSourceRepository();
    return paymentSourceRepository.addPaymentSource(userId, paymentSourceData);
  }
  
  /**
   * Actualiza una fuente de pago existente
   * @param userId - ID del usuario
   * @param paymentSourceId - ID de la fuente de pago a actualizar
   * @param partialData - Datos parciales para actualizar
   * @returns Promise con la fuente de pago actualizada
   */
  async updatePaymentSource(
    userId: string,
    paymentSourceId: string,
    partialData: Partial<PaymentSource>
  ): Promise<PaymentSource> {
    const paymentSourceRepository = repositoryFactory.getPaymentSourceRepository();
    return paymentSourceRepository.updatePaymentSource(userId, paymentSourceId, partialData);
  }
  
  /**
   * Elimina una fuente de pago
   * @param userId - ID del usuario
   * @param paymentSourceId - ID de la fuente de pago a eliminar
   * @returns Promise que resuelve a true si fue eliminada con éxito
   */
  async deletePaymentSource(userId: string, paymentSourceId: string): Promise<boolean> {
    const paymentSourceRepository = repositoryFactory.getPaymentSourceRepository();
    return paymentSourceRepository.deletePaymentSource(userId, paymentSourceId);
  }
  
  /**
   * Actualiza el balance de una fuente de pago
   * @param userId - ID del usuario
   * @param paymentSourceId - ID de la fuente de pago
   * @param amount - Monto a sumar (o restar si es negativo) al balance actual
   * @returns Promise con la fuente de pago actualizada
   */
  async updatePaymentSourceBalance(
    userId: string, 
    paymentSourceId: string, 
    amount: number
  ): Promise<PaymentSource> {
    const paymentSourceRepository = repositoryFactory.getPaymentSourceRepository();
    return paymentSourceRepository.updatePaymentSourceBalance(userId, paymentSourceId, amount);
  }
  
  /**
   * Suscribe a cambios en las fuentes de pago del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Función para cancelar la suscripción
   */
  subscribeToPaymentSources(
    userId: string, 
    callback: (paymentSources: PaymentSource[]) => void
  ): () => void {
    const paymentSourceRepository = repositoryFactory.getPaymentSourceRepository();
    return paymentSourceRepository.subscribeToPaymentSources(userId, callback);
  }
}
