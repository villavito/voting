// firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdo_39l_Uh_oLQEYzODHRrxlMVLY4pnZc",
  authDomain: "voting-b4aef.firebaseapp.com",
  projectId: "voting-b4aef",
  storageBucket: "voting-b4aef.firebasestorage.app",
  messagingSenderId: "145567804141",
  appId: "1:145567804141:web:3ab84b2d3703a9fe073ae4",
  measurementId: "G-2CP4YDR1FM"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
