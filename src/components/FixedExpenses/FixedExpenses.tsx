import React, { useState } from 'react';
import styles from './FixedExpenses.module.css';
import { Trash2, TrendingDown } from 'lucide-react';
import type { Category, FixedExpense } from '../../types';

interface FixedExpensesProps {
  categories: Category[];
  fixedExpenses: FixedExpense[];
  onAdd: (data: Omit<FixedExpense, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const FixedExpenses: React.FC<FixedExpensesProps> = ({ categories, fixedExpenses, onAdd, onDelete }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || '');
  const [dayOfMonth, setDayOfMonth] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (description.trim() && !isNaN(parsedAmount) && parsedAmount > 0) {
      onAdd({
        description,
        amount: parsedAmount,
        category: category, 
        dayOfMonth,
      });
      setDescription('');
      setAmount('');
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <TrendingDown className={styles.icon} />
        <h3>Gastos Fijos Mensuales</h3>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción (ej. Renta)" className={styles.input}/>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Monto" className={styles.input}/>
        <select value={category} onChange={e => setCategory(e.target.value)} className={styles.select}>
          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
        </select>
        <input type="number" value={dayOfMonth} onChange={e => setDayOfMonth(parseInt(e.target.value, 10))} placeholder="Día de pago" min="1" max="31" className={styles.input}/>
        <button type="submit" className={styles.button}>Añadir</button>
      </form>

      <ul className={styles.list}>
        {fixedExpenses.map(item => (
          <li key={item.id} className={styles.listItem}>
            <span>{item.description} (${item.amount.toFixed(2)}) - Día {item.dayOfMonth}</span>
            <button onClick={() => onDelete(item.id)} className={styles.deleteButton}><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
};
