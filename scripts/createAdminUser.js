// scripts/createAdminUser.js
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://voting-b4aef.firebaseio.com",
});

const auth = admin.auth();
const db = admin.firestore();

const ADMIN_EMAIL = 'eshield772@gmail.com';
const ADMIN_PASSWORD = 'admin1';

async function createAdminUser() {
  try {
    // 1️⃣ Try to create the auth user
    const userRecord = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      emailVerified: true,
      disabled: false,
    });

    const user = userrRecord;
    console.log('✅ Admin user created:', user.uid);

    // 2️⃣ Save admin data to Firestore
    await db.collection('users').doc(user.uid).set({
      displayName: 'Admin User',
      email: ADMIN_EMAIL,
      isAdmin: true,
      approved: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Admin user data saved to Firestore');
    process.exit(0);
  } catch (error) {
    // If the email already exists, update Firestore data
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️ Admin user already exists. Updating permissions...');

      const user = await auth.getUserByEmail(ADMIN_EMAIL);
      await db.collection('users').doc(user.uid).set(
        {
          displayName: 'Admin User',
          email: ADMIN_EMAIL,
          isAdmin: true,
          approved: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      console.log('✅ Admin permissions updated.');
      process.exit(0);
    } else {
      console.error('❌ Error creating admin user:', error);
      process.exit(1);
    }
  }
}

createAdminUser();
// To run this script, use the command: node scripts/createAdminUser.js