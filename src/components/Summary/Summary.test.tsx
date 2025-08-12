import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Summary } from './Summary';

describe('Componente Summary', () => {

  it('debería mostrar el ingreso mensual correctamente formateado', () => {
    render(<Summary totalToday={0} totalMonth={0} monthlyIncome={1500} fixedExpensesTotal={0} />);
    const incomeLabel = screen.getByText(/ingreso mensual/i);
    const incomeBox = incomeLabel.parentElement as HTMLElement;
    const incomeValue = within(incomeBox).getByText(/\$1500\.00/);
    expect(incomeValue).toBeInTheDocument();
  });

  it('debería mostrar el total gastado hoy correctamente', () => {
    render(<Summary totalToday={120.50} totalMonth={500} monthlyIncome={2000} fixedExpensesTotal={100} />);
    expect(screen.getByText(/\$120\.50/i)).toBeInTheDocument();
  });

  it('debería mostrar un saldo restante positivo y con el estilo correcto', () => {
    render(<Summary totalToday={50} totalMonth={800} monthlyIncome={2000} fixedExpensesTotal={400} />);
    const balanceLabel = screen.getByText(/saldo restante/i);
    const balanceBox = balanceLabel.parentElement as HTMLElement;
    const balanceElement = within(balanceBox).getByText(/\$1200\.00/i);
    expect(balanceElement).toBeInTheDocument();
    expect(balanceElement.className).toContain('balancePositive');
  });

  it('debería mostrar un saldo restante negativo con el formato "- $VALOR"', () => {
    render(<Summary totalToday={50} totalMonth={2100} monthlyIncome={2000} fixedExpensesTotal={1500} />);

    const balanceElement = screen.getByText(/-\s*\$100\.00/i);

    expect(balanceElement).toBeInTheDocument();
    expect(balanceElement.className).toContain('balanceNegative');
  });

});