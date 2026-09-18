import { JournalEntry, Category } from '../models/ledger';
import { subDays } from 'date-fns';

export interface AntExpenseHeuristicConfig {
  maxThresholdAmount: number; // Por defecto $10 o $15 según la moneda
  frequentKeywords: string[];
}

export const DEFAULT_ANT_CONFIG: AntExpenseHeuristicConfig = {
  maxThresholdAmount: 15,
  frequentKeywords: [
    'cafe', 'coffee', 'chicle', 'dulce', 'snack', 'propina', 'tip',
    'estacionamiento', 'parquímetro', 'coca', 'refresco', 'agua',
    'uber', 'taxi', 'antojo', 'cigarrillo', 'golosina'
  ],
};

export class AntExpenseAnalytics {
  /**
   * Clasifica automáticamente si una transacción es un "Gasto Hormiga"
   * basada en monto, descripción y tags.
   */
  static isAntExpense(
    amount: number,
    description: string,
    tags: string[] = [],
    config: AntExpenseHeuristicConfig = DEFAULT_ANT_CONFIG
  ): boolean {
    if (tags.some(t => t.toLowerCase() === 'hormiga' || t.toLowerCase() === 'ant')) {
      return true;
    }

    if (amount <= 0 || amount > config.maxThresholdAmount) {
      return false;
    }

    const normalizedDesc = description
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const hasKeyword = config.frequentKeywords.some(kw => {
      const normalizedKw = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalizedDesc.includes(normalizedKw);
    });

    // Si el monto es muy bajo (ej: <= $5) o contiene keywords típicas
    return amount <= 5 || hasKeyword;
  }

  /**
   * Agrupa los gastos hormiga de los últimos N días por categoría y detecta fugas críticas
   */
  static analyzeLeaks(
    entries: JournalEntry[],
    categories: Category[],
    days: number = 30
  ): { categoryId: string; categoryName: string; totalSpent: number; count: number }[] {
    const cutoff = subDays(new Date(), days);
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    const antEntries = entries.filter(
      e => e.entryType === 'expense' && e.isAntExpense && new Date(e.timestamp) >= cutoff
    );

    const aggregates = new Map<string, { totalSpent: number; count: number }>();

    for (const entry of antEntries) {
      const catId = entry.categoryId || 'uncategorized';
      const existing = aggregates.get(catId) || { totalSpent: 0, count: 0 };
      aggregates.set(catId, {
        totalSpent: existing.totalSpent + entry.amount,
        count: existing.count + 1,
      });
    }

    return Array.from(aggregates.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: categoryMap.get(categoryId) || 'Sin Categoría',
        totalSpent: Math.round(data.totalSpent * 100) / 100,
        count: data.count,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }
}
