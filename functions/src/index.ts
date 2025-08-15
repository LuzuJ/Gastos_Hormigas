import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Inicializa la conexión de administrador a tu proyecto de Firebase
admin.initializeApp();
const db = admin.firestore();

// --- Definimos tipos simples para que el código sea más seguro ---
interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

// --- Nuestra Función Programada (Corregida) ---
export const postFixedExpenses = functions.pubsub.schedule("every day 05:00")
  // Usamos _context para indicar que no usamos este parámetro (corrige un error de lint)
  .onRun(async (_context) => {
    functions.logger.info("Iniciando la ejecución de postFixedExpenses.");
    const usersSnapshot = await db.collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const fixedExpensesRef = db.collection("users").doc(userId).collection("fixedExpenses");
      const expensesRef = db.collection("users").doc(userId).collection("expenses");
      const categoriesRef = db.collection("users").doc(userId).collection("categories");
      
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const currentMonthMarker = `${currentYear}-${currentMonth}`;

      const fixedExpensesSnapshot = await fixedExpensesRef.get();
      if (fixedExpensesSnapshot.empty) {
        continue;
      }

      const categoriesSnapshot = await categoriesRef.get();
      // Le damos un tipo explícito a 'categories' para que el código sea seguro
      const categories = categoriesSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}) as Category);
      
      const batch = db.batch();

      for (const fixedDoc of fixedExpensesSnapshot.docs) {
        const fixed = fixedDoc.data();

        const hasBeenPostedThisMonth = fixed.lastPostedMonth === currentMonthMarker;
        const isDue = currentDay >= fixed.dayOfMonth;

        if (!hasBeenPostedThisMonth && isDue) {
          functions.logger.info(`Registrando gasto para ${userId}: ${fixed.description}`);
          
          const category = categories.find((c) => c.id === fixed.category);
          // La búsqueda de subcategoría ahora es segura y sin usar 'any'
          const subCategory = category?.subcategories?.find((s) => s.name === "Gasto Fijo") || category?.subcategories?.[0];

          const expenseDate = new Date(currentYear, currentMonth, fixed.dayOfMonth);

          const newExpenseRef = expensesRef.doc();
          batch.set(newExpenseRef, {
            description: fixed.description,
            amount: fixed.amount,
            categoryId: fixed.category,
            subCategory: subCategory?.name || "Varios",
            createdAt: admin.firestore.Timestamp.fromDate(expenseDate),
          });

          batch.update(fixedDoc.ref, { lastPostedMonth: currentMonthMarker });
        }
      }
      await batch.commit();
    }
    functions.logger.info("Finalizó la ejecución de postFixedExpenses.");
    return null;
  });