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
import { db } from '../config/firebase';
import type { PaymentSource, PaymentSourceType } from '../types';

class PaymentSourceService {
  private getPaymentSourcesCollection(userId: string) {
    return collection(db, 'users', userId, 'paymentSources');
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
          isActive: true,
          icon: '🏦',
          color: '#3B82F6'
        },
        {
          name: 'Tarjeta de Crédito',
          type: 'credit_card',
          description: 'Tarjeta de crédito principal',
          isActive: true,
          icon: '💳',
          color: '#F59E0B'
        },
        {
          name: 'Salario',
          type: 'income_salary',
          description: 'Ingreso principal del trabajo',
          isActive: true,
          icon: '💼',
          color: '#8B5CF6'
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
