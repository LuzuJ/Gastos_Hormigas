import { 
  collection, 
  doc, 
  getDocs,
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { PaymentSource } from '../../types';

/**
 * Servicio para limpiar fuentes de pago duplicadas
 */
class DuplicateCleanupService {
  
  /**
   * Encuentra y elimina fuentes de pago duplicadas para un usuario
   */
  async removeDuplicatePaymentSources(userId: string): Promise<{
    success: boolean;
    removed: number;
    error?: string;
  }> {
    try {
      const paymentSourcesRef = collection(db, 'users', userId, 'paymentSources');
      const q = query(paymentSourcesRef, orderBy('name'));
      
      const snapshot = await getDocs(q);
      const paymentSources: (PaymentSource & { docId: string })[] = snapshot.docs.map(doc => ({
        docId: doc.id,
        id: doc.id,
        ...doc.data()
      } as PaymentSource & { docId: string }));

      // Agrupar fuentes por nombre y tipo para identificar duplicados
      const sourceGroups = new Map<string, (PaymentSource & { docId: string })[]>();
      
      paymentSources.forEach(source => {
        const key = `${source.name.toLowerCase().trim()}-${source.type}`;
        if (!sourceGroups.has(key)) {
          sourceGroups.set(key, []);
        }
        sourceGroups.get(key)!.push(source);
      });

      let removedCount = 0;
      const toDelete: string[] = [];

      // Para cada grupo, mantener solo la primera fuente y marcar las demás para eliminación
      for (const [key, sources] of sourceGroups) {
        if (sources.length > 1) {
          console.log(`Found ${sources.length} duplicates for: ${key}`);
          
          // Ordenar por ID para mantener consistencia (el más antiguo primero)
          sources.sort((a, b) => a.docId.localeCompare(b.docId));
          
          // Marcar todos menos el primero para eliminación
          for (let i = 1; i < sources.length; i++) {
            toDelete.push(sources[i].docId);
            removedCount++;
          }
        }
      }

      // Eliminar los duplicados
      for (const docId of toDelete) {
        const docRef = doc(paymentSourcesRef, docId);
        await deleteDoc(docRef);
        console.log(`Deleted duplicate payment source: ${docId}`);
      }

      return {
        success: true,
        removed: removedCount
      };

    } catch (error) {
      console.error('Error removing duplicate payment sources:', error);
      return {
        success: false,
        removed: 0,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Lista fuentes de pago duplicadas sin eliminarlas
   */
  async listDuplicatePaymentSources(userId: string): Promise<{
    success: boolean;
    duplicates: Array<{
      name: string;
      type: string;
      count: number;
      sources: PaymentSource[];
    }>;
    error?: string;
  }> {
    try {
      const paymentSourcesRef = collection(db, 'users', userId, 'paymentSources');
      const q = query(paymentSourcesRef, orderBy('name'));
      
      const snapshot = await getDocs(q);
      const paymentSources: PaymentSource[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PaymentSource));

      // Agrupar fuentes por nombre y tipo
      const sourceGroups = new Map<string, PaymentSource[]>();
      
      paymentSources.forEach(source => {
        const key = `${source.name.toLowerCase().trim()}-${source.type}`;
        if (!sourceGroups.has(key)) {
          sourceGroups.set(key, []);
        }
        sourceGroups.get(key)!.push(source);
      });

      const duplicates = [];
      for (const [key, sources] of sourceGroups) {
        if (sources.length > 1) {
          const [type] = key.split('-');
          duplicates.push({
            name: sources[0].name,
            type: type,
            count: sources.length,
            sources: sources
          });
        }
      }

      return {
        success: true,
        duplicates
      };

    } catch (error) {
      console.error('Error listing duplicate payment sources:', error);
      return {
        success: false,
        duplicates: [],
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Función para mejorar la verificación de duplicados en el servicio principal
   */
  async hasExistingPaymentSource(userId: string, name: string, type: string): Promise<boolean> {
    try {
      const paymentSourcesRef = collection(db, 'users', userId, 'paymentSources');
      const q = query(
        paymentSourcesRef, 
        where('name', '==', name.trim()),
        where('type', '==', type)
      );
      
      const snapshot = await getDocs(q);
      return !snapshot.empty;
      
    } catch (error) {
      console.error('Error checking existing payment source:', error);
      return false;
    }
  }
}

export const duplicateCleanupService = new DuplicateCleanupService();
