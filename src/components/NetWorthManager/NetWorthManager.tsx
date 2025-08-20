import React, { useState } from 'react';
import styles from './NetWorthManagerNew.module.css';
import type { Asset, Liability, AssetFormData, LiabilityFormData } from '../../types';
import { Trash2, Edit, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface NetWorthManagerProps {
  assets: Asset[];
  liabilities: Liability[];
  onAddAsset: (data: AssetFormData) => void;
  onDeleteAsset: (id: string) => void;
  onUpdateAsset?: (id: string, data: Partial<AssetFormData>) => void;
  onAddLiability: (data: LiabilityFormData) => void;
  onDeleteLiability: (id: string) => void;
  onUpdateLiability?: (id: string, data: Partial<LiabilityFormData>) => void;
}

interface AssetFormProps {
  onAdd: (data: AssetFormData) => void;
  onClose: () => void;
  editingAsset?: Asset | null;
  onUpdate?: (id: string, data: Partial<AssetFormData>) => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ onAdd, onClose, editingAsset, onUpdate }) => {
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
              onChange={e => setFormData({...formData, name: e.target.value})}
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
              onChange={e => setFormData({...formData, value: e.target.value})}
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
              onChange={e => setFormData({...formData, type: e.target.value as any})}
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
              onChange={e => setFormData({...formData, description: e.target.value})}
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

const getAssetTypeLabel = (type: string) => {
  const labels = {
    cash: 'Efectivo',
    investment: 'Inversión',
    property: 'Propiedad'
  };
  return labels[type as keyof typeof labels] || 'Activo';
};

const getLiabilityTypeLabel = (type: string) => {
  const labels = {
    credit_card: 'Tarjeta de Crédito',
    loan: 'Préstamo',
    mortgage: 'Hipoteca',
    student_loan: 'Préstamo Estudiantil',
    other: 'Otro'
  };
  return labels[type as keyof typeof labels] || 'Pasivo';
};

export const NetWorthManager: React.FC<NetWorthManagerProps> = ({ 
  assets, 
  liabilities, 
  onAddAsset, 
  onDeleteAsset, 
  onUpdateAsset,
  onAddLiability, 
  onDeleteLiability,
  onUpdateLiability
}) => {
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  const handleCloseAssetForm = () => {
    setShowAssetForm(false);
    setEditingAsset(null);
  };


  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Columna de Activos */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.title}>
              <TrendingUp className={styles.titleIcon} />
              Activos
            </h3>
            <button 
              onClick={() => setShowAssetForm(true)} 
              className={styles.addButton}
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className={styles.itemsList}>
            {assets.map(asset => (
              <div key={asset.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{asset.name}</span>
                  <span className={styles.itemType}>{getAssetTypeLabel(asset.type)}</span>
                  {asset.description && (
                    <span className={styles.itemDescription}>{asset.description}</span>
                  )}
                </div>
                <div className={styles.itemActions}>
                  <span className={styles.itemValue}>{formatCurrency(asset.value)}</span>
                  <div className={styles.actionButtons}>
                    {onUpdateAsset && (
                      <button 
                        onClick={() => handleEditAsset(asset)}
                        className={styles.editButton}
                        title="Editar activo"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => onDeleteAsset(asset.id)} 
                      className={styles.deleteButton}
                      title="Eliminar activo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {assets.length === 0 && (
              <div className={styles.emptyState}>
                <p>No tienes activos registrados</p>
              </div>
            )}
          </div>
        </div>

        {/* Columna de Pasivos */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.title}>
              <TrendingDown className={styles.titleIcon} />
              Pasivos (Resumen)
            </h3>
          </div>
          
          <div className={styles.itemsList}>
            {liabilities.map(liability => (
              <div key={liability.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{liability.name}</span>
                  <span className={styles.itemType}>{getLiabilityTypeLabel(liability.type)}</span>
                  {liability.description && (
                    <span className={styles.itemDescription}>{liability.description}</span>
                  )}
                </div>
                <div className={styles.itemActions}>
                  <span className={styles.itemValue}>{formatCurrency(liability.amount)}</span>
                  <div className={styles.actionButtons}>
                    <button 
                      onClick={() => onDeleteLiability(liability.id)} 
                      className={styles.deleteButton}
                      title="Eliminar pasivo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {liabilities.length === 0 && (
              <div className={styles.emptyState}>
                <p>No tienes deudas registradas</p>
              </div>
            )}
          </div>

          <div className={styles.cardFooter}>
            <p className={styles.footerNote}>
              💡 Usa la sección "Gestión de Deudas" abajo para un control detallado de pagos
            </p>
          </div>
        </div>
      </div>

      {showAssetForm && (
        <AssetForm
          onAdd={onAddAsset}
          onClose={handleCloseAssetForm}
          editingAsset={editingAsset}
          onUpdate={onUpdateAsset}
        />
      )}
    </div>
  );
};