import React from 'react';
import DebtManager from '../DebtManager/DebtManager';
import { ErrorBoundaryWrapper } from './ErrorBoundaryWrapper';
import { useExpensesContext, useCategoriesContext } from '../../contexts/AppContext';
import { useNotificationsContext } from '../../contexts/NotificationsContext';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import type { Liability } from '../../types';

interface DebtManagerSectionProps {
  liabilities: Liability[];
  onAddLiability: (data: any) => Promise<{ success: boolean; error?: string }>;
  onUpdateLiability: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
  onDeleteLiability: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const DebtManagerErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => {
  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ff6b6b',
      borderRadius: '8px',
      backgroundColor: '#ffe0e0',
      color: '#d63031',
      margin: '10px 0'
    }}>
      <h3>Error en gestión de deudas</h3>
      <p>Hay un problema con el gestor de deudas. Los demás componentes seguirán funcionando.</p>
      <button 
        onClick={retry}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#d63031',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Reintentar
      </button>
    </div>
  );
};

export const DebtManagerSection: React.FC<DebtManagerSectionProps> = ({
  liabilities,
  onAddLiability,
  onUpdateLiability,
  onDeleteLiability
}) => {
  const { addExpense } = useExpensesContext();
  const { categories } = useCategoriesContext();
  const { addNotification } = useNotificationsContext();

  // Implementación real del onMakePayment
  const handleMakePayment = async (liabilityId: string, amount: number, paymentType: 'regular' | 'extra' | 'interest_only', description?: string) => {
    console.log('� Iniciando registro de pago:', { liabilityId, amount, paymentType });
    
    try {
      // 1. Encontrar la deuda
      const liability = liabilities.find(l => l.id === liabilityId);
      if (!liability) {
        console.error('❌ Deuda no encontrada para ID:', liabilityId);
        addNotification({
          message: '❌ Error: Deuda no encontrada',
          type: 'danger'
        });
        return;
      }

      console.log('✅ Deuda encontrada:', liability);

      // 2. Calcular el nuevo saldo de la deuda
      const newAmount = Math.max(0, liability.amount - amount);
      console.log('💰 Nuevo saldo calculado:', newAmount);
      
      // 4. Actualizar la deuda con el nuevo saldo
      console.log('🔄 Actualizando deuda...');
      try {
        const updateData: any = {
          amount: newAmount,
          lastUpdated: new Date()
        };

        // Si la deuda está completamente pagada, archivarla
        if (newAmount === 0) {
          updateData.isArchived = true;
          updateData.archivedAt = Timestamp.now();
          console.log('📦 Archivando deuda completamente pagada');
        }

        const updateResult = await onUpdateLiability(liabilityId, updateData);

        if (updateResult && !updateResult.success) {
          console.error('❌ Error al actualizar la deuda:', updateResult.error);
          addNotification({
            message: `❌ Error al actualizar la deuda: ${updateResult.error}`,
            type: 'danger'
          });
          return;
        }

        console.log('✅ Deuda actualizada exitosamente');
      } catch (updateError) {
        console.error('❌ Error en actualización de deuda:', updateError);
        addNotification({
          message: '❌ Error al actualizar la deuda. Pago no registrado.',
          type: 'danger'
        });
        return;
      }

      // 5. Buscar o crear categoría de "Deudas" para registrar el pago como gasto
      let debtCategoryId = categories.find(cat => 
        cat.name.toLowerCase().includes('deuda') || 
        cat.name.toLowerCase().includes('pago')
      )?.id;

      // Si no existe una categoría de deudas, usar 'otros' como fallback
      if (!debtCategoryId) {
        debtCategoryId = categories.find(cat => 
          cat.name.toLowerCase().includes('otro')
        )?.id || categories[0]?.id || 'otros';
      }

      console.log('📁 Categoría seleccionada:', debtCategoryId);
      console.log('📁 Categorías disponibles:', categories.map(c => ({ id: c.id, name: c.name })));

      // 6. Registrar el pago como un gasto
      const paymentDescription = description || `Pago ${paymentType === 'regular' ? 'mínimo' : 'extra'} - ${liability.name}`;
      
      console.log('💳 Registrando gasto:', {
        amount: amount,
        description: paymentDescription,
        categoryId: debtCategoryId,
        subCategory: paymentType === 'regular' ? 'Pago Mínimo' : 'Pago Extra',
      });

      await addExpense({
        amount: amount,
        description: paymentDescription,
        categoryId: debtCategoryId,
        subCategory: paymentType === 'regular' ? 'Pago Mínimo' : 'Pago Extra',
        createdAt: Timestamp.now(),
      });

      console.log('✅ Pago registrado exitosamente');

      // Mostrar toast de éxito como en el registro normal de gastos
      toast.success('¡Pago registrado como gasto con éxito!');

      // Mostrar mensaje de éxito usando notificaciones personalizadas
      if (newAmount === 0) {
        addNotification({
          message: `🎉 ¡Felicidades! Has pagado completamente la deuda "${liability.name}"`,
          type: 'success'
        });
      } else {
        addNotification({
          message: `✅ Pago registrado exitosamente. Saldo restante: $${newAmount.toFixed(2)}`,
          type: 'success'
        });
      }

    } catch (error) {
      console.error('❌ Error al registrar el pago:', error);
      addNotification({
        message: '❌ Error al registrar el pago. Inténtalo de nuevo.',
        type: 'danger'
      });
    }
  };

  return (
    <ErrorBoundaryWrapper 
      componentName="DebtManager" 
      fallback={DebtManagerErrorFallback}
    >
      <DebtManager
        liabilities={liabilities}
        onAddLiability={onAddLiability}
        onUpdateLiability={onUpdateLiability}
        onDeleteLiability={onDeleteLiability}
        onMakePayment={handleMakePayment}
      />
    </ErrorBoundaryWrapper>
  );
};
