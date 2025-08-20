import React, { useState } from 'react';
import styles from './InputDialog.module.css';
import type { InputDialogState } from '../../hooks/useInputDialog';

interface InputDialogProps {
  state: InputDialogState | null;
}

const InputDialog: React.FC<InputDialogProps> = ({ state }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (state && state.isOpen) {
      setValue(state.defaultValue || '');
      setError(null);
    }
  }, [state?.isOpen, state?.defaultValue]);

  if (!state || !state.isOpen) return null;

  const handleConfirm = () => {
    if (state.validation) {
      const validationError = state.validation(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    state.onConfirm(value);
    setValue('');
    setError(null);
  };

  const handleCancel = () => {
    state.onCancel();
    setValue('');
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <span className={styles.icon}>💰</span>
          <h3 className={styles.title}>{state.title}</h3>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{state.message}</p>
          
          <input
            type={state.inputType}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={state.placeholder}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            autoFocus
          />
          
          {error && <p className={styles.error}>{error}</p>}
        </div>
        
        <div className={styles.actions}>
          <button 
            onClick={handleCancel}
            className={styles.cancelButton}
          >
            {state.cancelText}
          </button>
          <button 
            onClick={handleConfirm}
            className={styles.confirmButton}
          >
            {state.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputDialog;
