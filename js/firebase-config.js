// ===== FIREBASE CONFIGURATION =====
// Replace the values below with your Firebase project credentials.
// Get them from: https://console.firebase.google.com → Project Settings → General → Your apps → Web app

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// Read env from `window.__env` if available (server-injected), fallback to placeholders
const env = window.__env || {};
const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId:             env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);
