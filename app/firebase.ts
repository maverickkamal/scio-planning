import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyAnmsjAHgO-F36Yw2l7ZUpUXTxjGmCC_KA",
    authDomain: "scio-e4256.firebaseapp.com",
    projectId: "scio-e4256",
    storageBucket: "scio-e4256.appspot.com",
    messagingSenderId: "147089123337",
    appId: "1:147089123337:web:bdb8b7a69636ab0980b0d8",
    measurementId: "G-KZPJDY9S08"
  };

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics only on the client side
export const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null) 
  : null;

// Initialize Firestore
//export const db = getFirestore(app);

//export default app;