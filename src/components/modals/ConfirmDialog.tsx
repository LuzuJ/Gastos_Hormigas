import React from 'react';
import styles from './ConfirmDialog.module.css';
import type { ConfirmDialogState } from '../../hooks/useConfirmDialog';
import { Button } from '../common';

interface ConfirmDialogProps {
  state: ConfirmDialogState | null;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ state }) => {
  if (!state || !state.isOpen) return null;

  const typeColors = {
    info: '#007bff',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545'
  };

  const typeIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    danger: '❌'
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header} style={{ borderTopColor: typeColors[state.type || 'info'] }}>
          <span className={styles.icon}>{typeIcons[state.type || 'info']}</span>
          <h3 className={styles.title}>{state.title}</h3>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{state.message}</p>
        </div>
        
        <div className={styles.actions}>
          <Button 
            onClick={state.onCancel}
            variant="outline"
            className={styles.cancelButton}
          >
            {state.cancelText}
          </Button>
          <Button 
            onClick={state.onConfirm}
            variant={state.type === 'danger' ? 'danger' : 'primary'}
            className={styles.confirmButton}
          >
            {state.confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
