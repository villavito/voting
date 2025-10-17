import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Modal,
  ScrollView
} from "react-native";
import { auth } from "../firebase";
import { getUserData } from "./services/authService";
import { getActiveCycle, listCandidates, submitVote, hasUserVoted } from "./services/firebaseService";
import { parseVotingError, logError } from "./services/errorHandler";

interface VotingCycle {
  id: string;
  name: string;
  status: string;
  selectedCandidates?: Record<string, string[]>;
}

export default function VotingScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedByPosition, setSelectedByPosition] = useState<Record<string, any>>({});
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voterId, setVoterId] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [userCourse, setUserCourse] = useState<string>("");
  const [activeCycle, setActiveCycle] = useState<VotingCycle | null>(null);
  const [votingNotActive, setVotingNotActive] = useState(false);

  // Position options for hierarchy
  const positionOptions = [
    "President",
    "Vice President", 
    "Secretary",
    "Treasurer",
    "Auditor",
    "P.I.O",
    "Sgt. at Arms",
    "Class Representative"
  ];

  // Load candidates on component mount and refresh
  useEffect(() => {
    if (userCourse) {
      loadCandidates();
    }
  }, [refreshKey, userCourse]);

  // Attach auth user and approval guard
  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setVoterId(user.uid);
        try {
          const userData = await getUserData(user.uid);
          if (userData && userData.course) {
            setUserCourse(userData.course);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };
    loadUserData();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      
      // Check for active voting cycle
      const cycle = await getActiveCycle();
      setActiveCycle(cycle);
      
      if (!cycle) {
        setVotingNotActive(true);
        setCandidates([]);
        setLoading(false);
        return;
      }
      
      setVotingNotActive(false);
      
      // Get all candidates
      const candidatesData = await listCandidates(false);
      
      // Filter candidates that are in the active cycle
      const cycleSelectedIds = new Set(
        Object.values(cycle.selectedCandidates || {}).flat()
      );
      
      const cycleCandidates = candidatesData.filter((candidate: any) => 
        cycleSelectedIds.has(candidate.id)
      );
      
      // Filter candidates based on user course for Class Representative position
      const filteredCandidates = cycleCandidates.filter((candidate: any) => {
        // If candidate is Class Representative, only show if course matches user's course
        if (candidate.position === "Class Representative" && candidate.course) {
          return candidate.course === userCourse;
        }
        // Show all other positions
        return true;
      });
      
      setCandidates(filteredCandidates);
    } catch (error) {
      console.error('Error loading candidates:', error);
      Alert.alert('Error', 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleVotePress = (candidate: any) => {
    // Only allow selection if user hasn't voted yet
    if (hasVoted) {
      Alert.alert("Already Voted", "You have already cast your vote for this election.");
      return;
    }
    
    const position = candidate.position;
    
    // Toggle selection per position: if clicking the same candidate, deselect it; otherwise select the new one
    setSelectedByPosition((prev) => {
      const currentSelection = prev[position];
      
      if (currentSelection?.id === candidate.id) {
        // Deselect if clicking the same candidate
        const newSelections = { ...prev };
        delete newSelections[position];
        return newSelections;
      }
      
      // Select the new candidate for this position
      return {
        ...prev,
        [position]: candidate
      };
    });
  };


  // Check if user has already voted
  useEffect(() => {
    const checkIfVoted = async () => {
      if (voterId) {
        try {
          const voted = await hasUserVoted(voterId);
          setHasVoted(voted);
        } catch (error) {
          console.error('Error checking vote status:', error);
        }
      }
    };
    checkIfVoted();
  }, [voterId, refreshKey]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗳️ Cast Your Vote</Text>
        <View style={styles.buttonRow}>
          <Pressable onPress={() => router.push("/home")} style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}>
            <Text style={styles.backText}>Back to Home</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/results")}
            style={({ pressed }) => [styles.resultsButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.resultsButtonText}>View Results</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⏳</Text>
          <Text style={styles.emptyText}>Loading candidates...</Text>
        </View>
      ) : votingNotActive ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyText}>Voting is Not Active</Text>
          <Text style={styles.emptySubtext}>
            There is no active voting cycle at the moment. Please check back later when the admin starts a new voting session.
          </Text>
        </View>
      ) : candidates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No candidates available for voting yet.</Text>
          <Text style={styles.emptySubtext}>
            Candidates will appear here once published by the admin.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to Vote:</Text>
            <Text style={styles.instructionsText}>1. Confirm your account is approved</Text>
            <Text style={styles.instructionsText}>
              2. Select your preferred candidate
            </Text>
            <Text style={styles.instructionsText}>
              3. Confirm your vote
            </Text>
            <Text style={styles.noteText}>
              Note: Each voter can only vote once per election.
            </Text>
          </View>

          {/* voterId auto-filled from auth when signed in */}

          {/* Candidates Table - Grouped by Position */}
          <FlatList
            data={(() => {
              // Group candidates by position
              const grouped: Record<string, any[]> = {};
              candidates.forEach((candidate) => {
                if (!grouped[candidate.position]) {
                  grouped[candidate.position] = [];
                }
                grouped[candidate.position].push(candidate);
              });
              
              // Sort positions according to the hierarchy defined in positionOptions
              const sortedPositions = Object.keys(grouped).sort((a, b) => {
                const indexA = positionOptions.indexOf(a);
                const indexB = positionOptions.indexOf(b);
                
                // If position is not in positionOptions, put it at the end
                if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                
                return indexA - indexB;
              });
              
              return sortedPositions.map(position => ({ position, candidates: grouped[position] }));
            })()}
            keyExtractor={(item) => item.position}
            renderItem={({ item: positionGroup }) => (
              <View style={styles.positionSection}>
                <View style={styles.positionHeader}>
                  <Text style={styles.positionTitle}>{positionGroup.position}</Text>
                  {positionGroup.position === "Class Representative" && userCourse && (
                    <Text style={styles.courseIndicator}>({userCourse} only)</Text>
                  )}
                </View>
                <View style={styles.tableContainer}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.colPhoto]}>Photo</Text>
                    <Text style={[styles.tableHeaderText, styles.colName]}>Name</Text>
                    <Text style={[styles.tableHeaderText, styles.colAction]}>Action</Text>
                  </View>
                  
                  {/* Table Body for this position */}
                  {positionGroup.candidates.map((candidate) => {
                    const isSelected = selectedByPosition[positionGroup.position]?.id === candidate.id;
                    return (
                      <Pressable
                        key={candidate.id}
                        onPress={() => handleVotePress(candidate)}
                        style={({ pressed }) => [
                          styles.tableRow,
                          pressed && styles.rowPressed,
                          hasVoted && styles.rowDisabled,
                          isSelected && styles.rowSelected
                        ]}
                        disabled={hasVoted}
                      >
                        <View style={styles.colPhoto}>
                          <Image
                            source={{
                              uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                candidate.name
                              )}&background=1e90ff&color=fff&size=50`
                            }}
                            style={styles.tableAvatar}
                          />
                        </View>
                        <Text style={[styles.tableCell, styles.colName]}>{candidate.name}</Text>
                        <View style={styles.colAction}>
                          <View style={[styles.actionBadge, isSelected && styles.actionBadgeSelected]}>
                            <Text style={[styles.actionText, isSelected && styles.actionTextSelected]}>
                              {hasVoted ? "Closed" : isSelected ? "Selected" : "Select"}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
          {/* Submit Button */}
          <View style={styles.submitBar}>
            <Pressable
              onPress={() => setShowVoteModal(true)}
              disabled={Object.keys(selectedByPosition).length === 0 || hasVoted || !voterId}
              style={({ pressed }) => [
                styles.submitVoteButton,
                (Object.keys(selectedByPosition).length === 0 || hasVoted || !voterId) && styles.submitVoteButtonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.submitButtonText}>
                {hasVoted 
                  ? '✅ Already Voted' 
                  : Object.keys(selectedByPosition).length > 0 
                    ? `✓ Submit ${Object.keys(selectedByPosition).length} Vote${Object.keys(selectedByPosition).length > 1 ? 's' : ''}` 
                    : '📋 Select candidates to submit'}
              </Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Vote Confirmation Modal */}
      <Modal
        visible={showVoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVoteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Your Votes</Text>

            <ScrollView 
              style={styles.candidatesScrollView}
              contentContainerStyle={styles.candidatesScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {Object.entries(selectedByPosition).map(([position, candidate]) => (
                <View key={position} style={styles.selectedCandidateContainer}>
                  <Image
                    source={{
                      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        candidate.name
                      )}&background=1e90ff&color=fff&size=60`
                    }}
                    style={styles.modalAvatar}
                  />
                  <View style={styles.selectedCandidateInfo}>
                    <Text style={styles.selectedCandidateName}>{candidate.name}</Text>
                    <Text style={styles.selectedCandidatePosition}>{candidate.position}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* voterId taken from signed-in user; no manual entry needed */}

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowVoteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  (!voterId || Object.keys(selectedByPosition).length === 0) && styles.submitButtonDisabled
                ]}
                onPress={async () => {
                  // Check if user has already voted before submitting
                  try {
                    const alreadyVoted = await hasUserVoted(voterId.trim());
                    if (alreadyVoted) {
                      setHasVoted(true);
                      setShowVoteModal(false);
                      Alert.alert('Already Voted', 'You have already cast your vote for this election.');
                      return;
                    }
                  } catch (error) {
                    console.error('Error checking vote status:', error);
                  }

                  // Submit all votes
                  let allSuccess = true;
                  for (const [position, candidate] of Object.entries(selectedByPosition)) {
                    const ok = await submitVote(candidate.id, voterId.trim(), position);
                    if (!ok) {
                      allSuccess = false;
                      break;
                    }
                  }
                  
                  if (allSuccess) {
                    setHasVoted(true);
                    setShowVoteModal(false);
                    Alert.alert(
                      '✅ Votes Submitted Successfully!', 
                      `Your ${Object.keys(selectedByPosition).length} vote${Object.keys(selectedByPosition).length > 1 ? 's have' : ' has'} been recorded successfully. Thank you for participating!`,
                      [
                        {
                          text: 'Go to Home',
                          onPress: () => router.push('/home'),
                          style: 'default',
                        },
                        {
                          text: 'View Results',
                          onPress: () => router.push('/results'),
                        },
                      ]
                    );
                  } else {
                    setShowVoteModal(false);
                    Alert.alert('Vote Failed', 'You have already voted in this election.');
                  }
                }}
                disabled={!voterId || Object.keys(selectedByPosition).length === 0}
              >
                <Text style={styles.submitButtonText}>Submit Votes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2937",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  backText: { 
    color: "#3b82f6", 
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  resultsButton: {
    backgroundColor: "#10b981",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  resultsButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    color: "#9ca3af",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  instructionsContainer: {
    backgroundColor: "#eff6ff",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
    lineHeight: 20,
  },
  noteText: {
    fontSize: 12,
    color: "#ef4444",
    fontStyle: "italic",
    marginTop: 8,
  },
  // Table styles
  positionSection: {
    marginBottom: 24,
  },
  positionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  positionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
    marginLeft: 16,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    alignSelf: "flex-start",
  },
  courseIndicator: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366f1",
    fontStyle: "italic",
    marginBottom: 12,
    paddingBottom: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },
  tableContainer: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  tableHeaderText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  rowPressed: {
    backgroundColor: "#f3f4f6",
  },
  rowDisabled: {
    opacity: 0.5,
    backgroundColor: "#f9fafb",
  },
  rowSelected: {
    backgroundColor: "#eff6ff",
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  tableCell: {
    fontSize: 14,
    color: "#1f2937",
    textAlign: "center",
  },
  tableAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  colPhoto: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  colName: {
    flex: 2,
    textAlign: "left",
    paddingHorizontal: 8,
  },
  colPosition: {
    flex: 2,
    textAlign: "center",
  },
  colAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBadge: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  actionBadgeSelected: {
    backgroundColor: "#3b82f6",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  actionTextSelected: {
    color: "#fff",
  },
  voterIdContainer: {
    padding: 16,
  },
  voterIdLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 8,
  },
  voterIdInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
  },
  candidatesScrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  candidatesScrollContent: {
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 24,
    textAlign: "center",
  },
  selectedCandidateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  selectedCandidateInfo: {
    flex: 1,
  },
  selectedCandidateName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  selectedCandidatePosition: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    color: "#4b5563",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#10b981",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  submitBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitVoteButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitVoteButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
});
