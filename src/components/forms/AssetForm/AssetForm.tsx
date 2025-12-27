import React, { useState } from 'react';
import styles from './AssetForm.module.css';
import type { Asset, AssetFormData } from '../../../types';

interface AssetFormProps {
    onAdd: (data: AssetFormData) => void;
    onClose: () => void;
    editingAsset?: Asset | null;
    onUpdate?: (id: string, data: Partial<AssetFormData>) => void;
}

export const AssetForm: React.FC<AssetFormProps> = ({ onAdd, onClose, editingAsset, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: editingAsset?.name || '',
        value: editingAsset?.value?.toString() || '',
        type: editingAsset?.type || 'cash' as const,
        description: editingAsset?.description || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const value = parseFloat(formData.value);

        if (formData.name.trim() && !isNaN(value) && value >= 0) {
            const assetData = {
                name: formData.name.trim(),
                value,
                type: formData.type,
                description: formData.description || undefined
            };

            if (editingAsset && onUpdate) {
                onUpdate(editingAsset.id, assetData);
            } else {
                onAdd(assetData);
            }
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h3>{editingAsset ? 'Editar Activo' : 'Agregar Activo'}</h3>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="asset-name">Nombre del activo:</label>
                        <input
                            id="asset-name"
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Cuenta de Ahorros"
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="asset-value">Valor:</label>
                        <input
                            id="asset-value"
                            type="number"
                            value={formData.value}
                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                            onWheel={(e) => e.preventDefault()}
                            onFocus={(e) => e.target.select()}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required
                            className={styles.input}
                            aria-labelledby="asset-value-label"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="asset-type">Tipo de activo:</label>
                        <select
                            id="asset-type"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            className={styles.select}
                        >
                            <option value="cash">Efectivo/Cuenta Bancaria</option>
                            <option value="investment">Inversión</option>
                            <option value="property">Propiedad/Inmueble</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="asset-description">Descripción (opcional):</label>
                        <input
                            id="asset-description"
                            type="text"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Información adicional..."
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.addButton}>
                            {editingAsset ? 'Actualizar' : 'Agregar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
