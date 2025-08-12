import React, { useState, useEffect } from 'react';
import styles from './AddFundsModal.module.css';

interface AddFundsModalProps {
  goalName: string;
  onClose: () => void;
  onSave: (amount: number) => void;
}

export const AddFundsModal: React.FC<AddFundsModalProps> = ({ goalName, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Por favor, ingresa un monto positivo.');
      return;
    }
    onSave(parsedAmount);
    onClose();
  };

  // Efecto para cerrar el modal con la tecla 'Escape'
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Añadir Fondos a "{goalName}"</h3>
        <p>Ingresa la cantidad que deseas agregar a tu meta de ahorro.</p>
        <div className={styles.formGroup}>
          <label htmlFor="amount">Monto ($)</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={styles.input}
            autoFocus
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button onClick={onClose} className={`${styles.button} ${styles.cancelButton}`}>
            Cancelar
          </button>
          <button onClick={handleSave} className={`${styles.button} ${styles.saveButton}`}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};