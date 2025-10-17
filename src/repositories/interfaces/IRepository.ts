/**
 * Interfaz base para todos los repositorios
 * Define operaciones CRUD genéricas que todos los repositorios deben implementar
 */
export interface IRepository<T, ID, CreateDTO = Omit<T, 'id'>, UpdateDTO = Partial<T>> {
  /**
   * Obtiene una entidad por su ID
   * @param id - ID único de la entidad
   * @returns Una promesa que resuelve a la entidad si existe, o null si no existe
   */
  getById(id: ID): Promise<T | null>;
  
  /**
   * Obtiene todas las entidades que pertenecen a un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de entidades
   */
  getAll(userId: string): Promise<T[]>;
  
  /**
   * Crea una nueva entidad
   * @param userId - ID del usuario
   * @param data - Datos para crear la entidad
   * @returns Una promesa que resuelve a la entidad creada
   */
  create(userId: string, data: CreateDTO): Promise<T>;
  
  /**
   * Actualiza una entidad existente
   * @param userId - ID del usuario
   * @param id - ID de la entidad a actualizar
   * @param data - Datos parciales para actualizar la entidad
   * @returns Una promesa que resuelve a la entidad actualizada
   */
  update(userId: string, id: ID, data: UpdateDTO): Promise<T>;
  
  /**
   * Elimina una entidad
   * @param userId - ID del usuario
   * @param id - ID de la entidad a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  delete(userId: string, id: ID): Promise<boolean>;
}
