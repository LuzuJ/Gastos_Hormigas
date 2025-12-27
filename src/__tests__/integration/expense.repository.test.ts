import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseExpenseRepository } from '../../../repositories/implementations/SupabaseExpenseRepository';
import type { CreateExpenseDTO, UpdateExpenseDTO } from '../../../types';

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
    }))
  }))
};

vi.mock('../../../config/supabase', () => ({
  supabase: mockSupabase
}));

describe('SupabaseExpenseRepository', () => {
  let repository: SupabaseExpenseRepository;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    repository = new SupabaseExpenseRepository();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un gasto exitosamente', async () => {
      const newExpense: CreateExpenseDTO = {
        userId: testUserId,
        description: 'Supermercado',
        amount: 150,
        category: 'Alimentos',
        subcategory: 'Comida',
        assetId: 'asset-123',
        assetName: 'Efectivo',
        date: '2025-12-24',
        isFixed: false
      };

      const mockResponse = {
        id: 'expense-123',
        ...newExpense,
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

      const result = await repository.create(newExpense);

      expect(result).toBeDefined();
      expect(result.description).toBe('Supermercado');
      expect(result.amount).toBe(150);
      expect(result.category).toBe('Alimentos');
    });

    it('debe crear gasto fijo con recurrencia', async () => {
      const newFixedExpense: CreateExpenseDTO = {
        userId: testUserId,
        description: 'Netflix',
        amount: 199,
        category: 'Entretenimiento',
        subcategory: 'Streaming',
        assetId: 'asset-123',
        assetName: 'Tarjeta',
        date: '2025-12-01',
        isFixed: true,
        recurrenceFrequency: 'monthly'
      };

      const mockResponse = {
        id: 'expense-456',
        ...newFixedExpense,
        created_at: '2025-12-01T00:00:00Z'
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

      const result = await repository.create(newFixedExpense);

      expect(result.isFixed).toBe(true);
      expect(result.recurrenceFrequency).toBe('monthly');
    });

    it('debe manejar errores al crear gasto', async () => {
      const newExpense: CreateExpenseDTO = {
        userId: testUserId,
        description: 'Test',
        amount: 100,
        category: 'Test',
        subcategory: 'Test',
        assetId: 'asset-123',
        assetName: 'Test',
        date: '2025-12-24',
        isFixed: false
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

      await expect(repository.create(newExpense)).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    it('debe obtener todos los gastos de un usuario', async () => {
      const mockExpenses = [
        {
          id: 'expense-1',
          user_id: testUserId,
          description: 'Café',
          amount: 45,
          category: 'Alimentos',
          subcategory: 'Cafetería',
          asset_id: 'asset-1',
          asset_name: 'Efectivo',
          date: '2025-12-20',
          is_fixed: false,
          recurrence_frequency: null,
          created_at: '2025-12-20T08:30:00Z'
        },
        {
          id: 'expense-2',
          user_id: testUserId,
          description: 'Gasolina',
          amount: 500,
          category: 'Transporte',
          subcategory: 'Combustible',
          asset_id: 'asset-2',
          asset_name: 'Tarjeta',
          date: '2025-12-22',
          is_fixed: false,
          recurrence_frequency: null,
          created_at: '2025-12-22T14:00:00Z'
        }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: mockExpenses,
              error: null
            }))
          }))
        }))
      });

      const result = await repository.getAll(testUserId);

      expect(result).toHaveLength(2);
      expect(result[0].description).toBe('Café');
      expect(result[1].description).toBe('Gasolina');
    });
  });

  describe('update', () => {
    it('debe actualizar un gasto exitosamente', async () => {
      const updateData: UpdateExpenseDTO = {
        description: 'Supermercado Walmart',
        amount: 180
      };

      const mockUpdated = {
        id: 'expense-123',
        user_id: testUserId,
        description: 'Supermercado Walmart',
        amount: 180,
        category: 'Alimentos',
        subcategory: 'Comida',
        asset_id: 'asset-1',
        asset_name: 'Efectivo',
        date: '2025-12-24',
        is_fixed: false,
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

      const result = await repository.update('expense-123', updateData);

      expect(result.description).toBe('Supermercado Walmart');
      expect(result.amount).toBe(180);
    });
  });

  describe('delete', () => {
    it('debe eliminar un gasto exitosamente', async () => {
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      });

      await expect(repository.delete('expense-123')).resolves.not.toThrow();
    });
  });

  describe('getByDateRange', () => {
    it('debe obtener gastos en un rango de fechas', async () => {
      const mockExpenses = [
        {
          id: 'expense-1',
          user_id: testUserId,
          description: 'Gasto Diciembre',
          amount: 100,
          category: 'Varios',
          subcategory: 'Otros',
          asset_id: 'asset-1',
          asset_name: 'Efectivo',
          date: '2025-12-15',
          is_fixed: false,
          recurrence_frequency: null,
          created_at: '2025-12-15T00:00:00Z'
        }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => ({
                order: vi.fn(() => ({
                  data: mockExpenses,
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
      expect(result[0].description).toBe('Gasto Diciembre');
    });
  });

  describe('getFixed', () => {
    it('debe obtener solo gastos fijos', async () => {
      const mockFixedExpenses = [
        {
          id: 'expense-1',
          user_id: testUserId,
          description: 'Renta',
          amount: 8000,
          category: 'Vivienda',
          subcategory: 'Alquiler',
          asset_id: 'asset-1',
          asset_name: 'Banco',
          date: '2025-12-01',
          is_fixed: true,
          recurrence_frequency: 'monthly',
          created_at: '2025-12-01T00:00:00Z'
        }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                data: mockFixedExpenses,
                error: null
              }))
            }))
          }))
        }))
      });

      const result = await repository.getFixed(testUserId);

      expect(result).toHaveLength(1);
      expect(result[0].isFixed).toBe(true);
    });
  });

  describe('getByCategory', () => {
    it('debe obtener gastos por categoría', async () => {
      const mockExpenses = [
        {
          id: 'expense-1',
          user_id: testUserId,
          description: 'Supermercado',
          amount: 200,
          category: 'Alimentos',
          subcategory: 'Comida',
          asset_id: 'asset-1',
          asset_name: 'Efectivo',
          date: '2025-12-15',
          is_fixed: false,
          recurrence_frequency: null,
          created_at: '2025-12-15T00:00:00Z'
        },
        {
          id: 'expense-2',
          user_id: testUserId,
          description: 'Restaurante',
          amount: 350,
          category: 'Alimentos',
          subcategory: 'Comida fuera',
          asset_id: 'asset-1',
          asset_name: 'Tarjeta',
          date: '2025-12-18',
          is_fixed: false,
          recurrence_frequency: null,
          created_at: '2025-12-18T00:00:00Z'
        }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                data: mockExpenses,
                error: null
              }))
            }))
          }))
        }))
      });

      const result = await repository.getByCategory(testUserId, 'Alimentos');

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('Alimentos');
      expect(result[1].category).toBe('Alimentos');
    });
  });
});
