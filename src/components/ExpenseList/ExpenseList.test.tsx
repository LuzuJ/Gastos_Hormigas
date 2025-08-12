import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExpenseList } from './ExpenseList';
import type { Category, Expense } from '../../types';
import { Timestamp } from 'firebase/firestore';

// -- Mock de Datos --
const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Alimento', subcategories: [] },
  { id: 'cat-2', name: 'Transporte', subcategories: [] },
];

const mockExpenses: Expense[] = [
  { 
    id: 'exp-1', 
    description: 'Tacos al pastor', 
    amount: 15.50, 
    categoryId: 'cat-1', 
    subCategory: 'Restaurante', 
    createdAt: Timestamp.now() 
  },
  { 
    id: 'exp-2', 
    description: 'Ticket de metro', 
    amount: 2.75, 
    categoryId: 'cat-2', 
    subCategory: 'Transporte Público', 
    createdAt: Timestamp.now() 
  },
  {
    id: 'exp-3',
    description: 'Gasto antiguo',
    amount: 50.00,
    categoryId: 'cat-desconocida', // Categoria que no existe en nuestro mock
    subCategory: 'Varios',
    createdAt: Timestamp.now()
  }
];

describe('Componente ExpenseList', () => {

  it('debería mostrar un mensaje cuando no hay gastos', () => {
    render(<ExpenseList expenses={[]} categories={mockCategories} onDelete={vi.fn()} onEdit={vi.fn()} loading={false} />);
    expect(screen.getByText('¡Todo en orden!')).toBeInTheDocument();
  });

  it('debería renderizar una lista de gastos', () => {
    render(<ExpenseList expenses={mockExpenses} categories={mockCategories} onDelete={vi.fn()} onEdit={vi.fn()} loading={false} />);

    expect(screen.getByText('Tacos al pastor')).toBeInTheDocument();
    expect(screen.getByText('$15.50')).toBeInTheDocument();
    expect(screen.getByText('Alimento')).toBeInTheDocument(); // Verifica el nombre de la categoría

    expect(screen.getByText('Ticket de metro')).toBeInTheDocument();
    expect(screen.getByText('$2.75')).toBeInTheDocument();
    expect(screen.getByText('Transporte')).toBeInTheDocument();
  });

  it('debería llamar a onDelete con el ID correcto al hacer clic en eliminar', () => {
    const handleDelete = vi.fn();
    render(<ExpenseList expenses={mockExpenses} categories={mockCategories} onDelete={handleDelete} onEdit={vi.fn()} loading={false} />);

    // Buscamos el botón de eliminar asociado al primer gasto
    const deleteButtons = screen.getAllByLabelText(/eliminar gasto/i);
    fireEvent.click(deleteButtons[0]);

    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith('exp-1'); // Verificamos que se llamó con el ID del primer gasto
  });

  it('debería llamar a onEdit con el objeto de gasto correcto al hacer clic en editar', () => {
    const handleEdit = vi.fn();
    render(<ExpenseList expenses={mockExpenses} categories={mockCategories} onDelete={vi.fn()} onEdit={handleEdit} loading={false} />);

    const editButtons = screen.getAllByLabelText(/editar gasto/i);
    fireEvent.click(editButtons[1]); // Hacemos clic en el segundo botón de editar

    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleEdit).toHaveBeenCalledWith(mockExpenses[1]); // Verificamos que se llamó con el segundo objeto de gasto
  });

  it('debería mostrar "Desconocida" si la categoryId de un gasto no existe', () => {
    render(<ExpenseList expenses={mockExpenses} categories={mockCategories} onDelete={vi.fn()} onEdit={vi.fn()} loading={false} />);

    // Verificamos que para el gasto con la categoría inválida, se renderiza el texto "Desconocida"
    expect(screen.getByText('Desconocida')).toBeInTheDocument();
  });
});