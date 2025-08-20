import { useState, useCallback } from 'react';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
}

export interface ConfirmDialogState extends ConfirmDialogConfig {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState | null>(null);

  const showConfirm = useCallback((config: ConfirmDialogConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        ...config,
        confirmText: config.confirmText || 'Confirmar',
        cancelText: config.cancelText || 'Cancelar',
        type: config.type || 'info',
        isOpen: true,
        onConfirm: () => {
          setDialogState(null);
          resolve(true);
        },
        onCancel: () => {
          setDialogState(null);
          resolve(false);
        }
      });
    });
  }, []);

  const hideDialog = useCallback(() => {
    setDialogState(null);
  }, []);

  return {
    dialogState,
    showConfirm,
    hideDialog
  };
};
