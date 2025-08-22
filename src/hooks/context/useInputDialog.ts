import { useState, useCallback } from 'react';

export interface InputDialogConfig {
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  inputType?: 'text' | 'number';
  confirmText?: string;
  cancelText?: string;
  validation?: (value: string) => string | null; // Retorna error o null si es válido
}

export interface InputDialogState extends InputDialogConfig {
  isOpen: boolean;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export const useInputDialog = () => {
  const [dialogState, setDialogState] = useState<InputDialogState | null>(null);

  const showInput = useCallback((config: InputDialogConfig): Promise<string | null> => {
    return new Promise((resolve) => {
      setDialogState({
        ...config,
        confirmText: config.confirmText || 'Confirmar',
        cancelText: config.cancelText || 'Cancelar',
        inputType: config.inputType || 'text',
        isOpen: true,
        onConfirm: (value: string) => {
          setDialogState(null);
          resolve(value);
        },
        onCancel: () => {
          setDialogState(null);
          resolve(null);
        }
      });
    });
  }, []);

  const hideDialog = useCallback(() => {
    setDialogState(null);
  }, []);

  return {
    dialogState,
    showInput,
    hideDialog
  };
};
