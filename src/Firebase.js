import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBd4BNKc2sBXyXs3V4Lk_ilGltWFQGBt0M",
  authDomain: "conectmoz-cec5d.firebaseapp.com",
  projectId: "conectmoz-cec5d",
  storageBucket: "conectmoz-cec5d.firebasestorage.app",
  messagingSenderId: "1019945315509",
  appId: "1:1019945315509:web:0GYyODAyNzQtMmE3NS00NGY5LThjYzNt"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços para usar no projeto
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);