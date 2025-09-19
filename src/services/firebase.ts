import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase with error handling
let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;
let firebaseDb: Firestore;
let firebaseStorage: FirebaseStorage;

function initializeFirebase() {
  try {
    // Check if all required config values are present
    const requiredConfig = [
      'EXPO_PUBLIC_FIREBASE_API_KEY',
      'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID'
    ];
    
    const missingConfig = requiredConfig.filter(key => !process.env[key as keyof typeof process.env]);
    
    if (missingConfig.length > 0) {
      console.warn('Missing Firebase configuration values:', missingConfig);
      console.warn('Using dummy Firebase instance');
      
      // Return dummy objects to prevent app crash
      return {
        app: {} as FirebaseApp,
        auth: {} as Auth,
        db: {} as Firestore,
        storage: {} as FirebaseStorage
      };
    }
    
    // Check if config values are still placeholders
    const isPlaceholder = Object.values(firebaseConfig).some(value => 
      value?.includes('your-') || value?.includes('XXXX')
    );
    
    if (isPlaceholder) {
      console.warn('Firebase configuration contains placeholder values. Please update your .env file.');
      console.warn('Using dummy Firebase instance');
      
      // Return dummy objects to prevent app crash
      return {
        app: {} as FirebaseApp,
        auth: {} as Auth,
        db: {} as Firestore,
        storage: {} as FirebaseStorage
      };
    }
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    
    console.log('Firebase initialized successfully');
    
    return { app, auth, db, storage };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Return dummy objects to prevent app crash
    return {
      app: {} as FirebaseApp,
      auth: {} as Auth,
      db: {} as Firestore,
      storage: {} as FirebaseStorage
    };
  }
}

const { app, auth, db, storage } = initializeFirebase();

// Export with different names to avoid conflicts
export { auth as firebaseAuth, db as firebaseDb, storage as firebaseStorage };