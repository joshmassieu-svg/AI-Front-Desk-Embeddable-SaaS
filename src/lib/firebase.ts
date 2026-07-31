import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with the provisioned database ID if provided
const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

const auth = getAuth(app);

// Automatically sign in anonymously to ensure smooth Firestore operations
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth).catch((error) => {
      console.warn('Anonymous sign-in error:', error);
    });
  }
});

export { app, db, auth };
