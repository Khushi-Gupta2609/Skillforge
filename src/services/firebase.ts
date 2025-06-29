import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

console.log('🔧 Firebase Config Check:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'Missing',
  authDomain: firebaseConfig.authDomain || 'Missing',
  projectId: firebaseConfig.projectId || 'Missing',
  storageBucket: firebaseConfig.storageBucket || 'Missing',
  messagingSenderId: firebaseConfig.messagingSenderId || 'Missing',
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : 'Missing',
  databaseURL: firebaseConfig.databaseURL || 'Missing'
});

// Initialize Firebase
let app: any = null;
let auth: any = null;
let database: any = null;
let functions: any = null;
let isFirebaseConfigured = false;

try {
  // Check if we have the minimum required config
  if (firebaseConfig.apiKey && 
      firebaseConfig.authDomain && 
      firebaseConfig.projectId &&
      firebaseConfig.databaseURL &&
      firebaseConfig.apiKey !== 'AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') {
    
    console.log('🔥 Initializing Firebase with Realtime Database...');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
    functions = getFunctions(app);
    isFirebaseConfigured = true;
    
    console.log('✅ Firebase initialized successfully with Realtime Database!');
    console.log('🔗 Project ID:', firebaseConfig.projectId);
    console.log('🗄️ Database URL:', firebaseConfig.databaseURL);
  } else {
    console.warn('⚠️ Firebase configuration incomplete - using demo mode');
    console.log('📝 Please update your .env.local file with your actual Firebase config');
    console.log('🗄️ Make sure to include VITE_FIREBASE_DATABASE_URL for Realtime Database');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  isFirebaseConfigured = false;
}

export { auth, database, functions, isFirebaseConfigured };
export default app;

export const isFirebaseReady = (): boolean => {
  return isFirebaseConfigured && !!app && !!auth && !!database;
};