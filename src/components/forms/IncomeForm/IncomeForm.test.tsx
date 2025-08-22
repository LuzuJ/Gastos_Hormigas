// src/components/IncomeForm/IncomeForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IncomeForm } from './IncomeForm';

describe('Componente IncomeForm', () => {

  it('debería mostrar el ingreso actual y el botón para editar', () => {
    render(<IncomeForm currentIncome={5000} onSetIncome={vi.fn()} />);

    expect(screen.getByText('$5000.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /establecer o editar/i })).toBeInTheDocument();
  });

  it('debería cambiar a modo edición al hacer clic en el botón de editar', () => {
    render(<IncomeForm currentIncome={5000} onSetIncome={vi.fn()} />);

    const editButton = screen.getByRole('button', { name: /establecer o editar/i });
    fireEvent.click(editButton);

    // Verificamos que los elementos del modo edición ahora son visibles
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();

    // Verificamos que el botón de editar ya NO está visible
    expect(screen.queryByRole('button', { name: /establecer o editar/i })).not.toBeInTheDocument();
  });

  it('debería llamar a onSetIncome con el nuevo valor al guardar', () => {
    const handleSetIncome = vi.fn();
    render(<IncomeForm currentIncome={5000} onSetIncome={handleSetIncome} />);

    fireEvent.click(screen.getByRole('button', { name: /establecer o editar/i }));

    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '5500.75' } });

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(saveButton);

    expect(handleSetIncome).toHaveBeenCalledTimes(1);
    expect(handleSetIncome).toHaveBeenCalledWith(5500.75);
  });

  it('debería volver al modo de visualización sin llamar a onSetIncome al cancelar', () => {
    const handleSetIncome = vi.fn();
    render(<IncomeForm currentIncome={5000} onSetIncome={handleSetIncome} />);

    fireEvent.click(screen.getByRole('button', { name: /establecer o editar/i }));

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    // Verificamos que la función de guardado NUNCA fue llamada
    expect(handleSetIncome).not.toHaveBeenCalled();
    // Y que el botón de editar original está visible de nuevo
    expect(screen.getByRole('button', { name: /establecer o editar/i })).toBeInTheDocument();
  });
});