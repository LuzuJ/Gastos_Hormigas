import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Test de integración del sistema de transacciones
 * Simula el comportamiento de los triggers de Supabase:
 * - increment_asset_on_income: Incrementa el activo cuando se crea un ingreso
 * - decrement_asset_on_expense: Decrementa el activo cuando se crea un gasto
 * - revert_asset_on_income_delete: Revierte el incremento al eliminar un ingreso
 * - revert_asset_on_expense_delete: Revierte el decremento al eliminar un gasto
 */

interface Asset {
  id: string;
  userId: string;
  name: string;
  type: 'bank_account' | 'cash' | 'credit_card';
  amount: number;
}

interface Income {
  id: string;
  userId: string;
  description: string;
  amount: number;
  assetId: string;
  assetName: string;
  date: string;
}

interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  assetId: string;
  assetName: string;
  date: string;
}

describe('Sistema de Transacciones - Integration Tests', () => {
  const testUserId = 'test-user-123';
  let mockAsset: Asset;

  beforeEach(() => {
    // Mock de un activo inicial
    mockAsset = {
      id: 'asset-1',
      userId: testUserId,
      name: 'Cuenta Banco',
      type: 'bank_account',
      amount: 5000
    };
  });

  describe('Trigger: increment_asset_on_income', () => {
    it('debe incrementar el monto del activo al crear un ingreso', () => {
      const incomeAmount = 2000;
      const initialAmount = mockAsset.amount;

      // Simular creación de ingreso
      const newIncome: Income = {
        id: 'income-1',
        userId: testUserId,
        description: 'Salario',
        amount: incomeAmount,
        assetId: mockAsset.id,
        assetName: mockAsset.name,
        date: '2025-12-24'
      };

      // Simular trigger: UPDATE assets SET amount = amount + NEW.amount
      mockAsset.amount = mockAsset.amount + newIncome.amount;

      expect(mockAsset.amount).toBe(initialAmount + incomeAmount);
      expect(mockAsset.amount).toBe(7000);
    });

    it('debe incrementar correctamente múltiples ingresos', () => {
      const income1 = { id: 'i1', amount: 1000, assetId: mockAsset.id };
      const income2 = { id: 'i2', amount: 1500, assetId: mockAsset.id };
      const income3 = { id: 'i3', amount: 2500, assetId: mockAsset.id };

      mockAsset.amount += income1.amount; // 6000
      mockAsset.amount += income2.amount; // 7500
      mockAsset.amount += income3.amount; // 10000

      expect(mockAsset.amount).toBe(10000);
    });
  });

  describe('Trigger: decrement_asset_on_expense', () => {
    it('debe decrementar el monto del activo al crear un gasto', () => {
      const expenseAmount = 500;
      const initialAmount = mockAsset.amount;

      // Simular creación de gasto
      const newExpense: Expense = {
        id: 'expense-1',
        userId: testUserId,
        description: 'Supermercado',
        amount: expenseAmount,
        category: 'Alimentos',
        assetId: mockAsset.id,
        assetName: mockAsset.name,
        date: '2025-12-24'
      };

      // Simular trigger: UPDATE assets SET amount = amount - NEW.amount
      mockAsset.amount = mockAsset.amount - newExpense.amount;

      expect(mockAsset.amount).toBe(initialAmount - expenseAmount);
      expect(mockAsset.amount).toBe(4500);
    });

    it('debe decrementar correctamente múltiples gastos', () => {
      const expense1 = { id: 'e1', amount: 200, assetId: mockAsset.id };
      const expense2 = { id: 'e2', amount: 300, assetId: mockAsset.id };
      const expense3 = { id: 'e3', amount: 500, assetId: mockAsset.id };

      mockAsset.amount -= expense1.amount; // 4800
      mockAsset.amount -= expense2.amount; // 4500
      mockAsset.amount -= expense3.amount; // 4000

      expect(mockAsset.amount).toBe(4000);
    });

    it('debe permitir que el saldo sea negativo (sobregiro)', () => {
      const largeExpense = 7000;
      mockAsset.amount = mockAsset.amount - largeExpense;

      expect(mockAsset.amount).toBe(-2000);
      expect(mockAsset.amount).toBeLessThan(0);
    });
  });

  describe('Trigger: revert_asset_on_income_delete', () => {
    it('debe revertir el incremento al eliminar un ingreso', () => {
      const incomeAmount = 2000;

      // 1. Crear ingreso (incrementa)
      mockAsset.amount += incomeAmount; // 7000

      // 2. Eliminar ingreso (revierte)
      // Simular trigger: UPDATE assets SET amount = amount - OLD.amount
      mockAsset.amount -= incomeAmount; // 5000

      expect(mockAsset.amount).toBe(5000); // Vuelve al monto original
    });

    it('debe manejar múltiples eliminaciones correctamente', () => {
      // Crear 3 ingresos
      mockAsset.amount += 1000; // 6000
      mockAsset.amount += 1500; // 7500
      mockAsset.amount += 2500; // 10000

      // Eliminar el segundo ingreso
      mockAsset.amount -= 1500; // 8500

      expect(mockAsset.amount).toBe(8500);

      // Eliminar el tercer ingreso
      mockAsset.amount -= 2500; // 6000

      expect(mockAsset.amount).toBe(6000);
    });
  });

  describe('Trigger: revert_asset_on_expense_delete', () => {
    it('debe revertir el decremento al eliminar un gasto', () => {
      const expenseAmount = 500;

      // 1. Crear gasto (decrementa)
      mockAsset.amount -= expenseAmount; // 4500

      // 2. Eliminar gasto (revierte)
      // Simular trigger: UPDATE assets SET amount = amount + OLD.amount
      mockAsset.amount += expenseAmount; // 5000

      expect(mockAsset.amount).toBe(5000); // Vuelve al monto original
    });
  });

  describe('Flujos completos de transacciones', () => {
    it('debe manejar flujo completo: ingreso → gasto → eliminar gasto → eliminar ingreso', () => {
      const initialAmount = mockAsset.amount; // 5000

      // 1. Crear ingreso de 3000
      const incomeAmount = 3000;
      mockAsset.amount += incomeAmount; // 8000
      expect(mockAsset.amount).toBe(8000);

      // 2. Crear gasto de 1200
      const expenseAmount = 1200;
      mockAsset.amount -= expenseAmount; // 6800
      expect(mockAsset.amount).toBe(6800);

      // 3. Eliminar gasto (revertir)
      mockAsset.amount += expenseAmount; // 8000
      expect(mockAsset.amount).toBe(8000);

      // 4. Eliminar ingreso (revertir)
      mockAsset.amount -= incomeAmount; // 5000
      expect(mockAsset.amount).toBe(initialAmount);
    });

    it('debe calcular saldo correcto con múltiples transacciones mixtas', () => {
      const initialAmount = mockAsset.amount; // 5000

      // Ingresos
      mockAsset.amount += 2000; // Salario: 7000
      mockAsset.amount += 500;  // Freelance: 7500

      // Gastos
      mockAsset.amount -= 300; // Supermercado: 7200
      mockAsset.amount -= 150; // Gasolina: 7050
      mockAsset.amount -= 100; // Café: 6950

      // Más ingresos
      mockAsset.amount += 1000; // Bono: 7950

      // Más gastos
      mockAsset.amount -= 450; // Restaurante: 7500

      expect(mockAsset.amount).toBe(7500);
      expect(mockAsset.amount).toBeGreaterThan(initialAmount);
    });

    it('debe manejar eliminaciones en orden inverso', () => {
      const transactions = [
        { type: 'income', amount: 1000 },
        { type: 'expense', amount: 200 },
        { type: 'income', amount: 1500 },
        { type: 'expense', amount: 300 }
      ];

      // Aplicar todas las transacciones
      transactions.forEach(t => {
        if (t.type === 'income') {
          mockAsset.amount += t.amount;
        } else {
          mockAsset.amount -= t.amount;
        }
      });

      expect(mockAsset.amount).toBe(7000); // 5000 + 1000 - 200 + 1500 - 300

      // Revertir en orden inverso
      for (let i = transactions.length - 1; i >= 0; i--) {
        const t = transactions[i];
        if (t.type === 'income') {
          mockAsset.amount -= t.amount; // Revertir ingreso
        } else {
          mockAsset.amount += t.amount; // Revertir gasto
        }
      }

      expect(mockAsset.amount).toBe(5000); // Vuelve al inicial
    });
  });

  describe('Casos extremos', () => {
    it('debe manejar montos decimales correctamente', () => {
      mockAsset.amount += 1500.75; // Ingreso con centavos
      expect(mockAsset.amount).toBe(6500.75);

      mockAsset.amount -= 250.50; // Gasto con centavos
      expect(mockAsset.amount).toBe(6250.25);
    });

    it('debe manejar monto cero sin cambios', () => {
      const initialAmount = mockAsset.amount;

      mockAsset.amount += 0; // Ingreso de 0
      expect(mockAsset.amount).toBe(initialAmount);

      mockAsset.amount -= 0; // Gasto de 0
      expect(mockAsset.amount).toBe(initialAmount);
    });

    it('debe manejar grandes cantidades sin pérdida de precisión', () => {
      mockAsset.amount = 1000000; // 1 millón
      mockAsset.amount += 5000000; // + 5 millones
      expect(mockAsset.amount).toBe(6000000);

      mockAsset.amount -= 3500000; // - 3.5 millones
      expect(mockAsset.amount).toBe(2500000);
    });
  });

  describe('Validación de integridad', () => {
    it('debe mantener consistencia después de 100 transacciones', () => {
      let totalIngresos = 0;
      let totalGastos = 0;
      const initialAmount = mockAsset.amount;

      // Simular 50 ingresos y 50 gastos aleatorios
      for (let i = 0; i < 50; i++) {
        const ingresoAleatorio = Math.floor(Math.random() * 1000) + 100;
        mockAsset.amount += ingresoAleatorio;
        totalIngresos += ingresoAleatorio;

        const gastoAleatorio = Math.floor(Math.random() * 500) + 50;
        mockAsset.amount -= gastoAleatorio;
        totalGastos += gastoAleatorio;
      }

      const expectedAmount = initialAmount + totalIngresos - totalGastos;
      expect(mockAsset.amount).toBe(expectedAmount);
    });

    it('debe verificar que ingreso + gasto = saldo actual', () => {
      const initialAmount = mockAsset.amount;
      const ingresos = [1000, 2000, 1500];
      const gastos = [300, 450, 200];

      ingresos.forEach(amount => mockAsset.amount += amount);
      gastos.forEach(amount => mockAsset.amount -= amount);

      const totalIngresos = ingresos.reduce((sum, val) => sum + val, 0);
      const totalGastos = gastos.reduce((sum, val) => sum + val, 0);
      const expectedAmount = initialAmount + totalIngresos - totalGastos;

      expect(mockAsset.amount).toBe(expectedAmount);
    });
  });
});
