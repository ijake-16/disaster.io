import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
console.log('Initializing Firebase app with config:', 
  { 
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  }
);
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Add debug listener
onAuthStateChanged(auth, (user) => {
  console.log('Firebase.ts: Auth state changed:', user ? `User ${user.uid} logged in` : 'No user logged in');
});
