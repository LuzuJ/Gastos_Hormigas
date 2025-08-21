import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Wallet } from 'lucide-react';
import { useFinancialsContext } from '../../contexts/FinancialsContext';
import { LoadingStateWrapper } from '../LoadingState/LoadingState';
import { Button } from '../common';
import { PaymentSourceModal } from './PaymentSourceModal';
import DuplicateCleanup from '../DuplicateCleanup';
import styles from './PaymentSourceManager.module.css';
import type { PaymentSource, PaymentSourceType } from '../../types';
import toast from 'react-hot-toast';

interface PaymentSourceManagerProps {
  className?: string;
  userId?: string | null;
}

export const PaymentSourceManager: React.FC<PaymentSourceManagerProps> = ({ className = '', userId = null }) => {
  const {
    paymentSources,
    loadingPaymentSources,
    paymentSourcesError,
    clearPaymentSourcesError,
    addPaymentSource,
    updatePaymentSource,
    deletePaymentSource,
    toggleActive
  } = useFinancialsContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<PaymentSource | null>(null);

  const handleAdd = () => {
    setEditingSource(null);
    setIsModalOpen(true);
  };

  const handleEdit = (source: PaymentSource) => {
    setEditingSource(source);
    setIsModalOpen(true);
  };

  const handleDelete = async (source: PaymentSource) => {
    if (window.confirm(`¿Estás seguro de eliminar "${source.name}"?`)) {
      const result = await deletePaymentSource(source.id);
      if (result.success) {
        toast.success('Fuente de pago eliminada');
      } else {
        toast.error(result.error || 'Error al eliminar');
      }
    }
  };

  const handleToggleActive = async (source: PaymentSource) => {
    const result = await toggleActive(source.id, !source.isActive);
    if (result.success) {
      toast.success(`Fuente ${source.isActive ? 'desactivada' : 'activada'}`);
    } else {
      toast.error(result.error || 'Error al cambiar estado');
    }
  };

  const handleModalSubmit = async (data: {
    name: string;
    type: PaymentSourceType;
    description?: string;
    balance?: number;
    icon?: string;
    color?: string;
  }) => {
    let result;
    
    if (editingSource) {
      result = await updatePaymentSource(editingSource.id, data);
    } else {
      result = await addPaymentSource(data);
    }

    if (result.success) {
      toast.success(editingSource ? 'Fuente actualizada' : 'Fuente agregada');
      setIsModalOpen(false);
      setEditingSource(null);
    } else {
      toast.error(result.error || 'Error al guardar');
    }
  };

  const formatCurrency = (amount?: number): string => {
    if (amount === undefined) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTypeLabel = (type: PaymentSourceType): string => {
    const labels: Record<PaymentSourceType, string> = {
      cash: 'Efectivo',
      checking: 'Cuenta Corriente',
      savings: 'Cuenta de Ahorros',
      credit_card: 'Tarjeta de Crédito',
      debit_card: 'Tarjeta de Débito',
      loan: 'Préstamo',
      income_salary: 'Salario',
      income_extra: 'Ingreso Extra',
      investment: 'Inversión',
      other: 'Otro'
    };
    return labels[type] || type;
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Wallet className={styles.titleIcon} />
          <h2 className={styles.title}>Fuentes de Pago</h2>
        </div>
        <Button 
          onClick={handleAdd}
          className={styles.addButton}
          icon={Plus}
        >
          Agregar Fuente
        </Button>
      </div>

      <LoadingStateWrapper
        loading={loadingPaymentSources}
        error={paymentSourcesError}
        onDismissError={clearPaymentSourcesError}
        loadingMessage="Cargando fuentes de pago..."
      >
        {paymentSources.length === 0 ? (
          <div className={styles.emptyState}>
            <Wallet className={styles.emptyIcon} />
            <h3>No hay fuentes de pago</h3>
            <p>Agrega tu primera fuente de pago para llevar mejor control de tus gastos.</p>
            <Button onClick={handleAdd} icon={Plus}>
              Agregar Primera Fuente
            </Button>
          </div>
        ) : (
          <div className={styles.grid}>
            {paymentSources.map((source) => (
              <div 
                key={source.id} 
                className={`${styles.card} ${!source.isActive ? styles.inactive : ''}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.sourceInfo}>
                    <span 
                      className={styles.sourceIcon}
                      style={{ color: source.color }}
                    >
                      {source.icon}
                    </span>
                    <div className={styles.sourceDetails}>
                      <h3 className={styles.sourceName}>{source.name}</h3>
                      <span className={styles.sourceType}>
                        {getTypeLabel(source.type)}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.cardActions}>
                    <button
                      onClick={() => handleToggleActive(source)}
                      className={`${styles.actionButton} ${source.isActive ? styles.activeButton : styles.inactiveButton}`}
                      title={source.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {source.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleEdit(source)}
                      className={styles.actionButton}
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(source)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {source.description && (
                  <p className={styles.sourceDescription}>{source.description}</p>
                )}

                {source.balance !== undefined && (
                  <div className={styles.balance}>
                    <span className={styles.balanceLabel}>Saldo:</span>
                    <span className={styles.balanceAmount}>
                      {formatCurrency(source.balance)}
                    </span>
                  </div>
                )}

                {!source.isActive && (
                  <div className={styles.inactiveLabel}>
                    Inactiva
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </LoadingStateWrapper>

      {/* Componente para limpiar duplicados */}
      <DuplicateCleanup 
        userId={userId}
        onCleanupComplete={() => {
          // Opcional: refrescar la lista después de la limpieza
          toast.success('Duplicados eliminados correctamente');
        }}
      />

      {isModalOpen && (
        <PaymentSourceModal
          source={editingSource}
          onSubmit={handleModalSubmit}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSource(null);
          }}
        />
      )}
    </div>
  );
};
