// Voting service to handle vote submission and tracking using Firebase

import { submitVote as submitVoteToFirebase, getVoteCounts as getVoteCountsFromFirebase } from './firebaseService';

type VoteRecord = {
  id: string;
  candidateId: string;
  voterId: string; // Could be user email or ID
  votedAt: number;
};

// Track who has voted to prevent multiple votes (local cache)
const voterRecords: Record<string, string> = {}; // voterId -> candidateId

/**
 * Submit a vote for a candidate
 * @param candidateId - ID of the candidate being voted for
 * @param voterId - ID or email of the voter
 * @returns boolean indicating if the vote was successful
 */
export function submitVote(candidateId: string, voterId: string): boolean {
  // Check if voter has already voted (local cache)
  if (voterRecords[voterId]) {
    console.warn(`Voter ${voterId} has already voted for candidate ${voterRecords[voterId]}`);
    return false;
  }

  // Submit vote to Firebase
  try {
    submitVoteToFirebase(candidateId, voterId);
    voterRecords[voterId] = candidateId;
    console.log(`Vote recorded: ${voterId} voted for ${candidateId}`);
    return true;
  } catch (error) {
    console.error('Error submitting vote:', error);
    return false;
  }
}

/**
 * Get vote counts for all candidates
 * @returns Object mapping candidateId to vote count
 */
export async function getVoteCounts(): Promise<Record<string, number>> {
  try {
    return await getVoteCountsFromFirebase();
  } catch (error) {
    console.error('Error getting vote counts:', error);
    return {};
  }
}

/**
 * Get the candidate that a user voted for
 * @param voterId - ID or email of the voter
 * @returns candidateId if voted, undefined otherwise
 */
export function getUserVote(voterId: string): string | undefined {
  return voterRecords[voterId];
}

/**
 * Get total number of votes cast
 */
export async function getTotalVotes(): Promise<number> {
  const counts = await getVoteCounts();
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

/**
 * Get all votes (for admin purposes) - Note: This would need to be implemented in firebaseService
 */
export function getAllVotes(): VoteRecord[] {
  // This would need to be implemented to fetch all votes from Firebase
  // For now, return empty array
  console.warn('getAllVotes not implemented for Firebase');
  return [];
}

/**
 * Clear local vote cache (useful for testing or admin operations)
 */
export function clearVoteCache(): void {
  Object.keys(voterRecords).forEach(key => delete voterRecords[key]);
  console.log('Vote cache cleared');
}

// Default export to satisfy route system requirements
export default {};
