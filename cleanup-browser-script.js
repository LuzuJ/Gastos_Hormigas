// SCRIPT DE EMERGENCIA PARA LIMPIAR DUPLICADOS
// Copia y pega este código COMPLETO en la consola del navegador (F12 > Console)

(async function cleanupDuplicatesEmergency() {
  console.log('🧹 Iniciando limpieza de emergencia...');

  function getUserIdFromLocalStorage() {
    try {
      const authData = localStorage.getItem('firebase:authUser:AIzaSyBnKmq9wLELzaQ_Dy5EFXt0FJElD3w5Vhw:[DEFAULT]');
      if (authData) {
        const user = JSON.parse(authData);
        console.log('✅ User ID encontrado en localStorage:', user.uid);
        return user.uid;
      }
    } catch (e) {
      console.log('❌ No se pudo obtener desde localStorage:', e.message);
    }
    return null;
  }

  function promptUserId() {
    const userId = prompt('No se pudo detectar automáticamente tu User ID.\nPor favor ingresa tu User ID para continuar:');
    if (!userId) {
      console.log('❌ Operación cancelada');
      return null;
    }
    return userId;
  }

  async function getFirebaseDb() {
    const { 
      collection, 
      getDocs, 
      deleteDoc, 
      doc, 
      query, 
      orderBy 
    } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js');
    const db = window.db || window.firebase?.firestore?.() || null;
    if (!db) throw new Error('No se pudo acceder a la base de datos de Firebase');
    return { db, collection, getDocs, deleteDoc, doc, query, orderBy };
  }

  async function getPaymentSources({ db, collection, getDocs, query, orderBy }, userId) {
    const paymentSourcesRef = collection(db, 'users', userId, 'paymentSources');
    const q = query(paymentSourcesRef, orderBy('name'));
    console.log('📊 Obteniendo fuentes de pago...');
    const snapshot = await getDocs(q);
    const sources = [];
    snapshot.forEach((docSnap) => {
      sources.push({
        docId: docSnap.id,
        name: docSnap.data().name,
        type: docSnap.data().type,
        ...docSnap.data()
      });
    });
    console.log(`📋 Total fuentes encontradas: ${sources.length}`);
    return { sources, paymentSourcesRef };
  }

  function groupDuplicates(sources) {
    const groups = new Map();
    sources.forEach(source => {
      const key = `${source.name.toLowerCase().trim()}-${source.type}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(source);
    });
    return groups;
  }

  function analyzeDuplicates(groups) {
    console.log('🔍 Análisis de duplicados:');
    let totalDuplicates = 0;
    const toDelete = [];
    for (const [key, groupSources] of groups) {
      if (groupSources.length > 1) {
        console.log(`❗ "${key}": ${groupSources.length} copias`);
        for (let i = 1; i < groupSources.length; i++) {
          toDelete.push(groupSources[i]);
          totalDuplicates++;
        }
      } else {
        console.log(`✅ "${key}": única`);
      }
    }
    return { totalDuplicates, toDelete };
  }

  async function deleteDuplicates(toDelete, paymentSourcesRef, doc, deleteDoc) {
    console.log('🔥 Eliminando duplicados...');
    let eliminados = 0;
    for (const source of toDelete) {
      try {
        const docRef = doc(paymentSourcesRef, source.docId);
        await deleteDoc(docRef);
        console.log(`✅ Eliminado: ${source.name} (ID: ${source.docId.substring(0, 8)}...)`);
        eliminados++;
      } catch (error) {
        console.error(`❌ Error eliminando ${source.name}:`, error);
      }
    }
    return eliminados;
  }

  let userId = getUserIdFromLocalStorage();
  if (!userId) userId = promptUserId();
  if (!userId) return;

  try {
    const firebase = await getFirebaseDb();
    console.log('✅ Conectado a Firebase');
    const { sources, paymentSourcesRef } = await getPaymentSources(firebase, userId);
    const groups = groupDuplicates(sources);
    const { totalDuplicates, toDelete } = analyzeDuplicates(groups);

    if (totalDuplicates === 0) {
      console.log('🎉 ¡No hay duplicados que eliminar!');
      alert('✅ No se encontraron duplicados para eliminar');
      return;
    }

    console.log(`🗑️ Se eliminarán ${totalDuplicates} duplicados`);
    const confirmDelete = confirm(`Se encontraron ${totalDuplicates} fuentes duplicadas.\n\n¿Proceder con la eliminación?\n\n⚠️ Esta acción no se puede deshacer.`);
    if (!confirmDelete) {
      console.log('❌ Operación cancelada por el usuario');
      return;
    }

    const eliminados = await deleteDuplicates(toDelete, paymentSourcesRef, firebase.doc, firebase.deleteDoc);

    console.log(`🎉 ¡Limpieza completada!`);
    console.log(`📊 Eliminados: ${eliminados} duplicados`);
    console.log(`✅ Restantes: ${sources.length - eliminados} fuentes únicas`);

    alert(`🎉 ¡Limpieza completada exitosamente!\n\nEliminados: ${eliminados} duplicados\nRestantes: ${sources.length - eliminados} fuentes únicas\n\n🔄 Recarga la página para ver los cambios`);

    if (confirm('¿Recargar la página ahora para ver los cambios?')) {
      window.location.reload();
    }
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    alert(`❌ Error durante la limpieza:\n\n${error.message}\n\nRevisa la consola para más detalles.`);
  }
})();

// También disponible como función global
window.cleanupDuplicates = function() {
  // Re-ejecutar el script
  eval(document.currentScript.innerHTML);
};
