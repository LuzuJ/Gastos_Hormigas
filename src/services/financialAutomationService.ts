import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  runTransaction,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { 
  PaymentSource, 
  RecurringIncome, 
  AutomaticTransaction, 
  FinancialAlert, 
  Transaction,
  PaymentSourceBalance,
  EnhancedExpense
} from '../types';

export class FinancialAutomationService {
  private readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // === BALANCE MANAGEMENT ===

  /**
   * Actualiza el saldo de una fuente de pago
   */
  async updatePaymentSourceBalance(
    paymentSourceId: string, 
    newBalance: number,
    transaction?: Transaction
  ): Promise<void> {
    const paymentSourceRef = doc(db, 'users', this.userId, 'paymentSources', paymentSourceId);
    
    await runTransaction(db, async (transaction) => {
      const paymentSourceDoc = await transaction.get(paymentSourceRef);
      
      if (!paymentSourceDoc.exists()) {
        throw new Error('Fuente de pago no encontrada');
      }

      transaction.update(paymentSourceRef, {
        balance: newBalance,
        lastUpdated: Timestamp.now()
      });

      // Si hay una transacción asociada, registrarla
      if (transaction) {
        const transactionRef = doc(collection(db, 'users', this.userId, 'transactions'));
        transaction.set(transactionRef, {
          ...transaction,
          id: transactionRef.id,
          createdAt: Timestamp.now()
        });
      }
    });
  }

