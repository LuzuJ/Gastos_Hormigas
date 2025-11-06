/**
 * @deprecated Este servicio está obsoleto y será eliminado en futuras versiones.
 * Utilizar paymentSourceServiceRepo en su lugar que implementa el patrón repositorio.
 */
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  query,
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { PaymentSource, PaymentSourceType } from '../../types';

class PaymentSourceService {
  private getPaymentSourcesCollection(userId: string) {
    return collection(db, 'users', userId, 'paymentSources');
  }

  // Limpiar fuentes de pago duplicadas
  async cleanupDuplicatePaymentSources(userId: string): Promise<void> {
    try {
      const paymentSourcesRef = this.getPaymentSourcesCollection(userId);
      const snapshot = await getDocs(paymentSourcesRef);
      
      const sourcesMap = new Map<string, PaymentSource[]>();
      
      // Agrupar por tipo
      snapshot.docs.forEach(doc => {
        const source = { id: doc.id, ...doc.data() } as PaymentSource;
        const key = `${source.type}-${source.name}`;
        
        if (!sourcesMap.has(key)) {
          sourcesMap.set(key, []);
        }
        sourcesMap.get(key)!.push(source);
      });
      
      // Eliminar duplicados, manteniendo solo el primero
      for (const [key, sources] of sourcesMap) {
        if (sources.length > 1) {
          console.log(`Found ${sources.length} duplicates for ${key}, removing ${sources.length - 1}`);
          
          // Mantener el primer documento, eliminar el resto
          for (let i = 1; i < sources.length; i++) {
            await deleteDoc(doc(paymentSourcesRef, sources[i].id));
            console.log(`Deleted duplicate: ${sources[i].name} (${sources[i].id})`);
          }
        }
      }
      
      console.log('Cleanup completed successfully');
    } catch (error) {
      console.error('Error cleaning up duplicate payment sources:', error);
    }
  }

  // Crear fuentes de pago por defecto para nuevos usuarios
  async createDefaultPaymentSources(userId: string): Promise<void> {
    try {
      const paymentSourcesRef = this.getPaymentSourcesCollection(userId);
      
      // Verificar si ya existen fuentes de pago
      const existingSources = await getDocs(paymentSourcesRef);
      if (!existingSources.empty) {
        // Si ya hay fuentes, no crear más para evitar duplicados
        console.log('Payment sources already exist, skipping default creation');
        return;
      }

      const defaultSources: Omit<PaymentSource, 'id'>[] = [
        {
          name: 'Efectivo',
          type: 'cash',
          description: 'Dinero en efectivo',
          isActive: true,
          icon: '💵',
          color: '#10B981'
        },
        {
          name: 'Cuenta Corriente',
          type: 'checking',
          description: 'Cuenta bancaria principal',
          isActive: false,
          icon: '🏦',
          color: '#3B82F6'
        },
        {
          name: 'Cuenta de Ahorros',
          type: 'savings',
          description: 'Cuenta de ahorros',
          isActive: false,
          icon: '🏛️',
          color: '#06B6D4'
        },
        {
          name: 'Tarjeta de Crédito',
          type: 'credit_card',
          description: 'Tarjeta de crédito principal',
          isActive: false,
          icon: '💳',
          color: '#F59E0B'
        },
        {
          name: 'Tarjeta de Débito',
          type: 'debit_card',
          description: 'Tarjeta de débito',
          isActive: false,
          icon: '💳',
          color: '#8B5CF6'
        },
        {
          name: 'Préstamo',
          type: 'loan',
          description: 'Préstamo bancario',
          isActive: false,
          icon: '📄',
          color: '#EF4444'
        },
        {
          name: 'Salario',
          type: 'income_salary',
          description: 'Ingreso principal del trabajo',
          isActive: false,
          icon: '💼',
          color: '#8B5CF6'
        },
        {
          name: 'Ingreso Extra',
          type: 'income_extra',
          description: 'Ingresos adicionales',
          isActive: false,
          icon: '💰',
          color: '#10B981'
        },
        {
          name: 'Inversión',
          type: 'investment',
          description: 'Inversiones y activos',
          isActive: false,
          icon: '📈',
          color: '#F97316'
        },
        {
          name: 'Otro',
          type: 'other',
          description: 'Otras fuentes de pago',
          isActive: false,
          icon: '📝',
          color: '#6B7280'
        }
      ];

      // Crear fuentes por defecto solo si no existen
      for (const source of defaultSources) {
        // Verificación adicional por nombre y tipo antes de crear
        const existingQuery = query(
          paymentSourcesRef,
          where('name', '==', source.name),
          where('type', '==', source.type)
        );
        const existingDocs = await getDocs(existingQuery);
        
        if (existingDocs.empty) {
          await addDoc(paymentSourcesRef, source);
          console.log(`Created default payment source: ${source.name}`);
        } else {
          console.log(`Payment source already exists: ${source.name}`);
        }
      }
    } catch (error) {
      console.error('Error creating default payment sources:', error);
      // No lanzar el error para no interrumpir la aplicación
    }
  }

