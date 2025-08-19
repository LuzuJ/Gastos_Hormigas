import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { DebtPaymentStrategy } from '../types';

export interface DebtPaymentStrategyFormData {
  name: string;
  type: 'snowball' | 'avalanche' | 'custom';
  priorityOrder: string[]; // IDs de deudas en orden de prioridad
  monthlyExtraBudget: number;
  isActive: boolean;
  description?: string;
}

type DebtPaymentStrategiesCallback = (data: DebtPaymentStrategy[]) => void;

class DebtPaymentStrategyService {
  private getCollectionRef(userId: string) {
    return collection(db, 'users', userId, 'debtPaymentStrategies');
  }

  // Suscribirse a actualizaciones de estrategias de pago
  onDebtPaymentStrategiesUpdate(userId: string, callback: DebtPaymentStrategiesCallback) {
    const q = query(
      this.getCollectionRef(userId),
      orderBy('lastUpdated', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const strategies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DebtPaymentStrategy));
      
      callback(strategies);
    });
  }

  // Agregar una nueva estrategia de pago
  async addDebtPaymentStrategy(userId: string, data: DebtPaymentStrategyFormData) {
    try {
      const now = Timestamp.now();
      
      const strategyData = {
        ...data,
        createdAt: now,
        lastUpdated: now
      };

      const docRef = await addDoc(this.getCollectionRef(userId), strategyData);
      
      // Si es la estrategia activa, desactivar las demás
      if (data.isActive) {
        await this.setActiveStrategy(userId, docRef.id);
      }
      
      return docRef;
    } catch (error) {
      console.error('Error al agregar estrategia de pago:', error);
      throw error;
    }
  }

  // Actualizar una estrategia de pago existente
  async updateDebtPaymentStrategy(userId: string, strategyId: string, data: Partial<DebtPaymentStrategyFormData>) {
    try {
      const now = Timestamp.now();
      
      const updateData = {
        ...data,
        lastUpdated: now
      };

      await updateDoc(doc(db, 'users', userId, 'debtPaymentStrategies', strategyId), updateData);
      
      // Si es la estrategia activa, desactivar las demás
      if (data.isActive) {
        await this.setActiveStrategy(userId, strategyId);
      }
      
      return true;
    } catch (error) {
      console.error('Error al actualizar estrategia de pago:', error);
      throw error;
    }
  }

  // Eliminar una estrategia de pago
  async deleteDebtPaymentStrategy(userId: string, strategyId: string) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'debtPaymentStrategies', strategyId));
      return true;
    } catch (error) {
      console.error('Error al eliminar estrategia de pago:', error);
      throw error;
    }
  }

  // Establecer una estrategia como activa (desactivando las demás)
  async setActiveStrategy(userId: string, activeStrategyId: string) {
    try {
      const collectionRef = this.getCollectionRef(userId);
      const q = query(collectionRef, where('isActive', '==', true));
      
      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          try {
            // Desactivar todas las estrategias activas
            const updates = snapshot.docs.map(doc => 
              updateDoc(doc.ref, { isActive: false, lastUpdated: Timestamp.now() })
            );
            
            await Promise.all(updates);
            
            // Activar la estrategia seleccionada
            await updateDoc(
              doc(db, 'users', userId, 'debtPaymentStrategies', activeStrategyId), 
              { isActive: true, lastUpdated: Timestamp.now() }
            );
            
            unsubscribe();
            resolve(true);
          } catch (error) {
            unsubscribe();
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error al establecer estrategia activa:', error);
      throw error;
    }
  }

  // Obtener la estrategia activa
  async getActiveStrategy(userId: string): Promise<DebtPaymentStrategy | null> {
    try {
      const q = query(
        this.getCollectionRef(userId),
        where('isActive', '==', true),
        orderBy('lastUpdated', 'desc')
      );

      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(q, (snapshot) => {
          try {
            if (snapshot.empty) {
              resolve(null);
            } else {
              const strategy = {
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data()
              } as DebtPaymentStrategy;
              resolve(strategy);
            }
            unsubscribe();
          } catch (error) {
            unsubscribe();
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error al obtener estrategia activa:', error);
      throw error;
    }
  }

  // Calcular métricas de una estrategia
  calculateStrategyMetrics(
    strategy: DebtPaymentStrategy, 
    liabilities: any[]
  ): {
    estimatedMonthsToPayoff: number;
    totalInterestSaved: number;
    monthlyProgress: { month: number; remainingDebt: number; interestPaid: number }[];
  } {
    try {
      const { priorityOrder, monthlyExtraBudget } = strategy;
      let extraBudget = monthlyExtraBudget;
      let totalMonths = 0;
      let totalInterestSaved = 0;
      const monthlyProgress: { month: number; remainingDebt: number; interestPaid: number }[] = [];

      // Calcular interés base (sin estrategia)
      let baseInterest = 0;
      liabilities.forEach(liability => {
        const monthlyPayment = liability.monthlyPayment || Math.max(liability.amount * 0.02, 25);
        const interestRate = (liability.interestRate || 0) / 100 / 12;
        
        if (interestRate > 0) {
          const months = Math.ceil(
            -Math.log(1 - (liability.amount * interestRate) / monthlyPayment) / 
            Math.log(1 + interestRate)
          );
          const totalPayments = isFinite(months) ? months * monthlyPayment : liability.amount;
          baseInterest += Math.max(0, totalPayments - liability.amount);
        }
      });

      // Simular estrategia
      let strategyInterest = 0;
      priorityOrder.forEach((debtId: string) => {
        const liability = liabilities.find(l => l.id === debtId);
        if (!liability) return;

        const baseMonthlyPayment = liability.monthlyPayment || Math.max(liability.amount * 0.02, 25);
        const totalMonthlyPayment = baseMonthlyPayment + extraBudget;
        const interestRate = (liability.interestRate || 0) / 100 / 12;
        
        let months = 0;
        if (interestRate > 0) {
          months = Math.ceil(
            -Math.log(1 - (liability.amount * interestRate) / totalMonthlyPayment) / 
            Math.log(1 + interestRate)
          );
          const totalPayments = isFinite(months) ? months * totalMonthlyPayment : liability.amount;
          strategyInterest += Math.max(0, totalPayments - liability.amount);
        } else {
          months = Math.ceil(liability.amount / totalMonthlyPayment);
        }

        totalMonths = Math.max(totalMonths, months);
        extraBudget += baseMonthlyPayment; // El pago mínimo se convierte en extra para la siguiente deuda
      });

      totalInterestSaved = Math.max(0, baseInterest - strategyInterest);

      return {
        estimatedMonthsToPayoff: isFinite(totalMonths) ? totalMonths : 999,
        totalInterestSaved,
        monthlyProgress
      };
    } catch (error) {
      console.error('Error al calcular métricas de estrategia:', error);
      return {
        estimatedMonthsToPayoff: 999,
        totalInterestSaved: 0,
        monthlyProgress: []
      };
    }
  }
}

export const debtPaymentStrategyService = new DebtPaymentStrategyService();
