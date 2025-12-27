import type { Income } from '../../types';

/**
 * Interfaz del repositorio de ingresos
 * Define las operaciones básicas para manejar ingresos del usuario
 */
export interface IIncomeRepository {
  /**
   * Obtiene todos los ingresos de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de ingresos
   */
  getAll(userId: string): Promise<Income[]>;
  
  /**
   * Obtiene un ingreso específico por su ID
   * @param userId - ID del usuario
   * @param id - ID del ingreso
   * @returns Una promesa que resuelve al ingreso o null si no existe
   */
  getById(userId: string, id: string): Promise<Income | null>;
  
  /**
   * Crea un nuevo ingreso
   * @param userId - ID del usuario
   * @param income - Datos del ingreso a crear
   * @returns Una promesa que resuelve al ingreso creado
   */
  create(userId: string, income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): Promise<Income>;
  
  /**
   * Actualiza un ingreso existente
   * @param userId - ID del usuario
   * @param id - ID del ingreso a actualizar
   * @param income - Datos parciales para actualizar
   * @returns Una promesa que resuelve al ingreso actualizado
   */
  update(userId: string, id: string, income: Partial<Income>): Promise<Income>;
  
  /**
   * Elimina un ingreso
   * @param userId - ID del usuario
   * @param id - ID del ingreso a eliminar
   * @returns Una promesa que resuelve a true si se eliminó correctamente
   */
  delete(userId: string, id: string): Promise<boolean>;
  
  /**
   * Obtiene ingresos por rango de fechas
   * @param userId - ID del usuario
   * @param startDate - Fecha de inicio
   * @param endDate - Fecha de fin
   * @returns Una promesa que resuelve a un array de ingresos
   */
  getByDateRange(userId: string, startDate: string, endDate: string): Promise<Income[]>;
  
  /**
   * Obtiene ingresos recurrentes activos
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de ingresos recurrentes
   */
  getRecurring(userId: string): Promise<Income[]>;
  
  /**
   * Suscribe a cambios en los ingresos del usuario
   * @param userId - ID del usuario
   * @param callback - Función a ejecutar cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribe(userId: string, callback: (incomes: Income[]) => void): () => void;
}
