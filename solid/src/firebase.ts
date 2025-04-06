import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Firebase configuration - update with the correct values from your Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyB7VC1nUk8AqlG-NK4ZkvJjqAmpC0fen8s",
  authDomain: "disaster-io-e3848.firebaseapp.com",
  projectId: "disaster-io-e3848",
  storageBucket: "disaster-io-e3848.appspot.com",
  messagingSenderId: "209003919230",
  appId: "1:209003919230:web:a5b823ed9ebd6cb1ae6df3"
};

// Initialize Firebase
console.log('Initializing Firebase app');
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Add debug listener
onAuthStateChanged(auth, (user) => {
  console.log('Firebase.ts: Auth state changed:', user ? `User ${user.uid} logged in` : 'No user logged in');
});
