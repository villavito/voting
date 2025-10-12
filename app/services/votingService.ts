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
export async function submitVote(candidateId: string, voterId: string, position: string): Promise<boolean> {
  // Check if voter has already voted (local cache)
  const existing = voterRecords[voterId];
  if (existing) {
    console.warn(`Voter ${voterId} has already voted (local cache)`);
    return false;
  }

  // Submit vote to Firebase
  try {
    await submitVoteToFirebase(candidateId, voterId, position);
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
 * @param cycleId - Optional cycle ID to filter votes
 * @returns Object mapping candidateId to vote count
 */
export async function getVoteCounts(cycleId?: string): Promise<Record<string, number>> {
  try {
    return await getVoteCountsFromFirebase(cycleId);
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
 * @param cycleId - Optional cycle ID to filter votes
 */
export async function getTotalVotes(cycleId?: string): Promise<number> {
  const counts = await getVoteCounts(cycleId);
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

// Default export to satisfy route system requirements
export default {};
