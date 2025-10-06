// Firebase configuration
// Replace these values with your actual Firebase project configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
// Note: For React Native, AsyncStorage persistence is handled automatically
// when @react-native-async-storage/async-storage is installed
export const auth = getAuth(app);

export default app;
