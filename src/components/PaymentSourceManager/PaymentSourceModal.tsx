import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button, Input } from '../common';
import styles from './PaymentSourceModal.module.css';
import type { PaymentSource, PaymentSourceType } from '../../types';

interface PaymentSourceModalProps {
  source?: PaymentSource | null;
  onSubmit: (data: {
    name: string;
    type: PaymentSourceType;
    description?: string;
    balance?: number;
    icon?: string;
    color?: string;
  }) => void;
  onClose: () => void;
}

const PAYMENT_SOURCE_TYPES: { value: PaymentSourceType; label: string; icon: string; color: string }[] = [
  { value: 'cash', label: 'Efectivo', icon: '💵', color: '#10B981' },
  { value: 'checking', label: 'Cuenta Corriente', icon: '🏦', color: '#3B82F6' },
  { value: 'savings', label: 'Cuenta de Ahorros', icon: '🏛️', color: '#06B6D4' },
  { value: 'credit_card', label: 'Tarjeta de Crédito', icon: '💳', color: '#F59E0B' },
  { value: 'debit_card', label: 'Tarjeta de Débito', icon: '💳', color: '#8B5CF6' },
  { value: 'loan', label: 'Préstamo', icon: '📄', color: '#EF4444' },
  { value: 'income_salary', label: 'Salario', icon: '💼', color: '#8B5CF6' },
  { value: 'income_extra', label: 'Ingreso Extra', icon: '💰', color: '#10B981' },
  { value: 'investment', label: 'Inversión', icon: '📈', color: '#F97316' },
  { value: 'other', label: 'Otro', icon: '📝', color: '#6B7280' }
];

export const PaymentSourceModal: React.FC<PaymentSourceModalProps> = ({
  source,
  onSubmit,
  onClose
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PaymentSourceType>('cash');
  const [description, setDescription] = useState('');
  const [balance, setBalance] = useState('');
  const [customIcon, setCustomIcon] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (source) {
      setName(source.name);
      setType(source.type);
      setDescription(source.description || '');
      setBalance(source.balance?.toString() || '');
      setCustomIcon(source.icon || '');
      setCustomColor(source.color || '');
    }
  }, [source]);

  const selectedTypeInfo = PAYMENT_SOURCE_TYPES.find(t => t.value === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    const data = {
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      balance: balance ? parseFloat(balance) : undefined,
      icon: customIcon || selectedTypeInfo?.icon,
      color: customColor || selectedTypeInfo?.color
    };

    onSubmit(data);
  };

  const handleTypeChange = (newType: PaymentSourceType) => {
    setType(newType);
    const typeInfo = PAYMENT_SOURCE_TYPES.find(t => t.value === newType);
    if (typeInfo && !customIcon) {
      setCustomIcon(typeInfo.icon);
    }
    if (typeInfo && !customColor) {
      setCustomColor(typeInfo.color);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {source ? 'Editar Fuente de Pago' : 'Agregar Fuente de Pago'}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Nombre <span className={styles.required}>*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Mi cuenta principal"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <span className={styles.label}>
              Tipo de Fuente <span className={styles.required}>*</span>
            </span>
            <div className={styles.typeGrid}>
              {PAYMENT_SOURCE_TYPES.map((typeOption) => (
                <button
                  key={typeOption.value}
                  type="button"
                  onClick={() => handleTypeChange(typeOption.value)}
                  className={`${styles.typeOption} ${type === typeOption.value ? styles.selected : ''}`}
                >
                  <span className={styles.typeIcon}>{typeOption.icon}</span>
                  <span className={styles.typeLabel}>{typeOption.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Descripción
            </label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="balance" className={styles.label}>
              Saldo (opcional)
            </label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className={styles.customizationSection}>
            <h3 className={styles.sectionTitle}>Personalización</h3>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="icon" className={styles.label}>
                  Icono
                </label>
                <Input
                  id="icon"
                  type="text"
                  value={customIcon}
                  onChange={(e) => setCustomIcon(e.target.value)}
                  placeholder={selectedTypeInfo?.icon}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="color" className={styles.label}>
                  Color
                </label>
                <div className={styles.colorInput}>
                  <Input
                    id="color"
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className={styles.colorPicker}
                  />
                  <Input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder={selectedTypeInfo?.color}
                    className={styles.colorText}
                  />
                </div>
              </div>
            </div>

            <div className={styles.preview}>
              <span className={styles.previewLabel}>Vista previa:</span>
              <div className={styles.previewItem}>
                <span 
                  className={styles.previewIcon}
                  style={{ color: customColor || selectedTypeInfo?.color }}
                >
                  {customIcon || selectedTypeInfo?.icon}
                </span>
                <span className={styles.previewName}>
                  {name || 'Nombre de la fuente'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              {source ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
