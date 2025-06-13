import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDF6U_xmjL3MIkY2lJEjibWUCEhyC5WsBI",
  authDomain: "gestos-gastosv2.firebaseapp.com",
  projectId: "gestos-gastosv2",
  storageBucket: "gestos-gastosv2.firebasestorage.app",
  messagingSenderId: "270933039509",
  appId: "1:270933039509:web:754340dda5745f29cc3e9c",
  measurementId: "G-YH3XBJ1Z2Y"
};
// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta las instancias de los servicios que necesitarás
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- LÍNEAS MODIFICADAS ---
// Como no estás en el entorno original, estas variables no existen.
// Las definimos directamente con sus valores por defecto.
export const appId = 'default-gastos-app';
export const initialAuthToken = null;