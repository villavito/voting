// scripts/updateEnrolledStatus.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

// 🔐 Your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyCdo_39l_Uh_oLQEYzODHRrxlMVLY4pnZc",
  authDomain: "voting-b4aef.firebaseapp.com",
  projectId: "voting-b4aef",
  storageBucket: "voting-b4aef.firebasestorage.app",
  messagingSenderId: "145567804141",
  appId: "1:145567804141:web:3ab84b2d3703a9fe073ae4",
  measurementId: "G-2CP4YDR1FM"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📌 Get arguments from terminal
// Example: node scripts/updateEnrolledStatus.js 2JY4Qmx6llPZAKHRBvCjiG21JX02 true
const [,, userId, statusArg] = process.argv;

if (!userId || typeof statusArg === "undefined") {
  console.error("Usage: node scripts/updateEnrolledStatus.js <USER_ID> <true|false>");
  process.exit(1);
}

const status = statusArg.toLowerCase() === "true";

async function updateEnrolledStatus() {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { enroled: status });
    console.log(`✅ Successfully updated 'enroled' to ${status} for user ID: ${userId}`);
  } catch (error) {
    console.error("❌ Error updating enrolled status:", error);
  }
}

updateEnrolledStatus();
