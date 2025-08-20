import React, { useState } from 'react';
import styles from './FixedExpenses.module.css';
import { Trash2, TrendingDown } from 'lucide-react';
import type { Category, FixedExpense } from '../../types';
import { Input, Button } from '../common';

interface FixedExpensesProps {
  categories: Category[];
  fixedExpenses: FixedExpense[];
  onAdd: (data: Omit<FixedExpense, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const FixedExpenses: React.FC<FixedExpensesProps> = ({ categories, fixedExpenses, onAdd, onDelete }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [dayOfMonth, setDayOfMonth] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (description.trim() && !isNaN(parsedAmount) && parsedAmount > 0 && categoryId) {
      onAdd({
        description,
        amount: parsedAmount,
        category: categoryId, // Guardamos el ID
        dayOfMonth,
      });
      setDescription('');
      setAmount('');
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <TrendingDown className={styles.icon} />
        <h3>Gastos Fijos Mensuales</h3>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción (ej. Renta)" />
        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Monto" />
        {/* El select ahora usa el categoryId */}
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={styles.select}>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        
        {/* 3. Reemplazamos el input de día por un select más intuitivo */}
        <select value={dayOfMonth} onChange={e => setDayOfMonth(Number(e.target.value))} className={styles.select}>
          {days.map(day => <option key={day} value={day}>Día {day}</option>)}
        </select>
        
        <Button type="submit" variant="primary">Añadir</Button>
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
