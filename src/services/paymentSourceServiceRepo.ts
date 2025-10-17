import { repositoryFactory } from '../repositories';
import type { PaymentSource } from '../types';

/**
 * Servicio para gestionar las fuentes de pago de un usuario
 */
export class PaymentSourceServiceRepo {
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
