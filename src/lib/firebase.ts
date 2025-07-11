import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE ---
// You can find this in your Firebase project settings.
// Go to Project settings > General > Your apps > Web app > SDK setup and configuration
export const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyD0F3XPTpYuwYauK_yRu2q597js3QDmqlU",
  authDomain: "hairconnect-db.firebaseapp.com",
  projectId: "hairconnect-db",
  storageBucket: "hairconnect-db.firebasestorage.app",
  messagingSenderId: "727090333408",
  appId: "1:727090333408:web:c4b9ac38e532f213123285",
  // measurementId is optional and may not be in your config
  // measurementId: "PASTE_YOUR_MEASUREMENT_ID_HERE"
};

// Initialize Firebase
// We check if an app is already initialized to prevent errors during hot-reloading in development.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
