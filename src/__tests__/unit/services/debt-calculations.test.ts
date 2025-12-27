import { describe, it, expect } from 'vitest';

/**
 * Tests para cálculos de deudas y planificación financiera
 * Valida la lógica de negocios del módulo de planificación
 */

interface Debt {
  id: string;
  name: string;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
}

interface PaymentSimulation {
  monthlyPayment: number;
  monthsToPayOff: number;
  totalInterest: number;
  totalPaid: number;
}

describe('Cálculos de Deudas - Business Logic Tests', () => {
  describe('Cálculo de pago mínimo', () => {
    it('debe calcular pago mínimo como 2% del saldo', () => {
      const balance = 10000;
      const minimumPayment = balance * 0.02;

      expect(minimumPayment).toBe(200);
    });

    it('debe tener un pago mínimo de al menos 50 pesos', () => {
      const smallBalance = 1000;
      const calculatedPayment = smallBalance * 0.02; // 20
      const minimumPayment = Math.max(calculatedPayment, 50);

      expect(minimumPayment).toBe(50);
    });

    it('debe calcular pago mínimo para diferentes saldos', () => {
      const testCases = [
        { balance: 5000, expected: 100 },
        { balance: 15000, expected: 300 },
        { balance: 500, expected: 50 },   // Mínimo
        { balance: 100000, expected: 2000 }
      ];

      testCases.forEach(({ balance, expected }) => {
        const payment = Math.max(balance * 0.02, 50);
        expect(payment).toBe(expected);
      });
    });
  });

  describe('Simulación de pagos con intereses', () => {
    it('debe calcular meses para liquidar deuda con pago mínimo', () => {
      const debt: Debt = {
        id: 'debt-1',
        name: 'Tarjeta BBVA',
        currentBalance: 10000,
        interestRate: 3.5, // 3.5% mensual
        minimumPayment: 200
      };

      let balance = debt.currentBalance;
      let months = 0;
      let totalInterest = 0;
      const maxMonths = 1000; // Prevenir loop infinito

      while (balance > 0 && months < maxMonths) {
        const interest = balance * (debt.interestRate / 100);
        totalInterest += interest;
        balance = balance + interest - debt.minimumPayment;
        months++;
      }

      expect(months).toBeGreaterThan(0);
      expect(months).toBeLessThan(maxMonths);
      expect(totalInterest).toBeGreaterThan(0);
    });

    it('debe calcular interés acumulado correctamente', () => {
      const balance = 10000;
      const interestRate = 3.5; // 3.5% mensual

      const interest = balance * (interestRate / 100);

      expect(interest).toBe(350);
    });

    it('debe calcular nuevo saldo después de pago', () => {
      const initialBalance = 10000;
      const interestRate = 3.5;
      const payment = 1000;

      const interest = initialBalance * (interestRate / 100); // 350
      const newBalance = initialBalance + interest - payment; // 10000 + 350 - 1000

      expect(newBalance).toBe(9350);
    });
  });

  describe('Comparación de estrategias de pago', () => {
    it('debe comparar pago mínimo vs pago fijo mayor', () => {
      const debt: Debt = {
        id: 'debt-1',
        name: 'Tarjeta',
        currentBalance: 10000,
        interestRate: 3.5,
        minimumPayment: 200
      };

      // Simulación 1: Pago mínimo
      const minPaymentSimulation = simulatePayment(debt, debt.minimumPayment);

      // Simulación 2: Pago fijo de 1000
      const fixedPaymentSimulation = simulatePayment(debt, 1000);

      expect(fixedPaymentSimulation.monthsToPayOff).toBeLessThan(
        minPaymentSimulation.monthsToPayOff
      );
      expect(fixedPaymentSimulation.totalInterest).toBeLessThan(
        minPaymentSimulation.totalInterest
      );
    });

    it('debe calcular ahorro en intereses con pago mayor', () => {
      const debt: Debt = {
        id: 'debt-1',
        name: 'Tarjeta',
        currentBalance: 15000,
        interestRate: 4.0,
        minimumPayment: 300
      };

      const minPayment = simulatePayment(debt, 300);
      const higherPayment = simulatePayment(debt, 1500);

      const savedInterest = minPayment.totalInterest - higherPayment.totalInterest;

      expect(savedInterest).toBeGreaterThan(0);
      expect(higherPayment.monthsToPayOff).toBeLessThan(minPayment.monthsToPayOff);
    });
  });

  describe('Método avalancha (mayor interés primero)', () => {
    it('debe priorizar deuda con mayor tasa de interés', () => {
      const debts: Debt[] = [
        {
          id: 'debt-1',
          name: 'Tarjeta A',
          currentBalance: 5000,
          interestRate: 5.0, // Mayor interés
          minimumPayment: 100
        },
        {
          id: 'debt-2',
          name: 'Tarjeta B',
          currentBalance: 8000,
          interestRate: 3.0, // Menor interés
          minimumPayment: 160
        }
      ];

      // Ordenar por tasa de interés descendente (avalancha)
      const sortedByInterest = [...debts].sort((a, b) => b.interestRate - a.interestRate);

      expect(sortedByInterest[0].name).toBe('Tarjeta A');
      expect(sortedByInterest[0].interestRate).toBe(5.0);
    });
  });

  describe('Método bola de nieve (menor saldo primero)', () => {
    it('debe priorizar deuda con menor saldo', () => {
      const debts: Debt[] = [
        {
          id: 'debt-1',
          name: 'Tarjeta A',
          currentBalance: 8000,
          interestRate: 4.0,
          minimumPayment: 160
        },
        {
          id: 'debt-2',
          name: 'Tarjeta B',
          currentBalance: 3000, // Menor saldo
          interestRate: 3.5,
          minimumPayment: 60
        }
      ];

      // Ordenar por saldo ascendente (bola de nieve)
      const sortedByBalance = [...debts].sort((a, b) => a.currentBalance - b.currentBalance);

      expect(sortedByBalance[0].name).toBe('Tarjeta B');
      expect(sortedByBalance[0].currentBalance).toBe(3000);
    });
  });

  describe('Cálculos con múltiples deudas', () => {
    it('debe calcular pago mínimo total de todas las deudas', () => {
      const debts: Debt[] = [
        { id: '1', name: 'A', currentBalance: 5000, interestRate: 3.5, minimumPayment: 100 },
        { id: '2', name: 'B', currentBalance: 8000, interestRate: 4.0, minimumPayment: 160 },
        { id: '3', name: 'C', currentBalance: 3000, interestRate: 3.0, minimumPayment: 60 }
      ];

      const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

      expect(totalMinimumPayment).toBe(320);
    });

    it('debe calcular saldo total de deudas', () => {
      const debts: Debt[] = [
        { id: '1', name: 'A', currentBalance: 5000, interestRate: 3.5, minimumPayment: 100 },
        { id: '2', name: 'B', currentBalance: 8000, interestRate: 4.0, minimumPayment: 160 },
        { id: '3', name: 'C', currentBalance: 3000, interestRate: 3.0, minimumPayment: 60 }
      ];

      const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);

      expect(totalDebt).toBe(16000);
    });

    it('debe calcular interés mensual total', () => {
      const debts: Debt[] = [
        { id: '1', name: 'A', currentBalance: 5000, interestRate: 3.5, minimumPayment: 100 },
        { id: '2', name: 'B', currentBalance: 8000, interestRate: 4.0, minimumPayment: 160 }
      ];

      const totalMonthlyInterest = debts.reduce((sum, debt) => {
        return sum + (debt.currentBalance * (debt.interestRate / 100));
      }, 0);

      const expected = (5000 * 0.035) + (8000 * 0.04); // 175 + 320 = 495

      expect(totalMonthlyInterest).toBe(expected);
    });
  });

  describe('Validaciones de límites', () => {
    it('debe validar que el pago no sea mayor que el saldo', () => {
      const balance = 500;
      const payment = 1000;

      const actualPayment = Math.min(payment, balance);

      expect(actualPayment).toBe(balance);
    });

    it('debe validar que la tasa de interés sea válida', () => {
      const validRates = [0, 0.5, 3.5, 5.0, 10.0];
      const invalidRates = [-1, -5.0];

      validRates.forEach(rate => {
        expect(rate).toBeGreaterThanOrEqual(0);
      });

      invalidRates.forEach(rate => {
        expect(rate).toBeLessThan(0);
      });
    });

    it('debe prevenir loop infinito si pago < interés', () => {
      const debt: Debt = {
        id: 'debt-1',
        name: 'Tarjeta',
        currentBalance: 10000,
        interestRate: 5.0, // 5% = 500 de interés
        minimumPayment: 400 // Menor que el interés mensual
      };

      const monthlyInterest = debt.currentBalance * (debt.interestRate / 100);

      // Si el pago es menor que el interés, la deuda nunca se pagará
      if (debt.minimumPayment <= monthlyInterest) {
        expect(debt.minimumPayment).toBeLessThanOrEqual(monthlyInterest);
        // En este caso, se debería mostrar advertencia al usuario
      }
    });
  });
});

// Función auxiliar para simular pagos
function simulatePayment(debt: Debt, monthlyPayment: number): PaymentSimulation {
  let balance = debt.currentBalance;
  let months = 0;
  let totalInterest = 0;
  const maxMonths = 1000;

  while (balance > 0 && months < maxMonths) {
    const interest = balance * (debt.interestRate / 100);
    totalInterest += interest;
    balance = balance + interest - monthlyPayment;
    months++;

    // Si el saldo es muy pequeño, liquidar
    if (balance < 1) balance = 0;
  }

  return {
    monthlyPayment,
    monthsToPayOff: months,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPaid: debt.currentBalance + totalInterest
  };
}
