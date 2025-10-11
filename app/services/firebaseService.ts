// Firebase service for candidates, votes, and user management
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Candidate {
  id: string;
  name: string;
  position: string;
  party?: string;
  course?: string;
  slogan?: string;
  published?: boolean;
  createdAt: Timestamp;
  voteCount?: number;
}

export interface Vote {
  id: string;
  candidateId: string;
  voterId: string;
  votedAt: Timestamp;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  course?: string;
  studentId?: string;
  approved: boolean;
  createdAt: Timestamp;
}

// Candidate operations
export const addCandidate = async (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'voteCount'>): Promise<string> => {
  console.log('Adding candidate to Firebase:', candidateData);

  try {
    const docRef = await addDoc(collection(db, 'candidates'), {
      ...candidateData,
      createdAt: Timestamp.now(),
      voteCount: 0,
      published: candidateData.published || false
    });

    console.log('Candidate added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding candidate:', error);
    throw error;
  }
};

export const listCandidates = async (showAll: boolean = false): Promise<Candidate[]> => {
  console.log('Fetching candidates from Firebase...');

  try {
    const candidatesRef = collection(db, 'candidates');
    const q = query(candidatesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    console.log(`Found ${querySnapshot.size} candidates`);

    const candidates: Candidate[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Raw candidate data:', data);

      // Only include published candidates unless showAll is true
      if (showAll || data.published) {
        candidates.push({
          id: doc.id,
          name: data.name,
          position: data.position,
          party: data.party,
          course: data.course,
          slogan: data.slogan,
          published: data.published || false,
          createdAt: data.createdAt,
          voteCount: data.voteCount || 0
        });
      }
    });

    console.log('Processed candidates:', candidates);
    return candidates;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
};

export const updateCandidate = async (id: string, updates: Partial<Omit<Candidate, 'id' | 'createdAt'>>): Promise<void> => {
  console.log('Updating candidate:', id, updates);

  try {
    const candidateRef = doc(db, 'candidates', id);
    await updateDoc(candidateRef, updates);
    console.log('Candidate updated successfully');
  } catch (error) {
    console.error('Error updating candidate:', error);
    throw error;
  }
};

export const deleteCandidate = async (id: string): Promise<void> => {
  console.log('Deleting candidate:', id);

  try {
    await deleteDoc(doc(db, 'candidates', id));
    console.log('Candidate deleted successfully');
  } catch (error) {
    console.error('Error deleting candidate:', error);
    throw error;
  }
};

// Vote operations
export const submitVote = async (candidateId: string, voterId: string, position: string): Promise<string> => {
  console.log('Submitting vote for candidate:', candidateId, 'by voter:', voterId);

  try {
    // Check if user has already voted for this position
    const votesRef = collection(db, 'votes');
    const q = query(votesRef, where('voterId', '==', voterId), where('position', '==', position));
    const existingVotes = await getDocs(q);

    if (!existingVotes.empty) {
      console.warn('User has already voted for position', position);
      throw new Error('Already voted for this position');
    }

    // Submit the vote
    const docRef = await addDoc(collection(db, 'votes'), {
      candidateId,
      voterId,
      position,
      votedAt: Timestamp.now()
    });

    // Update candidate vote count
    const candidateRef = doc(db, 'candidates', candidateId);
    await updateDoc(candidateRef, {
      voteCount: (await getDocs(query(collection(db, 'votes'), where('candidateId', '==', candidateId)))).size
    });

    console.log('Vote submitted successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
};

export const getVoteCounts = async (): Promise<Record<string, number>> => {
  console.log('Getting vote counts...');

  try {
    const votesRef = collection(db, 'votes');
    const querySnapshot = await getDocs(votesRef);

    const counts: Record<string, number> = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      counts[data.candidateId] = (counts[data.candidateId] || 0) + 1;
    });

    console.log('Vote counts:', counts);
    return counts;
  } catch (error) {
    console.error('Error getting vote counts:', error);
    throw error;
  }
};

export const hasUserVoted = async (voterId: string): Promise<boolean> => {
  try {
    const votesRef = collection(db, 'votes');
    const q = query(votesRef, where('voterId', '==', voterId));
    const existing = await getDocs(q);
    return !existing.empty;
  } catch (error) {
    console.error('Error checking user vote:', error);
    throw error;
  }
};

// User operations
export const registerUser = async (userData: Omit<User, 'id' | 'createdAt' | 'approved'>): Promise<string> => {
  console.log('Registering user:', userData);

  try {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      approved: false,
      createdAt: Timestamp.now()
    });

    console.log('User registered successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const getPendingUsers = async (): Promise<User[]> => {
  console.log('Fetching pending users...');

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('approved', '==', false), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    console.log(`Found ${querySnapshot.size} pending users`);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        course: data.course,
        studentId: data.studentId,
        approved: data.approved,
        createdAt: data.createdAt
      });
    });

    return users;
  } catch (error) {
    console.error('Error fetching pending users:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  console.log('Fetching user by email:', email);

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('User not found');
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      email: data.email,
      displayName: data.displayName,
      course: data.course,
      studentId: data.studentId,
      approved: data.approved,
      createdAt: data.createdAt
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Admin user approval operations
export const approveUser = async (email: string): Promise<void> => {
  console.log('Approving user:', email);

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    const userDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), { approved: true });
    console.log('User approved:', email);
  } catch (error) {
    console.error('Error approving user:', error);
    throw error;
  }
};

export const disapproveUser = async (email: string): Promise<boolean> => {
  console.log('Disapproving user (deleting):', email);

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return false;
    }

    const userDoc = querySnapshot.docs[0];
    await deleteDoc(doc(db, 'users', userDoc.id));
    console.log('User disapproved and removed:', email);
    return true;
  } catch (error) {
    console.error('Error disapproving user:', error);
    throw error;
  }
};

// Monitoring helpers
export const getAllUsers = async (): Promise<User[]> => {
  console.log('Fetching all users...');

  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        course: data.course,
        studentId: data.studentId,
        approved: data.approved,
        createdAt: data.createdAt,
      });
    });

    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const getUserStats = async (): Promise<{ total: number; approved: number; pending: number } > => {
  const [all, pending] = await Promise.all([
    getAllUsers(),
    getPendingUsers(),
  ]);
  const approved = all.filter(u => u.approved).length;
  return { total: all.length, approved, pending: pending.length };
};

// Default export to satisfy route system requirements
export default {};
