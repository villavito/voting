const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://voting-b4aef.firebaseio.com",
});

const db = admin.firestore();

// Sample student data with IDs and names
const validStudents = [
  { id: '2023-0001', name: 'John Doe', course: 'BSIT' },
  { id: '2023-0002', name: 'Jane Smith', course: 'BSCS' },
  { id: '2023-0003', name: 'Robert Johnson', course: 'BSIS' },
  { id: '2023-0004', name: 'Emily Davis', course: 'BSIT' },
  { id: '2023-0005', name: 'Michael Brown', course: 'BSCS' },
  { id: '2023-0006', name: 'Sarah Wilson', course: 'BSIS' },
  { id: '2023-0007', name: 'David Miller', course: 'BSIT' },
  { id: '2023-0008', name: 'Jessica Garcia', course: 'BSCS' },
  { id: '2023-0009', name: 'Daniel Martinez', course: 'BSIS' },
  { id: '2023-0010', name: 'Lisa Anderson', course: 'BSIT' }
];

async function setupValidStudentIds() {
  try {
    const batch = db.batch();
    const validIdsRef = db.collection('validStudentIds');
    
    // Add all student records to a batch
    validStudents.forEach(student => {
      const docRef = validIdsRef.doc(student.id);
      batch.set(docRef, {
        name: student.name,
        course: student.course,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isUsed: false
      });
    });

    // Commit the batch
    await batch.commit();
    console.log('✅ Successfully added 10 valid student IDs to Firestore');
    console.log('Student IDs have been added to the "validStudentIds" collection');
  } catch (error) {
    console.error('❌ Error setting up valid student IDs:', error);
  } finally {
    // Close the connection
    process.exit(0);
  }
}

// Run the setup
setupValidStudentIds();
