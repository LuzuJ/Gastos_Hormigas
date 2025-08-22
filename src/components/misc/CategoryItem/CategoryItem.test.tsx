import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CategoryItem } from './CategoryItem';
import type { Category, Expense } from '../../../types';

// -- Mock de Datos --
const mockCategory: Category = {
  id: 'cat-1',
  name: 'Hogar',
  budget: 500,
  subcategories: [{ id: 'sub-1', name: 'Servicios' }],
};
const mockExpenses: Expense[] = [];

describe('Componente CategoryItem', () => {
  it('debería estar cerrado por defecto y mostrar solo el encabezado', () => {
    render(<CategoryItem category={mockCategory} expenses={mockExpenses} onAddSubCategory={vi.fn()} onDeleteSubCategory={vi.fn()} onDeleteCategory={vi.fn()} onUpdateBudget={vi.fn()} onEditStyle={function (): void {
      throw new Error('Function not implemented.');
    } } />);

    expect(screen.getByText('Hogar')).toBeInTheDocument();
    // `queryByText` devuelve null si no encuentra el elemento, perfecto para verificar que algo NO está visible.
    expect(screen.queryByText('Subcategorías')).not.toBeInTheDocument();
  });

  it('debería expandirse y mostrar el contenido al hacer clic', () => {
    render(<CategoryItem category={mockCategory} expenses={mockExpenses} onAddSubCategory={vi.fn()} onDeleteSubCategory={vi.fn()} onDeleteCategory={vi.fn()} onUpdateBudget={vi.fn()} onEditStyle={function (): void {
      throw new Error('Function not implemented.');
    } } />);

    // Hacemos clic en el encabezado
    fireEvent.click(screen.getByText('Hogar'));

    // Ahora el contenido debería ser visible
    expect(screen.getByText('Subcategorías')).toBeInTheDocument();
    expect(screen.getByText('Presupuesto Mensual')).toBeInTheDocument();
  });

  // ESTA PRUEBA VA A FALLAR
  it('debería llamar a onUpdateBudget al editar y guardar el presupuesto', () => {
    const handleUpdateBudget = vi.fn();
    render(<CategoryItem category={mockCategory} expenses={mockExpenses} onAddSubCategory={vi.fn()} onDeleteSubCategory={vi.fn()} onDeleteCategory={vi.fn()} onUpdateBudget={handleUpdateBudget} onEditStyle={function (): void {
      throw new Error('Function not implemented.');
    } } />);

    // Expandimos el panel
    fireEvent.click(screen.getByText('Hogar'));

    // Entramos en modo edición de presupuesto
    fireEvent.click(screen.getByLabelText(/editar presupuesto/i)); // Asumimos que el botón de editar tiene un aria-label

    // Cambiamos el valor y guardamos
    const budgetInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(budgetInput, { target: { value: '600' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(handleUpdateBudget).toHaveBeenCalledTimes(1); 
    expect(handleUpdateBudget).toHaveBeenCalledWith('cat-1', 600);
  });
});