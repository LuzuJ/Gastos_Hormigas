import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, Pencil } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { Asset, AssetFormData } from '../../../types';
import styles from './PlanningSheets.module.css';

interface AssetDetailsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    assets: Asset[];
    onAddAsset: (data: AssetFormData) => Promise<{ success: boolean; error?: string }>;
    onUpdateAsset: (id: string, data: Partial<AssetFormData>) => Promise<{ success: boolean; error?: string }>;
    onDeleteAsset: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const AssetDetailsSheet: React.FC<AssetDetailsSheetProps> = ({
    isOpen, onClose, assets, onAddAsset, onUpdateAsset, onDeleteAsset
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newValue, setNewValue] = useState('');
    const [newType, setNewType] = useState('Liquid');

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim() && newValue.trim()) {
            const amount = parseFloat(newValue);
            if (!isNaN(amount)) {
                if (editingAssetId) {
                    await onUpdateAsset(editingAssetId, {
                        name: newName,
                        value: amount,
                        type: newType as any
                    });
                } else {
                    await onAddAsset({
                        name: newName,
                        value: amount,
                        type: newType as any,
                    });
                }
                resetForm();
            }
        }
    };

    const handleEditClick = (asset: Asset) => {
        setNewName(asset.name);
        setNewValue(asset.value.toString());
        setNewType(asset.type);
        setEditingAssetId(asset.id);
        setIsAdding(true);
    };

    const resetForm = () => {
        setNewName('');
        setNewValue('');
        setNewType('Liquid'); // Reset to default or keep previous selection? Default is safer.
        setEditingAssetId(null);
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Eliminar este activo?')) {
            const result = await onDeleteAsset(id);
            if (!result.success) {
                // Show a simple alert for now, or use toast if available
                const msg = result.error?.includes('foreign key')
                    ? 'No se puede eliminar este activo porque tiene registros asociados (Ingresos o Gastos). Elimina primero esos registros.'
                    : (result.error || 'No se pudo eliminar el activo.');
                alert(msg);
            }
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <div className={styles.iconBox} style={{ color: 'var(--success)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className={styles.title}>Mis Activos</h3>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {assets.length} activos registrados
                            </span>
                        </div>
                    </div>
                </div>

                {/* Add Section */}
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className={styles.closeButton} // Reusing style for big button
                        style={{ background: 'var(--primary)', color: 'white', marginBottom: '16px' }}
                    >
                        + Nuevo Activo
                    </button>
                ) : (
                    <div className={styles.section} style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px', marginBottom: '16px' }}>
                        <span className={styles.label}>{editingAssetId ? 'Editar Activo' : 'Agregar Activo'}</span>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Nombre (ej. Cuenta Ahorros)"
                                className={styles.input}
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="number"
                                    placeholder="Valor"
                                    className={styles.input}
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                />
                                <select
                                    className={styles.select}
                                    value={newType}
                                    onChange={e => setNewType(e.target.value)}
                                    style={{ width: '120px' }}
                                >
                                    <option value="Liquid">Líquido</option>
                                    <option value="Investment">Inversión</option>
                                    <option value="RealEstate">Inmueble</option>
                                    <option value="Crypto">Cripto</option>
                                    <option value="Other">Otro</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button type="submit" className={styles.btnPrimary} style={{ flex: 1 }}>Guardar</button>
                                <button type="button" onClick={resetForm} className={styles.closeButton} style={{ flex: 1, padding: '0' }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List Section */}
                <div className={styles.section}>
                    <span className={styles.label}>Lista de Activos</span>
                    <div className={styles.list}>
                        {assets.map(asset => (
                            <div key={asset.id} className={styles.listItem}>
                                <div className={styles.itemContent}>
                                    <span className={styles.itemName}>{asset.name}</span>
                                    <span className={styles.itemValue}>{asset.type}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                                        {formatCurrency(asset.value)}
                                    </span>
                                    <button
                                        className={styles.iconButton}
                                        onClick={() => handleEditClick(asset)}
                                        title="Editar"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(asset.id)}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {assets.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                                No tienes activos registrados.
                            </div>
                        )}
                    </div>
                </div>

                {/* Close Button */}
                <div className={styles.closeButtonContainer}>
                    <button onClick={onClose} className={styles.closeButton}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
