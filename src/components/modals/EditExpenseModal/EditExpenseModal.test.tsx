import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EditExpenseModal } from './EditExpenseModal';
import type { Category, Expense } from '../../../types';

// Mock Firebase Timestamp
const mockTimestamp = {
  toDate: () => new Date(),
  toMillis: () => Date.now(),
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: (Date.now() % 1000) * 1000000,
  isEqual: vi.fn(() => false),
  toJSON: vi.fn(() => ({}))
};

vi.mock('firebase/firestore', () => ({
  Timestamp: {
    now: vi.fn(() => mockTimestamp),
    fromDate: vi.fn((date: Date) => mockTimestamp)
  }
}));

// -- Mock de Datos --
const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Alimento', subcategories: [{ id: 'sub-1', name: 'Restaurante' }] },
  { id: 'cat-2', name: 'Transporte', subcategories: [{ id: 'sub-2', name: 'Gasolina' }] },
];

const mockExpenseToEdit: Expense = {
  id: 'exp-1',
  description: 'Cena de equipo',
  amount: 85.0,
  categoryId: 'cat-1',
  subCategory: 'Restaurante',
  createdAt: mockTimestamp as any,
};

describe('Componente EditExpenseModal', () => {

  it('debería renderizar el formulario con los datos del gasto a editar', () => {
    render(
      <EditExpenseModal
        expense={mockExpenseToEdit}
        categories={mockCategories}
        onClose={vi.fn()}
        onSave={vi.fn()} onAddSubCategory={function (categoryId: string, subCategoryName: string): Promise<void> {
          throw new Error('Function not implemented.');
        } }      />
    );

    // Verificamos que los campos están poblados con los datos del mock
    expect(screen.getByLabelText(/descripción/i)).toHaveValue(mockExpenseToEdit.description);
    expect(screen.getByLabelText(/monto/i)).toHaveValue(mockExpenseToEdit.amount);
    expect(screen.getByLabelText(/^categoría$/i)).toHaveValue(mockExpenseToEdit.categoryId);
  });

  it('debería llamar a onClose cuando se hace clic en el botón Cancelar', () => {
    const handleClose = vi.fn();
    render(
      <EditExpenseModal
        expense={mockExpenseToEdit}
        categories={mockCategories}
        onClose={handleClose}
        onSave={vi.fn()} onAddSubCategory={function (categoryId: string, subCategoryName: string): Promise<void> {
          throw new Error('Function not implemented.');
        } }      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('debería llamar a onSave con los datos actualizados', () => {
    const handleSave = vi.fn().mockResolvedValue({ success: true });
    render(
      <EditExpenseModal
        expense={mockExpenseToEdit}
        categories={mockCategories}
        onClose={vi.fn()}
        onSave={handleSave} onAddSubCategory={function (categoryId: string, subCategoryName: string): Promise<void> {
          throw new Error('Function not implemented.');
        } }      />
    );

    const descriptionInput = screen.getByLabelText(/descripción/i);
    fireEvent.change(descriptionInput, { target: { value: 'Cena de equipo actualizada' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(handleSave).toHaveBeenCalledWith('exp-1', {
      description: 'Cena de equipo actualizada',
      amount: 85.0,
      categoryId: 'cat-1',
      subCategory: 'Restaurante',
    });
  });

  // ESTA PRUEBA VA A FALLAR A PROPÓSITO
  it('debería mostrar un error de validación de Zod si la descripción es muy corta', async () => {
    render(
      <EditExpenseModal
        expense={mockExpenseToEdit}
        categories={mockCategories}
        onClose={vi.fn()}
        onSave={vi.fn()} onAddSubCategory={function (categoryId: string, subCategoryName: string): Promise<void> {
          throw new Error('Function not implemented.');
        } }      />
    );

    // Cambiamos la descripción a un valor inválido ("ab" tiene 2 caracteres)
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'ab' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    // Esperamos que aparezca el mensaje de error específico de nuestro esquema de Zod
    const errorMessage = await screen.findByText(/La descripción debe tener al menos 3 caracteres/i);
    expect(errorMessage).toBeInTheDocument();
  });
});