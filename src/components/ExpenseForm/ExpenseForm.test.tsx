// src/components/ExpenseForm/ExpenseForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExpenseForm } from './ExpenseForm';
import type { Category } from '../../types';

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Alimento',
    isDefault: true,
    subcategories: [
      { id: 's1', name: 'Supermercado' },
      { id: 's2', name: 'Restaurante' },
    ],
  },
  {
    id: '2',
    name: 'Transporte',
    subcategories: [{ id: 's3', name: 'Gasolina' }],
  },
];

describe('Componente ExpenseForm', () => {

  it('debería renderizar todos los campos del formulario', () => {
    render(<ExpenseForm onAdd={vi.fn()} categories={mockCategories} isSubmitting={false} onAddSubCategory={function (categoryId: string, subCategoryName: string): Promise<void> {
      throw new Error('Function not implemented.');
    } } expenses={[]} />);

    // CORRECCIÓN: Usamos /^categoría$/i para una coincidencia exacta.
    // El ^ significa "inicio de la cadena" y $ significa "fin de la cadena".
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^categoría$/i)).toBeInTheDocument(); // Coincidencia exacta
    expect(screen.getByLabelText(/subcategoría/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agregar gasto/i })).toBeInTheDocument();
  });

  it('debería permitir al usuario escribir en los campos de descripción y monto', () => {
    render(<ExpenseForm onAdd={vi.fn()} categories={mockCategories} isSubmitting={false} onAddSubCategory={function (categoryId: string, subCategoryName: string): Promise<void> {
      throw new Error('Function not implemented.');
    } } expenses={[]} />);

    const descriptionInput = screen.getByLabelText(/descripción/i);
    const amountInput = screen.getByLabelText(/monto/i);

    fireEvent.change(descriptionInput, { target: { value: 'Café de la mañana' } });
    fireEvent.change(amountInput, { target: { value: '2.50' } });

    expect(descriptionInput).toHaveValue('Café de la mañana');
    expect(amountInput).toHaveValue(2.50);
  });

  it('debería mostrar un error de validación si se envía el formulario vacío', async () => {
    render(<ExpenseForm onAdd={vi.fn()} categories={mockCategories} isSubmitting={false} onAddSubCategory={function (categoryId: string, subCategoryName: string): Promise<void> {
      throw new Error('Function not implemented.');
    } } expenses={[]} />);

    const submitButton = screen.getByRole('button', { name: /agregar gasto/i });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText(/La descripción debe tener al menos 3 caracteres/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('debería llamar a la función onAdd con los datos correctos al enviar el formulario válido', () => {
    const handleAdd = vi.fn().mockResolvedValue({ success: true }); // Mockeamos la función
    render(<ExpenseForm onAdd={handleAdd} categories={mockCategories} isSubmitting={false} onAddSubCategory={function (categoryId: string, subCategoryName: string): Promise<void> {
      throw new Error('Function not implemented.');
    } } expenses={[]} />);

    // Simulamos el llenado del formulario
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Almuerzo' } });
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '12' } });

    // CORRECCIÓN: Usamos la coincidencia exacta aquí también
    fireEvent.change(screen.getByLabelText(/^categoría$/i), { target: { value: '1' } }); 
    fireEvent.change(screen.getByLabelText(/subcategoría/i), { target: { value: 'Restaurante' } });

    fireEvent.click(screen.getByRole('button', { name: /agregar gasto/i }));

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith({
      description: 'Almuerzo',
      amount: 12,
      categoryId: '1',
      subCategory: 'Restaurante',
    });
  });
});