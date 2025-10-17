// Re-exportar interfaces
export type * from './interfaces';

// Re-exportar implementaciones
export * from './implementations';

// Re-exportar fábricas
export * from './factories';

// Crear y exportar una instancia por defecto de la fábrica para Supabase
import { SupabaseRepositoryFactory } from './factories';
export const repositoryFactory = new SupabaseRepositoryFactory();
