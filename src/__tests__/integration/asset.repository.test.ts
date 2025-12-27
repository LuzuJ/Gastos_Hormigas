import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseAssetRepository } from '../../../repositories/implementations/SupabaseAssetRepository';
import type { CreateAssetDTO, UpdateAssetDTO } from '../../../types';

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

describe('SupabaseAssetRepository', () => {
  let repository: SupabaseAssetRepository;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    repository = new SupabaseAssetRepository();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un activo (cuenta bancaria) exitosamente', async () => {
      const newAsset: CreateAssetDTO = {
        userId: testUserId,
        name: 'Cuenta Banco BBVA',
        type: 'bank_account',
        amount: 5000,
        description: 'Cuenta de ahorro principal',
        iconName: 'Bank'
      };

      const mockResponse = {
        id: 'asset-123',
        user_id: testUserId,
        name: 'Cuenta Banco BBVA',
        type: 'bank_account',
        amount: 5000,
        description: 'Cuenta de ahorro principal',
        icon_name: 'Bank',
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

      const result = await repository.create(newAsset);

      expect(result).toBeDefined();
      expect(result.name).toBe('Cuenta Banco BBVA');
      expect(result.type).toBe('bank_account');
      expect(result.amount).toBe(5000);
    });

    it('debe crear efectivo', async () => {
      const newCash: CreateAssetDTO = {
        userId: testUserId,
        name: 'Efectivo en cartera',
        type: 'cash',
        amount: 500,
        iconName: 'Wallet'
      };

      const mockResponse = {
        id: 'asset-456',
        user_id: testUserId,
        name: 'Efectivo en cartera',
        type: 'cash',
        amount: 500,
        description: null,
        icon_name: 'Wallet',
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

      const result = await repository.create(newCash);

      expect(result.name).toBe('Efectivo en cartera');
      expect(result.type).toBe('cash');
    });

    it('debe manejar errores al crear activo', async () => {
      const newAsset: CreateAssetDTO = {
        userId: testUserId,
        name: 'Test',
        type: 'bank_account',
        amount: 1000,
        iconName: 'Bank'
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

      await expect(repository.create(newAsset)).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    it('debe obtener todos los activos de un usuario', async () => {
      const mockAssets = [
        {
          id: 'asset-1',
          user_id: testUserId,
          name: 'Cuenta Santander',
          type: 'bank_account',
          amount: 10000,
          description: 'Cuenta principal',
          icon_name: 'Bank',
          created_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 'asset-2',
          user_id: testUserId,
          name: 'Efectivo',
          type: 'cash',
          amount: 300,
          description: null,
          icon_name: 'Wallet',
          created_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 'asset-3',
          user_id: testUserId,
          name: 'Tarjeta BBVA',
          type: 'credit_card',
          amount: 15000,
          description: 'Límite de crédito',
          icon_name: 'CreditCard',
          created_at: '2025-01-01T00:00:00Z'
        }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: mockAssets,
              error: null
            }))
          }))
        }))
      });

      const result = await repository.getAll(testUserId);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('bank_account');
      expect(result[1].type).toBe('cash');
      expect(result[2].type).toBe('credit_card');
    });
  });

  describe('update', () => {
    it('debe actualizar un activo exitosamente', async () => {
      const updateData: UpdateAssetDTO = {
        name: 'Cuenta Santander Plus',
        amount: 12000
      };

      const mockUpdated = {
        id: 'asset-123',
        user_id: testUserId,
        name: 'Cuenta Santander Plus',
        type: 'bank_account',
        amount: 12000,
        description: 'Cuenta principal',
        icon_name: 'Bank',
        created_at: '2025-01-01T00:00:00Z'
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

      const result = await repository.update('asset-123', updateData);

      expect(result.name).toBe('Cuenta Santander Plus');
      expect(result.amount).toBe(12000);
    });

    it('debe actualizar el monto después de un ingreso', async () => {
      // Simular trigger: increment_asset_on_income
      const currentAmount = 5000;
      const incomeAmount = 2000;
      const newAmount = currentAmount + incomeAmount;

      const updateData: UpdateAssetDTO = {
        amount: newAmount
      };

      const mockUpdated = {
        id: 'asset-123',
        user_id: testUserId,
        name: 'Cuenta Banco',
        type: 'bank_account',
        amount: newAmount,
        description: null,
        icon_name: 'Bank',
        created_at: '2025-01-01T00:00:00Z'
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

      const result = await repository.update('asset-123', updateData);

      expect(result.amount).toBe(7000);
    });

    it('debe decrementar el monto después de un gasto', async () => {
      // Simular trigger: decrement_asset_on_expense
      const currentAmount = 5000;
      const expenseAmount = 500;
      const newAmount = currentAmount - expenseAmount;

      const updateData: UpdateAssetDTO = {
        amount: newAmount
      };

      const mockUpdated = {
        id: 'asset-123',
        user_id: testUserId,
        name: 'Efectivo',
        type: 'cash',
        amount: newAmount,
        description: null,
        icon_name: 'Wallet',
        created_at: '2025-01-01T00:00:00Z'
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

      const result = await repository.update('asset-123', updateData);

      expect(result.amount).toBe(4500);
    });
  });

  describe('delete', () => {
    it('debe eliminar un activo exitosamente', async () => {
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      });

      await expect(repository.delete('asset-123')).resolves.not.toThrow();
    });
  });

  describe('getByType', () => {
    it('debe obtener solo cuentas bancarias', async () => {
      const mockBankAccounts = [
        {
          id: 'asset-1',
          user_id: testUserId,
          name: 'Cuenta BBVA',
          type: 'bank_account',
          amount: 5000,
          description: null,
          icon_name: 'Bank',
          created_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 'asset-2',
          user_id: testUserId,
          name: 'Cuenta Santander',
          type: 'bank_account',
          amount: 8000,
          description: null,
          icon_name: 'Bank',
          created_at: '2025-01-01T00:00:00Z'
        }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                data: mockBankAccounts,
                error: null
              }))
            }))
          }))
        }))
      });

      const result = await repository.getByType(testUserId, 'bank_account');

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('bank_account');
      expect(result[1].type).toBe('bank_account');
    });

    it('debe obtener solo efectivo', async () => {
      const mockCash = [
        {
          id: 'asset-1',
          user_id: testUserId,
          name: 'Efectivo cartera',
          type: 'cash',
          amount: 500,
          description: null,
          icon_name: 'Wallet',
          created_at: '2025-01-01T00:00:00Z'
        }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                data: mockCash,
                error: null
              }))
            }))
          }))
        }))
      });

      const result = await repository.getByType(testUserId, 'cash');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('cash');
    });
  });
});
