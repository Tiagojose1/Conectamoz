// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAnalytics,
  isSupported,
} from "firebase/analytics";

/* =========================================================
   CONFIGURAÇÃO DO FIREBASE
========================================================= */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/* =========================================================
   VERIFICAÇÃO DA CONFIGURAÇÃO
========================================================= */

const requiredConfig = {
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  VITE_FIREBASE_STORAGE_BUCKET:
    firebaseConfig.storageBucket,
  VITE_FIREBASE_MESSAGING_SENDER_ID:
    firebaseConfig.messagingSenderId,
  VITE_FIREBASE_APP_ID: firebaseConfig.appId,
};

const missingConfig = Object.entries(requiredConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  console.error(
    "Configuração Firebase incompleta. Variáveis ausentes:",
    missingConfig
  );
}

/* =========================================================
   INICIALIZAR FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);

/* =========================================================
   FIREBASE AUTHENTICATION
========================================================= */

export const auth = getAuth(app);

/* =========================================================
   FIRESTORE
========================================================= */

export const db = getFirestore(app);

/* =========================================================
   FIREBASE STORAGE
========================================================= */

export const storage = getStorage(app);

/* =========================================================
   FIREBASE ANALYTICS
========================================================= */

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch((error) => {
      console.warn(
        "Firebase Analytics não disponível:",
        error
      );
    });
}

/* =========================================================
   EXPORT DEFAULT
========================================================= */

export default app;