import React, { useState, useEffect } from 'react';
import type { Category } from '../../types';
import { DynamicIcon } from '../DynamicIcon';
import styles from './CategoryStyleModal.module.css';

interface CategoryStyleModalProps {
  category: Category;
  onClose: () => void;
  onSave: (style: { icon: string; color: string }) => void;
}

// Lista de iconos disponibles para elegir (puedes añadir más de lucide-react)
const AVAILABLE_ICONS = [
  'Pizza', 'Car', 'Home', 'Gamepad2', 'HeartPulse', 'ShoppingBag', 'Tag',
  'Plane', 'Gift', 'BookOpen', 'Briefcase', 'Film', 'Music', 'Droplets',
  'Fuel', 'GraduationCap', 'Landmark', 'Dog', 'Cat', 'Sprout'
];

// Paleta de colores para elegir
const COLOR_PALETTE = [
  '#FFC300', '#FF5733', '#C70039', '#900C3F', '#581845', '#2a9d8f',
  '#f4a261', '#e76f51', '#e63946', '#a8dadc', '#457b9d', '#1d3557'
];

export const CategoryStyleModal: React.FC<CategoryStyleModalProps> = ({ category, onClose, onSave }) => {
  const [selectedIcon, setSelectedIcon] = useState(category.icon || 'Tag');
  const [selectedColor, setSelectedColor] = useState(category.color || '#8d99ae');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    onSave({ icon: selectedIcon, color: selectedColor });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Personalizar "{category.name}"</h3>

        <div className={styles.section}>
          <label>Color</label>
          <div className={styles.grid}>
            {COLOR_PALETTE.map(color => (
              <button
                key={color}
                className={`${styles.colorSwatch} ${selectedColor === color ? styles.selected : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                aria-label={`Seleccionar color ${color}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label>Icono</label>
          <div className={styles.grid}>
            {AVAILABLE_ICONS.map(iconName => (
              <button
                key={iconName}
                className={`${styles.iconButton} ${selectedIcon === iconName ? styles.selected : ''}`}
                onClick={() => setSelectedIcon(iconName)}
                aria-label={`Seleccionar icono ${iconName}`}
              >
                <DynamicIcon name={iconName} size={24} />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={`${styles.button} ${styles.cancelButton}`}>Cancelar</button>
          <button onClick={handleSave} className={`${styles.button} ${styles.saveButton}`}>Guardar</button>
        </div>
      </div>
    </div>
  );
};