import { IRepository } from './IRepository';
import type { PaymentSource } from '../../types';

/**
 * Interfaz de repositorio para la gestión de fuentes de pago
 */
export interface IPaymentSourceRepository extends IRepository<PaymentSource, string> {
  /**
   * Obtiene las fuentes de pago de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de fuentes de pago
   */
  getPaymentSources(userId: string): Promise<PaymentSource[]>;
  
  /**
   * Agrega una nueva fuente de pago
   * @param userId - ID del usuario
   * @param paymentSourceData - Datos de la fuente de pago a agregar
   * @returns Una promesa que resuelve a la fuente de pago creada
   */
  addPaymentSource(userId: string, paymentSourceData: Omit<PaymentSource, 'id'>): Promise<PaymentSource>;
  
  /**
   * Actualiza una fuente de pago existente
   * @param userId - ID del usuario
   * @param paymentSourceId - ID de la fuente de pago a actualizar
   * @param partialData - Datos parciales para actualizar la fuente de pago
   * @returns Una promesa que resuelve a la fuente de pago actualizada
   */
  updatePaymentSource(userId: string, paymentSourceId: string, partialData: Partial<PaymentSource>): Promise<PaymentSource>;
  
  /**
   * Elimina una fuente de pago
   * @param userId - ID del usuario
   * @param paymentSourceId - ID de la fuente de pago a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  deletePaymentSource(userId: string, paymentSourceId: string): Promise<boolean>;
  
  /**
   * Actualiza el balance de una fuente de pago
   * @param userId - ID del usuario
   * @param paymentSourceId - ID de la fuente de pago
   * @param amount - Monto a sumar (o restar si es negativo) al balance actual
   * @returns Una promesa que resuelve a la fuente de pago actualizada
   */
  updatePaymentSourceBalance(userId: string, paymentSourceId: string, amount: number): Promise<PaymentSource>;
  
  /**
   * Suscribe a cambios en las fuentes de pago del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToPaymentSources(userId: string, callback: (paymentSources: PaymentSource[]) => void): () => void;
}
