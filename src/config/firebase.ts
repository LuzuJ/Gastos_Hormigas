import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Vite expone las variables de entorno en el objeto `import.meta.env`
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Configuración de desarrollo por defecto cuando no hay variables de entorno
const defaultDevConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-ABCDEF"
};

// Usar configuración de desarrollo si no hay variables de entorno
const config = firebaseConfig.apiKey ? firebaseConfig : defaultDevConfig;

console.log('Firebase config status:', {
  hasApiKey: !!firebaseConfig.apiKey,
  usingDevConfig: !firebaseConfig.apiKey,
  projectId: config.projectId
});

const app = initializeApp(config);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Indicador para saber si estamos en modo de desarrollo
export const isDevMode = !firebaseConfig.apiKey;