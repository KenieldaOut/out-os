import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAMsJpiCEAWovfPhMPrVeAjsSe7LQLWo0E",
  authDomain: "outos-8e44c.firebaseapp.com",
  projectId: "outos-8e44c",
  storageBucket: "outos-8e44c.firebasestorage.app",
  messagingSenderId: "890168933427",
  appId: "1:890168933427:web:0c56ff2dedcedad5f83746"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
