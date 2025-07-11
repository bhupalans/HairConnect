import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE ---
// You can find this in your Firebase project settings.
// Go to Project settings > General > Your apps > Web app > SDK setup and configuration
export const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDz3N9D30n-rRh4NkfceK5lhOZVsC3KmyI",
  authDomain: "hairconnectdb.firebaseapp.com",
  projectId: "hairconnectdb",
  storageBucket: "hairconnectdb.appspot.com",
  messagingSenderId: "718750784623",
  appId: "1:718750784623:web:c742a98b0f7e6b62fa419a",
  // measurementId is optional and may not be in your config
  // measurementId: "PASTE_YOUR_MEASUREMENT_ID_HERE"
};

// Initialize Firebase
// We check if an app is already initialized to prevent errors during hot-reloading in development.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
