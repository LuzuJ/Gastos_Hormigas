import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseIncomeRepository } from '../../../repositories/implementations/SupabaseIncomeRepository';
import type { CreateIncomeDTO, UpdateIncomeDTO } from '../../../types';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null
        }))
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null,
        error: null
      }))
    })),
    on: vi.fn(() => ({
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn()
      }))
    }))
  }))
};

vi.mock('../../../config/supabase', () => ({
  supabase: mockSupabase
}));

describe('SupabaseIncomeRepository', () => {
  let repository: SupabaseIncomeRepository;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    repository = new SupabaseIncomeRepository();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un ingreso exitosamente', async () => {
      const newIncome: CreateIncomeDTO = {
        userId: testUserId,
        description: 'Salario quincenal',
        amount: 1500,
        category: 'Salario',
        assetId: 'asset-123',
        assetName: 'Cuenta Banco',
        date: '2025-12-24',
        isRecurring: true,
        recurrenceFrequency: 'biweekly'
      };

      const mockResponse = {
        id: 'income-123',
        ...newIncome,
        created_at: '2025-12-24T10:00:00Z'
      };

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockResponse,
              error: null
            }))
          }))
        }))
      });

      const result = await repository.create(newIncome);

      expect(result).toBeDefined();
      expect(result.description).toBe('Salario quincenal');
      expect(result.amount).toBe(1500);
      expect(result.isRecurring).toBe(true);
    });

    it('debe manejar errores al crear ingreso', async () => {
      const newIncome: CreateIncomeDTO = {
        userId: testUserId,
        description: 'Test',
        amount: 100,
        category: 'Otro',
        assetId: 'asset-123',
        assetName: 'Test Asset',
        date: '2025-12-24',
        isRecurring: false,
        recurrenceFrequency: null
      };

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { message: 'Error de base de datos' }
            }))
          }))
        }))
      });

      await expect(repository.create(newIncome)).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    it('debe obtener todos los ingresos de un usuario', async () => {
      const mockIncomes = [
        {
          id: 'income-1',
          user_id: testUserId,
          description: 'Salario',
          amount: 2000,
          category: 'Salario',
          asset_id: 'asset-1',
          asset_name: 'Banco',
          date: '2025-12-01',
          is_recurring: true,
          recurrence_frequency: 'monthly',
          created_at: '2025-12-01T00:00:00Z'
        },
        {
          id: 'income-2',
          user_id: testUserId,
          description: 'Freelance',
          amount: 500,
          category: 'Freelance',
          asset_id: 'asset-1',
          asset_name: 'Banco',
          date: '2025-12-15',
          is_recurring: false,
          recurrence_frequency: null,
          created_at: '2025-12-15T00:00:00Z'
        }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: mockIncomes,
              error: null
            }))
          }))
        }))
      });

      const result = await repository.getAll(testUserId);

      expect(result).toHaveLength(2);
      expect(result[0].description).toBe('Salario');
      expect(result[1].description).toBe('Freelance');
    });
  });

  describe('update', () => {
    it('debe actualizar un ingreso exitosamente', async () => {
      const updateData: UpdateIncomeDTO = {
        description: 'Salario actualizado',
        amount: 2500
      };

      const mockUpdated = {
        id: 'income-123',
        user_id: testUserId,
        description: 'Salario actualizado',
        amount: 2500,
        category: 'Salario',
        asset_id: 'asset-1',
        asset_name: 'Banco',
        date: '2025-12-24',
        is_recurring: false,
        recurrence_frequency: null,
        created_at: '2025-12-24T00:00:00Z'
      };

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: mockUpdated,
                error: null
              }))
            }))
          }))
        }))
      });

      const result = await repository.update('income-123', updateData);

      expect(result.description).toBe('Salario actualizado');
      expect(result.amount).toBe(2500);
    });
  });

  describe('delete', () => {
    it('debe eliminar un ingreso exitosamente', async () => {
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      });

      await expect(repository.delete('income-123')).resolves.not.toThrow();
    });
  });

  describe('getByDateRange', () => {
    it('debe obtener ingresos en un rango de fechas', async () => {
      const mockIncomes = [
        {
          id: 'income-1',
          user_id: testUserId,
          description: 'Salario Dic',
          amount: 2000,
          category: 'Salario',
          asset_id: 'asset-1',
          asset_name: 'Banco',
          date: '2025-12-15',
          is_recurring: true,
          recurrence_frequency: 'monthly',
          created_at: '2025-12-15T00:00:00Z'
        }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => ({
                order: vi.fn(() => ({
                  data: mockIncomes,
                  error: null
                }))
              }))
            }))
          }))
        }))
      });

      const result = await repository.getByDateRange(
        testUserId,
        '2025-12-01',
        '2025-12-31'
      );

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Salario Dic');
    });
  });

  describe('getRecurring', () => {
    it('debe obtener solo ingresos recurrentes', async () => {
      const mockRecurringIncomes = [
        {
          id: 'income-1',
          user_id: testUserId,
          description: 'Salario mensual',
          amount: 2000,
          category: 'Salario',
          asset_id: 'asset-1',
          asset_name: 'Banco',
          date: '2025-12-01',
          is_recurring: true,
          recurrence_frequency: 'monthly',
          created_at: '2025-12-01T00:00:00Z'
        }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                data: mockRecurringIncomes,
                error: null
              }))
            }))
          }))
        }))
      });

      const result = await repository.getRecurring(testUserId);

      expect(result).toHaveLength(1);
      expect(result[0].isRecurring).toBe(true);
    });
  });
});
