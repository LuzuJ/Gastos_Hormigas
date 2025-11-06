import { useMemo } from 'react';
import type { Expense } from '../../types';

interface DuplicateExpense {
  expense: Expense;
  similarity: number;
  daysDifference: number;
}

interface DuplicateDetectionResult {
  isDuplicate: boolean;
  duplicates: DuplicateExpense[];
  confidence: 'low' | 'medium' | 'high';
  message: string;
}

interface UseDuplicateDetectionProps {
  expenses: Expense[];
  newExpense: {
    description: string;
    amount: number;
    categoryId?: string;
  };
  timeWindowDays?: number; // Ventana de tiempo para considerar duplicados (default: 7 días)
  amountTolerance?: number; // Tolerancia en el monto (default: 0 para exacto)
}

export const useDuplicateDetection = ({
  expenses,
  newExpense,
  timeWindowDays = 7,
  amountTolerance = 0
}: UseDuplicateDetectionProps): DuplicateDetectionResult => {
  
  const duplicateAnalysis = useMemo(() => {
    // Si no hay descripción o monto, no podemos detectar duplicados
    if (!newExpense.description.trim() || newExpense.amount <= 0) {
      return {
        isDuplicate: false,
        duplicates: [],
        confidence: 'low' as const,
        message: ''
      };
    }

    const now = new Date();
    const timeWindow = timeWindowDays * 24 * 60 * 60 * 1000; // Convertir días a milisegundos
    
    // Filtrar gastos dentro de la ventana de tiempo
    const recentExpenses = expenses.filter(expense => {
      if (!expense.createdAt) return false;
      const expenseDate = new Date(expense.createdAt);
      const timeDifference = now.getTime() - expenseDate.getTime();
      return timeDifference <= timeWindow && timeDifference >= 0;
    });

    const potentialDuplicates: DuplicateExpense[] = [];

    for (const expense of recentExpenses) {
      const similarity = calculateSimilarity(newExpense, expense, amountTolerance);
      
      if (similarity > 0.6) { // Umbral de similitud
        const daysDifference = Math.floor(
          (now.getTime() - new Date(expense.createdAt!).getTime()) / (24 * 60 * 60 * 1000)
        );
        
        potentialDuplicates.push({
          expense,
          similarity,
          daysDifference
        });
      }
    }

    // Ordenar por similitud descendente
    potentialDuplicates.sort((a, b) => b.similarity - a.similarity);

    // Determinar nivel de confianza y mensaje
    let confidence: 'low' | 'medium' | 'high' = 'low';
    let message = '';

    if (potentialDuplicates.length > 0) {
      const highestSimilarity = potentialDuplicates[0].similarity;
      const mostRecentDays = potentialDuplicates[0].daysDifference;

      if (highestSimilarity >= 0.95) {
        confidence = 'high';
        message = `¡Posible duplicado! Encontramos un gasto muy similar registrado hace ${mostRecentDays} ${mostRecentDays === 1 ? 'día' : 'días'}.`;
      } else if (highestSimilarity >= 0.8) {
        confidence = 'medium';
        message = `Detectamos un gasto similar registrado recientemente. ¿Estás seguro de que no es un duplicado?`;
      } else {
        message = `Hay gastos parecidos registrados recientemente. Verifica que no sea un duplicado.`;
      }
    }

    return {
      isDuplicate: potentialDuplicates.length > 0,
      duplicates: potentialDuplicates,
      confidence,
      message
    };
  }, [expenses, newExpense.description, newExpense.amount, newExpense.categoryId, timeWindowDays, amountTolerance]);

  return duplicateAnalysis;
};

/**
 * Calcula la similitud entre un nuevo gasto y uno existente
 */
function calculateSimilarity(
  newExpense: { description: string; amount: number; categoryId?: string },
  existingExpense: Expense,
  amountTolerance: number
): number {
  let similarity = 0;
  let factors = 0;

  // Factor 1: Similitud en la descripción (peso: 40%)
  const descriptionSimilarity = calculateTextSimilarity(
    newExpense.description.toLowerCase().trim(),
    existingExpense.description.toLowerCase().trim()
  );
  similarity += descriptionSimilarity * 0.4;
  factors += 0.4;

  // Factor 2: Similitud en el monto (peso: 40%)
  const amountSimilarity = calculateAmountSimilarity(
    newExpense.amount,
    existingExpense.amount,
    amountTolerance
  );
  similarity += amountSimilarity * 0.4;
  factors += 0.4;

  // Factor 3: Misma categoría (peso: 20%)
  if (newExpense.categoryId && newExpense.categoryId === existingExpense.categoryId) {
    similarity += 0.2;
  }
  factors += 0.2;

  return factors > 0 ? similarity / factors : 0;
}

/**
 * Calcula similitud entre dos textos usando distancia de Levenshtein simplificada
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  if (text1 === text2) return 1;
  if (text1.length === 0 || text2.length === 0) return 0;

  // Similitud exacta
  if (text1 === text2) return 1;

  // Contiene uno al otro
  if (text1.includes(text2) || text2.includes(text1)) return 0.8;

  // Comparar palabras clave
  const words1 = text1.split(/\s+/).filter(w => w.length > 2);
  const words2 = text2.split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;

  let commonWords = 0;
  for (const word1 of words1) {
    if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
      commonWords++;
    }
  }

  return commonWords / Math.max(words1.length, words2.length);
}

/**
 * Calcula similitud entre dos montos considerando tolerancia
 */
function calculateAmountSimilarity(amount1: number, amount2: number, tolerance: number): number {
  if (amount1 === amount2) return 1;
  
  const difference = Math.abs(amount1 - amount2);
  
  // Si está dentro de la tolerancia, considerarlo exacto
  if (difference <= tolerance) return 1;
  
  // Calcular similitud basada en porcentaje de diferencia
  const average = (amount1 + amount2) / 2;
  const percentageDifference = difference / average;
  
  // Si la diferencia es mayor al 20%, no es similar
  if (percentageDifference > 0.2) return 0;
  
  // Similitud inversamente proporcional a la diferencia
  return Math.max(0, 1 - (percentageDifference / 0.2));
}
