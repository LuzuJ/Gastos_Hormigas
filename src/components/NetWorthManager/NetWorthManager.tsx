import React, { useState } from 'react';
import styles from './NetWorthManager.module.css';
import type { Asset, Liability, AssetFormData, LiabilityFormData } from '../../types';
import { Trash2 } from 'lucide-react';

interface NetWorthManagerProps {
  assets: Asset[];
  liabilities: Liability[];
  onAddAsset: (data: AssetFormData) => void;
  onDeleteAsset: (id: string) => void;
  onAddLiability: (data: LiabilityFormData) => void;
  onDeleteLiability: (id: string) => void;
}

// Un pequeño formulario reutilizable
const EntryForm: React.FC<{ onAdd: (name: string, value: number) => void; placeholder: string }> = ({ onAdd, placeholder }) => {
    const [name, setName] = useState('');
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numValue = parseFloat(value);
        if (name.trim() && !isNaN(numValue) && numValue > 0) {
            onAdd(name.trim(), numValue);
            setName('');
            setValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={placeholder} className={styles.input} />
            <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Valor" className={styles.input} />
            <button type="submit" className={styles.button}>Añadir</button>
        </form>
    );
};


export const NetWorthManager: React.FC<NetWorthManagerProps> = ({ assets, liabilities, onAddAsset, onDeleteAsset, onAddLiability, onDeleteLiability }) => {

  const handleAddAsset = (name: string, value: number) => {
    onAddAsset({ name, value, type: 'cash' }); // Tipo por defecto
  };

  const handleAddLiability = (name: string, amount: number) => {
    onAddLiability({ name, amount, type: 'loan' }); // Tipo por defecto
  };

  return (
    <div className={styles.grid}>
      {/* Columna de Activos */}
      <div className={styles.card}>
        <h3 className={styles.title}>Activos</h3>
        <EntryForm onAdd={handleAddAsset} placeholder="Ej: Cuenta de Ahorros" />
        <ul className={styles.list}>
          {assets.map(asset => (
            <li key={asset.id}>
              <span>{asset.name}</span>
              <span>${asset.value.toFixed(2)}</span>
              <button onClick={() => onDeleteAsset(asset.id)} className={styles.deleteButton}><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      </div>

      {/* Columna de Pasivos */}
      <div className={styles.card}>
        <h3 className={styles.title}>Pasivos</h3>
        <EntryForm onAdd={handleAddLiability} placeholder="Ej: Préstamo Estudiantil" />
        <ul className={styles.list}>
          {liabilities.map(liability => (
            <li key={liability.id}>
              <span>{liability.name}</span>
              <span>${liability.amount.toFixed(2)}</span>
              <button onClick={() => onDeleteLiability(liability.id)} className={styles.deleteButton}><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};