  /**
   * Procesa un gasto automáticamente descontando del saldo
   */
  async processExpenseWithBalance(
    expense: EnhancedExpense,
    paymentSourceId: string
  ): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    try {
      const paymentSourceRef = doc(db, 'users', this.userId, 'paymentSources', paymentSourceId);
      
      return await runTransaction(db, async (transaction) => {
        const paymentSourceDoc = await transaction.get(paymentSourceRef);
        
        if (!paymentSourceDoc.exists()) {
          return { success: false, error: 'Fuente de pago no encontrada' };
        }

        const paymentSource = paymentSourceDoc.data() as PaymentSource;
        const currentBalance = paymentSource.balance || 0;
        
        if (currentBalance < expense.amount) {
          // Crear alerta de saldo insuficiente
          await this.createAlert({
            type: 'low_balance',
            title: 'Saldo Insuficiente',
            message: `No hay suficiente saldo en ${paymentSource.name} para el gasto de ${expense.amount}`,
            severity: 'high',
            actionable: true,
            data: { paymentSourceId, expenseAmount: expense.amount, currentBalance }
          });
          
          return { success: false, error: 'Saldo insuficiente' };
        }

        const newBalance = currentBalance - expense.amount;

        // Actualizar saldo
        transaction.update(paymentSourceRef, {
          balance: newBalance,
          lastUpdated: Timestamp.now()
        });

        // Registrar transacción
        const transactionRef = doc(collection(db, 'users', this.userId, 'transactions'));
        transaction.set(transactionRef, {
          id: transactionRef.id,
          type: 'expense',
          amount: expense.amount,
          description: expense.description,
          date: expense.createdAt,
          fromPaymentSourceId: paymentSourceId,
          categoryId: expense.categoryId,
          isAutomatic: expense.isAutomatic || false,
          relatedId: expense.id,
          createdAt: Timestamp.now()
        });

        // Verificar si necesitamos crear alertas
        if (newBalance < 100) { // Alerta si queda menos de $100
          await this.createAlert({
            type: 'low_balance',
            title: 'Saldo Bajo',
            message: `El saldo de ${paymentSource.name} es bajo: $${newBalance.toFixed(2)}`,
            severity: newBalance < 50 ? 'critical' : 'medium',
            actionable: true,
            data: { paymentSourceId, balance: newBalance }
          });
        }

        return { success: true, newBalance };
      });
    } catch (error) {
      console.error('Error processing expense with balance:', error);
      return { success: false, error: 'Error procesando el gasto' };
    }
  }

  // === RECURRING INCOME MANAGEMENT ===

  /**
   * Crea un ingreso recurrente
   */
  async createRecurringIncome(income: Omit<RecurringIncome, 'id'>): Promise<string> {
    const docRef = await addDoc(
      collection(db, 'users', this.userId, 'recurringIncomes'),
      {
        ...income,
        createdAt: Timestamp.now()
      }
    );
    return docRef.id;
  }

  /**
   * Procesa ingresos recurrentes pendientes
   */
  async processRecurringIncomes(): Promise<void> {
    const now = Timestamp.now();
    const recurringIncomesRef = collection(db, 'users', this.userId, 'recurringIncomes');
    const q = query(
      recurringIncomesRef,
      where('isActive', '==', true),
      where('nextDate', '<=', now)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    for (const docSnapshot of snapshot.docs) {
      const income = docSnapshot.data() as RecurringIncome;
      
      // Procesar el ingreso
      if (income.paymentSourceId) {
        const paymentSourceRef = doc(db, 'users', this.userId, 'paymentSources', income.paymentSourceId);
        const paymentSourceDoc = await getDoc(paymentSourceRef);
        
        if (paymentSourceDoc.exists()) {
          const paymentSource = paymentSourceDoc.data() as PaymentSource;
          const newBalance = (paymentSource.balance || 0) + income.amount;
          
          batch.update(paymentSourceRef, {
            balance: newBalance,
            lastUpdated: now
          });

          // Registrar transacción
          const transactionRef = doc(collection(db, 'users', this.userId, 'transactions'));
          batch.set(transactionRef, {
            id: transactionRef.id,
            type: 'income',
            amount: income.amount,
            description: `Ingreso recurrente: ${income.name}`,
            date: now,
            toPaymentSourceId: income.paymentSourceId,
            isAutomatic: true,
            relatedId: income.id,
            createdAt: now
          });

          // Crear alerta de ingreso recibido
          await this.createAlert({
            type: 'income_received',
            title: 'Ingreso Recibido',
            message: `Se ha procesado el ingreso de ${income.name}: $${income.amount}`,
            severity: 'low',
            actionable: false,
            data: { incomeId: income.id, amount: income.amount, paymentSourceId: income.paymentSourceId }
          });
        }
      }

      // Calcular próxima fecha
      const nextDate = this.calculateNextDate(income.nextDate, income.frequency);
      
      batch.update(docSnapshot.ref, {
        lastProcessed: now,
        nextDate: nextDate
      });
    }

    await batch.commit();
  }

  // === ALERTS MANAGEMENT ===

  /**
   * Crea una nueva alerta financiera
   */
  async createAlert(alertData: Omit<FinancialAlert, 'id' | 'isRead' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(
      collection(db, 'users', this.userId, 'financialAlerts'),
      {
        ...alertData,
        isRead: false,
        createdAt: Timestamp.now()
      }
    );
    return docRef.id;
  }

  /**
   * Obtiene alertas activas
   */
  subscribeToAlerts(callback: (alerts: FinancialAlert[]) => void): () => void {
    const alertsRef = collection(db, 'users', this.userId, 'financialAlerts');
    const q = query(
      alertsRef,
      where('isRead', '==', false),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const alerts: FinancialAlert[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FinancialAlert));
      callback(alerts);
    });
  }

  /**
   * Marca una alerta como leída
   */
  async markAlertAsRead(alertId: string): Promise<void> {
    const alertRef = doc(db, 'users', this.userId, 'financialAlerts', alertId);
    await updateDoc(alertRef, { isRead: true });
  }

  // === BALANCE PROJECTIONS ===

  /**
   * Calcula proyecciones de saldo para una fuente de pago
   */
  async getPaymentSourceProjection(paymentSourceId: string, days: number = 30): Promise<PaymentSourceBalance> {
    const paymentSourceRef = doc(db, 'users', this.userId, 'paymentSources', paymentSourceId);
    const paymentSourceDoc = await getDoc(paymentSourceRef);
    
    if (!paymentSourceDoc.exists()) {
      throw new Error('Fuente de pago no encontrada');
    }

    const paymentSource = paymentSourceDoc.data() as PaymentSource;
    const currentBalance = paymentSource.balance || 0;
    
    // Obtener transacciones futuras
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    const [pendingIncome, pendingExpenses] = await Promise.all([
      this.getPendingIncome(paymentSourceId, Timestamp.fromDate(endDate)),
      this.getPendingExpenses(paymentSourceId, Timestamp.fromDate(endDate))
    ]);

    const projectedBalance = currentBalance + pendingIncome - pendingExpenses;

    return {
      paymentSourceId,
      name: paymentSource.name,
      type: paymentSource.type,
      currentBalance,
      projectedBalance,
      lastUpdated: paymentSource.lastUpdated || Timestamp.now(),
      pendingTransactions: {
        income: pendingIncome,
        expenses: pendingExpenses
      }
    };
  }

  // === UTILITY METHODS ===

  private calculateNextDate(currentDate: Timestamp, frequency: RecurringIncome['frequency']): Timestamp {
    const date = currentDate.toDate();
    
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return Timestamp.fromDate(date);
  }

  private async getPendingIncome(paymentSourceId: string, endDate: Timestamp): Promise<number> {
    const recurringIncomesRef = collection(db, 'users', this.userId, 'recurringIncomes');
    const q = query(
      recurringIncomesRef,
      where('paymentSourceId', '==', paymentSourceId),
      where('isActive', '==', true),
      where('nextDate', '<=', endDate)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.reduce((total, doc) => {
      const income = doc.data() as RecurringIncome;
      return total + income.amount;
    }, 0);
  }

  private async getPendingExpenses(paymentSourceId: string, endDate: Timestamp): Promise<number> {
    const automaticTransactionsRef = collection(db, 'users', this.userId, 'automaticTransactions');
    const q = query(
      automaticTransactionsRef,
      where('fromPaymentSourceId', '==', paymentSourceId),
      where('type', '==', 'expense'),
      where('isActive', '==', true),
      where('nextDate', '<=', endDate)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.reduce((total, doc) => {
      const transaction = doc.data() as AutomaticTransaction;
      return total + transaction.amount;
    }, 0);
  }
}

export const createFinancialAutomationService = (userId: string) => {
  return new FinancialAutomationService(userId);
};
