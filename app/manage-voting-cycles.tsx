import { router } from "expo-router";
import React, { useEffect, useState, useMemo } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View, Modal, ScrollView } from "react-native";
import { 
  listVotingCycles, 
  createVotingCycle, 
  updateVotingCycle, 
  makeCycleLive, 
  endVotingCycle, 
  deleteVotingCycle,
  listCandidates,
  VotingCycle,
  Candidate
} from './services/firebaseService';

export default function ManageVotingCyclesScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<VotingCycle[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cycleName, setCycleName] = useState("");
  const [editingCycle, setEditingCycle] = useState<VotingCycle | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string[]>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Position options
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

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cyclesData, candidatesData] = await Promise.all([
        listVotingCycles(),
        listCandidates(true)
      ]);
      setCycles(cyclesData);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleCreateCycle = async () => {
    if (!cycleName.trim()) {
      Alert.alert("Missing field", "Cycle name is required.");
      return;
    }

    if (isCreating) return; // Prevent multiple clicks

    try {
      setIsCreating(true);
      await createVotingCycle(cycleName.trim());
      setCycleName("");
      setShowCreateModal(false);
      refresh();
      Alert.alert("Success", "Voting cycle created successfully");
    } catch (error) {
      console.error('Error creating cycle:', error);
      Alert.alert("Error", "Failed to create voting cycle");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCycle = (cycle: VotingCycle) => {
    setEditingCycle(cycle);
    setSelectedCandidates(cycle.selectedCandidates || {});
    setShowEditModal(true);
  };

  const handleSaveCycle = async () => {
    if (!editingCycle) return;

    try {
      await updateVotingCycle(editingCycle.id, {
        selectedCandidates
      });
      setShowEditModal(false);
      setEditingCycle(null);
      setSelectedCandidates({});
      refresh();
      Alert.alert("Success", "Voting cycle updated successfully");
    } catch (error) {
      console.error('Error updating cycle:', error);
      Alert.alert("Error", "Failed to update voting cycle");
    }
  };

  const handleMakeLive = (cycle: VotingCycle) => {
    // Check if any candidates are selected
    const hasCandidates = Object.keys(cycle.selectedCandidates || {}).length > 0;
    
    if (!hasCandidates) {
      Alert.alert("No Candidates", "Please select candidates for at least one position before making the cycle live.");
      return;
    }

    Alert.alert(
      "Make Cycle Live",
      `Are you sure you want to make "${cycle.name}" live? This will end any currently active cycle and allow users to vote.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Make Live",
          onPress: async () => {
            try {
              await makeCycleLive(cycle.id);
              refresh();
              Alert.alert("Success", "Voting cycle is now live!");
            } catch (error) {
              console.error('Error making cycle live:', error);
              Alert.alert("Error", "Failed to make cycle live");
            }
          },
        },
      ]
    );
  };

  const handleEndCycle = (cycle: VotingCycle) => {
    Alert.alert(
      "End Voting Cycle",
      `Are you sure you want to end "${cycle.name}"? Users will no longer be able to vote.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Cycle",
          style: "destructive",
          onPress: async () => {
            try {
              await endVotingCycle(cycle.id);
              refresh();
              Alert.alert("Success", "Voting cycle ended successfully");
            } catch (error) {
              console.error('Error ending cycle:', error);
              Alert.alert("Error", "Failed to end voting cycle");
            }
          },
        },
      ]
    );
  };

  const handleDeleteCycle = (cycle: VotingCycle) => {
    if (cycle.status === 'live') {
      Alert.alert("Cannot Delete", "Cannot delete a live voting cycle. Please end it first.");
      return;
    }

    Alert.alert(
      "Delete Voting Cycle",
      `Are you sure you want to delete "${cycle.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVotingCycle(cycle.id);
              refresh();
              Alert.alert("Success", "Voting cycle deleted successfully");
            } catch (error) {
              console.error('Error deleting cycle:', error);
              Alert.alert("Error", "Failed to delete voting cycle");
            }
          },
        },
      ]
    );
  };

  const toggleCandidateSelection = (position: string, candidateId: string) => {
    setSelectedCandidates(prev => {
      const positionCandidates = prev[position] || [];
      const isSelected = positionCandidates.includes(candidateId);
      
      if (isSelected) {
        // Remove candidate
        const updated = positionCandidates.filter(id => id !== candidateId);
        if (updated.length === 0) {
          const newState = { ...prev };
          delete newState[position];
          return newState;
        }
        return { ...prev, [position]: updated };
      } else {
        // Add candidate
        return { ...prev, [position]: [...positionCandidates, candidateId] };
      }
    });
  };

  const handleSelectAll = () => {
    const allSelected: Record<string, string[]> = {};
    candidates.forEach((candidate) => {
      if (!allSelected[candidate.position]) {
        allSelected[candidate.position] = [];
      }
      allSelected[candidate.position].push(candidate.id);
    });
    setSelectedCandidates(allSelected);
  };

  const handleUnselectAll = () => {
    setSelectedCandidates({});
  };

  const isAllSelected = () => {
    if (candidates.length === 0) return false;
    const totalCandidates = candidates.length;
    const selectedCount = Object.values(selectedCandidates).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    return totalCandidates === selectedCount;
  };

  const groupedCandidates = useMemo(() => {
    const grouped: Record<string, Candidate[]> = {};
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
    
    return sortedPositions.map(position => ({ 
      position, 
      candidates: grouped[position] 
    }));
  }, [candidates]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'live':
        return styles.statusLive;
      case 'ended':
        return styles.statusEnded;
      default:
        return styles.statusDraft;
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'live':
        return styles.statusTextLive;
      case 'ended':
        return styles.statusTextEnded;
      default:
        return styles.statusTextDraft;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Manage Voting Cycles</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptySubtext}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>
              {cycles.length} Voting Cycle{cycles.length !== 1 ? 's' : ''}
            </Text>
            <Pressable 
              onPress={() => setShowCreateModal(true)}
              style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.addButtonText}>+ Create New Cycle</Text>
            </Pressable>
          </View>

          {cycles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🗳️</Text>
              <Text style={styles.emptyText}>No Voting Cycles Yet</Text>
              <Text style={styles.emptySubtext}>Create a cycle to manage voting sessions</Text>
            </View>
          ) : (
            <FlatList
              data={cycles}
              keyExtractor={(item) => item.id}
              renderItem={({ item: cycle }) => {
                const candidateCount = Object.values(cycle.selectedCandidates || {}).reduce(
                  (sum, arr) => sum + arr.length, 
                  0
                );
                
                return (
                  <View style={styles.cycleCard}>
                    <View style={styles.cycleHeader}>
                      <View style={styles.cycleInfo}>
                        <Text style={styles.cycleName}>{cycle.name}</Text>
                        <Text style={styles.cycleDetails}>
                          {candidateCount} candidate{candidateCount !== 1 ? 's' : ''} selected
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, getStatusBadgeStyle(cycle.status)]}>
                        <Text style={[styles.statusText, getStatusTextStyle(cycle.status)]}>
                          {cycle.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cycleActions}>
                      {cycle.status === 'draft' && (
                        <>
                          <Pressable
                            onPress={() => handleEditCycle(cycle)}
                            style={({ pressed }) => [styles.actionButton, styles.editButton, pressed && styles.buttonPressed]}
                          >
                            <Text style={styles.actionButtonText}>Edit Candidates</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleMakeLive(cycle)}
                            style={({ pressed }) => [styles.actionButton, styles.liveButton, pressed && styles.buttonPressed]}
                          >
                            <Text style={styles.actionButtonText}>Make Live</Text>
                          </Pressable>
                        </>
                      )}
                      
                      {cycle.status === 'live' && (
                        <Pressable
                          onPress={() => handleEndCycle(cycle)}
                          style={({ pressed }) => [styles.actionButton, styles.endButton, pressed && styles.buttonPressed]}
                        >
                          <Text style={styles.actionButtonText}>End Voting</Text>
                        </Pressable>
                      )}

                      {cycle.status !== 'live' && (
                        <Pressable
                          onPress={() => handleDeleteCycle(cycle)}
                          style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && styles.buttonPressed]}
                        >
                          <Text style={styles.actionButtonText}>Delete</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              }}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Create Cycle Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Voting Cycle</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cycle Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2024 Student Council Election"
                value={cycleName}
                onChangeText={setCycleName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setCycleName("");
                  setIsCreating(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.submitButton, (!cycleName || isCreating) && styles.submitButtonDisabled]}
                onPress={handleCreateCycle}
                disabled={!cycleName || isCreating}
              >
                <Text style={styles.submitButtonText}>{isCreating ? 'Creating...' : 'Create Cycle'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Cycle Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowEditModal(false);
          setEditingCycle(null);
          setSelectedCandidates({});
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Candidates for {editingCycle?.name}
              </Text>
              <Pressable
                onPress={isAllSelected() ? handleUnselectAll : handleSelectAll}
                style={({ pressed }) => [
                  styles.selectAllButton,
                  pressed && styles.buttonPressed
                ]}
              >
                <Text style={styles.selectAllButtonText}>
                  {isAllSelected() ? 'Unselect All' : 'Select All'}
                </Text>
              </Pressable>
            </View>
            
            <ScrollView style={styles.candidateScrollView} showsVerticalScrollIndicator={false}>
              {groupedCandidates.map(({ position, candidates: posCandidates }) => (
                <View key={position} style={styles.positionSection}>
                  <Text style={styles.positionTitle}>{position}</Text>
                  {posCandidates.map((candidate) => {
                    const isSelected = (selectedCandidates[position] || []).includes(candidate.id);
                    return (
                      <Pressable
                        key={candidate.id}
                        onPress={() => toggleCandidateSelection(position, candidate.id)}
                        style={({ pressed }) => [
                          styles.candidateItem,
                          isSelected && styles.candidateItemSelected,
                          pressed && styles.buttonPressed
                        ]}
                      >
                        <View style={styles.candidateInfo}>
                          <Text style={styles.candidateName}>{candidate.name}</Text>
                          {candidate.party && (
                            <Text style={styles.candidateDetail}>Party: {candidate.party}</Text>
                          )}
                          {candidate.course && (
                            <Text style={styles.candidateDetail}>Course: {candidate.course}</Text>
                          )}
                        </View>
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingCycle(null);
                  setSelectedCandidates({});
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSaveCycle}
              >
                <Text style={styles.submitButtonText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 16, 
    backgroundColor: "#fff", 
    borderBottomWidth: 1, 
    borderBottomColor: "#e2e8f0" 
  },
  backButton: { 
    backgroundColor: "#6b7280", 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 8 
  },
  backText: { color: "#fff", fontWeight: "600" },
  title: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: "#1f2937",
    marginLeft: 16
  },
  headerSpacer: { flex: 1 },
  
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 24 
  },
  emptyIcon: { 
    fontSize: 64, 
    marginBottom: 16,
    color: '#9ca3af',
  },
  emptyText: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#1f2937",
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: { 
    fontSize: 16, 
    color: "#6b7280", 
    textAlign: "center",
    marginBottom: 24
  },
  
  contentContainer: { 
    flex: 1, 
    padding: 16 
  },
  listHeader: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#1f2937" 
  },
  listContainer: { 
    paddingBottom: 24 
  },
  
  cycleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cycleInfo: {
    flex: 1,
  },
  cycleName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  cycleDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  statusDraft: {
    backgroundColor: '#fef3c7',
  },
  statusLive: {
    backgroundColor: '#dcfce7',
  },
  statusEnded: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextDraft: {
    color: '#92400e',
  },
  statusTextLive: {
    color: '#166534',
  },
  statusTextEnded: {
    color: '#4b5563',
  },
  cycleActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#f59e0b',
  },
  liveButton: {
    backgroundColor: '#10b981',
  },
  endButton: {
    backgroundColor: '#ef4444',
  },
  deleteButton: {
    backgroundColor: '#6b7280',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
  },
  modalContentLarge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  selectAllButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectAllButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  candidateScrollView: {
    maxHeight: 400,
  },
  positionSection: {
    marginBottom: 20,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  candidateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  candidateItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  candidateDetail: {
    fontSize: 12,
    color: '#6b7280',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