  // Agregar nueva fuente de pago
  async addPaymentSource(userId: string, paymentSourceData: Omit<PaymentSource, 'id'>): Promise<void> {
    const paymentSourcesRef = this.getPaymentSourcesCollection(userId);
    await addDoc(paymentSourcesRef, paymentSourceData);
  }

  // Actualizar fuente de pago
  async updatePaymentSource(userId: string, paymentSourceId: string, updates: Partial<PaymentSource>): Promise<void> {
    const paymentSourceRef = doc(this.getPaymentSourcesCollection(userId), paymentSourceId);
    await updateDoc(paymentSourceRef, updates);
  }

  // Eliminar fuente de pago
  async deletePaymentSource(userId: string, paymentSourceId: string): Promise<void> {
    const paymentSourceRef = doc(this.getPaymentSourcesCollection(userId), paymentSourceId);
    await deleteDoc(paymentSourceRef);
  }

  // Suscribirse a cambios en las fuentes de pago
  onPaymentSourcesUpdate(userId: string, callback: (paymentSources: PaymentSource[]) => void): () => void {
    const paymentSourcesRef = this.getPaymentSourcesCollection(userId);
    const q = query(paymentSourcesRef, orderBy('name'));

    return onSnapshot(q, (snapshot) => {
      const paymentSources: PaymentSource[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PaymentSource));
      callback(paymentSources);
    });
  }

  // Obtener fuentes de pago activas
  async getActivePaymentSources(userId: string): Promise<PaymentSource[]> {
    const paymentSourcesRef = this.getPaymentSourcesCollection(userId);
    const q = query(
      paymentSourcesRef, 
      where('isActive', '==', true),
      orderBy('name')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentSource));
  }

  // Obtener todas las fuentes de pago (una sola vez)
  async getPaymentSourcesOnce(userId: string): Promise<PaymentSource[]> {
    const paymentSourcesRef = this.getPaymentSourcesCollection(userId);
    const q = query(paymentSourcesRef, orderBy('name'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentSource));
  }

  // Actualizar balance de una fuente de pago
  async updateBalance(userId: string, paymentSourceId: string, newBalance: number): Promise<void> {
    const paymentSourceRef = doc(this.getPaymentSourcesCollection(userId), paymentSourceId);
    await updateDoc(paymentSourceRef, { 
      balance: newBalance,
      lastUpdated: Timestamp.now()
    });
  }

  // Obtener iconos por defecto para tipos de fuentes de pago
  getDefaultIcon(type: PaymentSourceType): string {
    const iconMap: Record<PaymentSourceType, string> = {
      cash: '💵',
      checking: '🏦',
      savings: '🏛️',
      credit_card: '💳',
      debit_card: '💳',
      loan: '📄',
      income_salary: '💼',
      income_extra: '💰',
      investment: '📈',
      other: '📝'
    };
    return iconMap[type] || '📝';
  }

  // Obtener color por defecto para tipos de fuentes de pago
  getDefaultColor(type: PaymentSourceType): string {
    const colorMap: Record<PaymentSourceType, string> = {
      cash: '#10B981',      // Verde
      checking: '#3B82F6',   // Azul
      savings: '#06B6D4',    // Cyan
      credit_card: '#F59E0B', // Amarillo/Naranja
      debit_card: '#8B5CF6',  // Púrpura
      loan: '#EF4444',       // Rojo
      income_salary: '#8B5CF6', // Púrpura
      income_extra: '#10B981',  // Verde
      investment: '#F97316',    // Naranja
      other: '#6B7280'         // Gris
    };
    return colorMap[type] || '#6B7280';
  }

  // Obtener nombre por defecto para tipos de fuentes de pago
  getDefaultName(type: PaymentSourceType): string {
    const nameMap: Record<PaymentSourceType, string> = {
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
    return nameMap[type] || 'Fuente de Pago';
  }
}

export const paymentSourceService = new PaymentSourceService();
