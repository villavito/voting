// ✅ Import necessary Firebase modules
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🧭 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCdo_39l_Uh_oLQEYzODHRrxlMVLY4pnZc",
  authDomain: "voting-b4aef.firebaseapp.com",
  projectId: "voting-b4aef",
  storageBucket: "voting-b4aef.firebasestorage.app",
  messagingSenderId: "145567804141",
  appId: "1:145567804141:web:3ab84b2d3703a9fe073ae4",
  measurementId: "G-2CP4YDR1FM"
};

// 🧱 Initialize the Firebase App
const app = initializeApp(firebaseConfig);

// 🔐 Initialize Auth with AsyncStorage persistence (only once)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // If already initialized, just get the existing one
  auth = getAuth(app);
}

// ☁️ Initialize Firestore
const db = getFirestore(app);

// ✅ Export instances so you can use them anywhere in the app
export { app, auth, db };

