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
  Modal,
  TextInput
} from "react-native";
import { listCandidates } from './services/firebaseService';
import { submitVote, getUserVote } from "./services/votingService";

export default function VotingScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voterId, setVoterId] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  // Load candidates on component mount and refresh
  useEffect(() => {
    loadCandidates();
  }, [refreshKey]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const candidatesData = await listCandidates(false);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error loading candidates:', error);
      Alert.alert('Error', 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleVotePress = (candidate: any) => {
    if (hasVoted) {
      Alert.alert("Already Voted", "You have already cast your vote for this election.");
      return;
    }
    setSelectedCandidate(candidate);
    setShowVoteModal(true);
  };

  const handleVoteSubmission = async () => {
    if (!voterId.trim()) {
      Alert.alert("Missing Information", "Please enter your voter ID or email.");
      return;
    }

    if (!selectedCandidate) {
      Alert.alert("No Selection", "Please select a candidate to vote for.");
      return;
    }

    const success = await submitVote(selectedCandidate.id, voterId.trim());

    if (success) {
      setHasVoted(true);
      setShowVoteModal(false);
      Alert.alert(
        "Vote Submitted!",
        `Your vote for ${selectedCandidate.name} has been recorded successfully.`,
        [
          {
            text: "View Results",
            onPress: () => router.push("/results"),
          },
          {
            text: "OK",
            onPress: () => {
              setVoterId("");
              refresh();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Vote Failed",
        "You have already voted in this election. Each voter can only vote once."
      );
    }
  };

  const checkVotingStatus = () => {
    if (voterId.trim()) {
      const userVote = getUserVote(voterId.trim());
      if (userVote) {
        setHasVoted(true);
        Alert.alert("Already Voted", "You have already cast your vote for this election.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗳️ Cast Your Vote</Text>
        <Pressable
          onPress={() => router.push("/results")}
          style={({ pressed }) => [styles.resultsButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.resultsButtonText}>View Results</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⏳</Text>
          <Text style={styles.emptyText}>Loading candidates...</Text>
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
            <Text style={styles.instructionsText}>
              1. Enter your voter ID or email
            </Text>
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

          <View style={styles.voterIdContainer}>
            <Text style={styles.voterIdLabel}>Voter ID / Email:</Text>
            <TextInput
              style={styles.voterIdInput}
              placeholder="Enter your voter ID or email"
              value={voterId}
              onChangeText={setVoterId}
              onBlur={checkVotingStatus}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <FlatList
            data={candidates}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleVotePress(item)}
                style={({ pressed }) => [
                  styles.candidateCard,
                  pressed && styles.cardPressed,
                  hasVoted && styles.votedCard
                ]}
                disabled={hasVoted}
              >
                <Image
                  source={{
                    uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      item.name
                    )}&background=1e90ff&color=fff&size=80`
                  }}
                  style={styles.avatar}
                />
                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName}>{item.name}</Text>
                  <Text style={styles.position}>Running for: {item.position}</Text>
                  <View style={styles.voteStatusContainer}>
                    <Text style={styles.voteStatusText}>
                      {hasVoted ? "✅ Voting Closed" : "🗳️ Tap to Vote"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
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
            <Text style={styles.modalTitle}>Confirm Your Vote</Text>

            {selectedCandidate && (
              <View style={styles.selectedCandidateContainer}>
                <Image
                  source={{
                    uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedCandidate.name
                    )}&background=1e90ff&color=fff&size=60`
                  }}
                  style={styles.modalAvatar}
                />
                <View style={styles.selectedCandidateInfo}>
                  <Text style={styles.selectedCandidateName}>
                    {selectedCandidate.name}
                  </Text>
                  <Text style={styles.selectedCandidatePosition}>
                    {selectedCandidate.position}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Voter ID / Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your voter ID or email"
                value={voterId}
                onChangeText={setVoterId}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

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
                  (!voterId || !selectedCandidate) && styles.submitButtonDisabled
                ]}
                onPress={handleVoteSubmission}
                disabled={!voterId || !selectedCandidate}
              >
                <Text style={styles.submitButtonText}>Submit Vote</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
  },
  resultsButton: {
    backgroundColor: "#10b981",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  resultsButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
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
  listContainer: {
    padding: 16,
  },
  candidateCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  votedCard: {
    opacity: 0.6,
    backgroundColor: "#f3f4f6",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  position: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
    marginBottom: 8,
  },
  voteStatusContainer: {
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  voteStatusText: {
    fontSize: 12,
    color: "#0ea5e9",
    fontWeight: "600",
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
    marginBottom: 20,
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
});
