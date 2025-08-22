import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Summary } from './Summary';

describe('Componente Summary', () => {

  it('debería mostrar el ingreso mensual correctamente formateado', () => {
    render(<Summary totalToday={0} totalMonth={0} monthlyIncome={1500} fixedExpensesTotal={0} />);
    const incomeLabel = screen.getByText(/ingreso mensual/i);
    const incomeBox = incomeLabel.parentElement as HTMLElement;
    // El formato mexicano muestra $1,500 sin decimales para números enteros
    const incomeValue = within(incomeBox).getByText(/\$1,500/);
    expect(incomeValue).toBeInTheDocument();
  });

  it('debería mostrar el total gastado hoy correctamente', () => {
    render(<Summary totalToday={120.50} totalMonth={500} monthlyIncome={2000} fixedExpensesTotal={100} />);
    // El formato mexicano muestra $120.5 para decimales
    expect(screen.getByText(/\$120\.5/i)).toBeInTheDocument();
  });

  it('debería mostrar un saldo disponible positivo y con el estilo correcto', () => {
    render(<Summary totalToday={50} totalMonth={800} monthlyIncome={2000} fixedExpensesTotal={400} />);
    // El texto real es "Saldo Disponible", no "saldo restante"
    const balanceLabel = screen.getByText(/saldo disponible/i);
    const balanceBox = balanceLabel.parentElement as HTMLElement;
    // Balance: 2000 - (800 + 400) = 800, formato: $800
    const balanceElement = within(balanceBox).getByText(/\$800/i);
    expect(balanceElement).toBeInTheDocument();
    expect(balanceElement.className).toContain('balancePos');
  });

  it('debería mostrar un sobregiro negativo correctamente', () => {
    render(<Summary totalToday={50} totalMonth={2100} monthlyIncome={2000} fixedExpensesTotal={1500} />);
    
    // Cuando el balance es negativo, el texto cambia a "Sobregiro"
    const sobregirogLabel = screen.getByText(/sobregiro/i);
    const balanceBox = sobregirogLabel.parentElement as HTMLElement;
    // Balance: 2000 - (2100 + 1500) = -1600, se muestra como valor absoluto: $1,600
    const balanceElement = within(balanceBox).getByText(/\$1,600/i);

    expect(balanceElement).toBeInTheDocument();
    expect(balanceElement.className).toContain('balanceNeg');
  });

});