import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase project config is loaded from environment variables.
// For Vite, prefix variables with `VITE_` and access via `import.meta.env`.
// See .env and .env.example at project root.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app, db, auth, storage;

try {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
    throw new Error('Missing Firebase API key — set VITE_FIREBASE_* in .env');
  }
  app     = initializeApp(firebaseConfig);
  db      = getFirestore(app);
  auth    = getAuth(app);
  storage = getStorage(app);
} catch (e) {
  console.warn('Firebase not initialized:', e.message);
  db = auth = storage = null;
}

export { db, auth, storage };
