// app/services/authService.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  UserCredential, 
  User,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export interface UserData {
  id?: string;
  displayName: string;
  email: string;
  course?: string;
  studentId?: string;
  approved: boolean;
  isAdmin?: boolean;
  createdAt: any; // Can be Date or FieldValue
  updatedAt?: any; // Can be Date or FieldValue
}

export const registerUser = async (
  email: string, 
  password: string, 
  userData: Omit<UserData, 'email' | 'approved' | 'id' | 'createdAt' | 'updatedAt'> & { 
    approved?: boolean 
  }
): Promise<UserCredential> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Prepare user data for Firestore
    const userDoc: Omit<UserData, 'id'> = {
      displayName: userData.displayName,
      email,
      course: userData.course,
      studentId: userData.studentId,
      approved: userData.approved || false,
      isAdmin: userData.isAdmin || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), userDoc);

    return userCredential;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { 
        id: userDoc.id, 
        ...userDoc.data() 
      } as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const loginUser = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};
