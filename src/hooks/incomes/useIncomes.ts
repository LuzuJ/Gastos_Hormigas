import { useState, useEffect } from 'react';
import type { Income } from '../../types';
import { repositoryFactory } from '../../repositories';

const incomeRepository = repositoryFactory.getIncomeRepository();

interface UseIncomesReturn {
  incomes: Income[];
  loading: boolean;
  error: string | null;
  addIncome: (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncome: (id: string, income: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  getIncomesByDateRange: (startDate: string, endDate: string) => Promise<Income[]>;
  getRecurringIncomes: () => Promise<Income[]>;
  refreshIncomes: () => Promise<void>;
}

/**
 * Hook para manejar ingresos del usuario
 * Los ingresos automáticamente incrementan el asset asociado
 */
export const useIncomes = (userId: string | null): UseIncomesReturn => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar ingresos iniciales
  useEffect(() => {
    if (userId) {
      loadIncomes();
    }
  }, [userId]);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = incomeRepository.subscribe(userId, (updatedIncomes: Income[]) => {
      console.log('📥 Ingresos actualizados en tiempo real:', updatedIncomes);
      setIncomes(updatedIncomes);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const loadIncomes = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await incomeRepository.getAll(userId);
      setIncomes(data);
    } catch (err) {
      console.error('Error al cargar ingresos:', err);
      setError('Error al cargar ingresos');
    } finally {
      setLoading(false);
    }
  };

  const addIncome = async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) throw new Error('Usuario no autenticado');

    try {
      setError(null);
      console.log('💰 Creando ingreso:', income);
      
      const newIncome = await incomeRepository.create(userId, income);
      
      console.log('✅ Ingreso creado:', newIncome);
      
      // El trigger ya incrementó el asset, solo refrescar la lista
      await refreshIncomes();
    } catch (err) {
      console.error('Error al crear ingreso:', err);
      setError('Error al crear ingreso');
      throw err;
    }
  };

  const updateIncome = async (id: string, income: Partial<Income>) => {
    if (!userId) throw new Error('Usuario no autenticado');

    try {
      setError(null);
      console.log('📝 Actualizando ingreso:', id, income);
      
      await incomeRepository.update(userId, id, income);
      
      console.log('✅ Ingreso actualizado');
      
      // El trigger ya ajustó los assets, solo refrescar la lista
      await refreshIncomes();
    } catch (err) {
      console.error('Error al actualizar ingreso:', err);
      setError('Error al actualizar ingreso');
      throw err;
    }
  };

  const deleteIncome = async (id: string) => {
    if (!userId) throw new Error('Usuario no autenticado');

    try {
      setError(null);
      console.log('🗑️ Eliminando ingreso:', id);
      
      await incomeRepository.delete(userId, id);
      
      console.log('✅ Ingreso eliminado');
      
      // El trigger ya revirtió el incremento del asset, solo refrescar la lista
      await refreshIncomes();
    } catch (err) {
      console.error('Error al eliminar ingreso:', err);
      setError('Error al eliminar ingreso');
      throw err;
    }
  };

  const getIncomesByDateRange = async (startDate: string, endDate: string): Promise<Income[]> => {
    if (!userId) throw new Error('Usuario no autenticado');

    try {
      const data = await incomeRepository.getByDateRange(userId, startDate, endDate);
      return data;
    } catch (err) {
      console.error('Error al obtener ingresos por fecha:', err);
      throw err;
    }
  };

  const getRecurringIncomes = async (): Promise<Income[]> => {
    if (!userId) throw new Error('Usuario no autenticado');

    try {
      const data = await incomeRepository.getRecurring(userId);
      return data;
    } catch (err) {
      console.error('Error al obtener ingresos recurrentes:', err);
      throw err;
    }
  };

  const refreshIncomes = async () => {
    await loadIncomes();
  };

  return {
    incomes,
    loading,
    error,
    addIncome,
    updateIncome,
    deleteIncome,
    getIncomesByDateRange,
    getRecurringIncomes,
    refreshIncomes,
  };
};
