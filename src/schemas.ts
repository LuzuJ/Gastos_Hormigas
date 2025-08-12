import { z } from 'zod';

/**
 * Esquema de validación para el formulario de creación y edición de gastos.
 * Define las reglas que deben cumplir los datos antes de ser enviados.
 */
export const expenseFormSchema = z.object({
  description: z.string().min(3, { message: "La descripción debe tener al menos 3 caracteres." }),

  // 'coerce' intenta convertir el string del input a un número
  amount: z.coerce.number().positive({ message: "El monto debe ser un número positivo." }),

  // Nos aseguramos de que se haya seleccionado una categoría y subcategoría
  categoryId: z.string().min(1, { message: "Debes seleccionar una categoría." }),
  subCategory: z.string().min(1, { message: "Debes seleccionar una subcategoría." })
});