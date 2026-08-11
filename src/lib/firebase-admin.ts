import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Firebase Admin SDK Singleton Initializer
function initFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    let serviceAccount: any = null;

    // 1. Check for serviceAccountKey.json file path
    const customKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(customKeyPath)) {
      const raw = fs.readFileSync(customKeyPath, 'utf8');
      serviceAccount = JSON.parse(raw);
    } 
    // 2. Check for FIREBASE_SERVICE_ACCOUNT_KEY env string
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    }
    // 3. Check for discrete env variables
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      console.warn('Firebase Admin SDK: No service account credentials found. Using memory fallback.');
    }
  } catch (err) {
    console.error('Failed to initialize Firebase Admin SDK:', err);
  }

  return admin.apps.length > 0 ? admin.app() : null;
}

export const firebaseApp = initFirebaseAdmin();
export const firebaseAuth = firebaseApp ? admin.auth() : null;
export const firebaseDb = firebaseApp ? admin.firestore() : null;
