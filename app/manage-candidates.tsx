import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View, Modal, TouchableOpacity, ScrollView } from "react-native";
import { addCandidate, listCandidates, removeCandidate, updateCandidate } from "./(auth)/login";

export default function ManageCandidatesScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const candidates = useMemo(() => listCandidates(), [refreshKey]);

  // Position options
  const positionOptions = [
    "President",
    "Vice President", 
    "Secretary",
    "Treasurer",
    "Auditor",
    "P.I.O",
    "Sgt. at Arms"
  ];

  // Form state
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");

  const refresh = () => setRefreshKey((k) => k + 1);

  const onAdd = () => {
    if (!name.trim() || !position.trim()) {
      Alert.alert("Missing fields", "Name and Position are required.");
      return;
    }
    addCandidate(name.trim(), position.trim());
    resetForm();
    refresh();
  };

  const onEdit = (candidate: any) => {
    setEditingId(candidate.id);
    setName(candidate.name);
    setPosition(candidate.position);
    setShowAddForm(true);
  };

  const onUpdate = () => {
    if (!editingId || !name.trim() || !position.trim()) {
      Alert.alert("Missing fields", "Name and Position are required.");
      return;
    }
    updateCandidate(editingId, { name: name.trim(), position: position.trim() });
    resetForm();
    refresh();
  };

  const onDelete = (id: string, name: string) => {
    Alert.alert("Delete Candidate", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          removeCandidate(id);
          refresh();
        },
      },
    ]);
  };

  const resetForm = () => {
    setName("");
    setPosition("");
    setEditingId(null);
    setShowAddForm(false);
    setShowPositionDropdown(false);
  };

  const handleSubmit = () => {
    if (editingId) {
      onUpdate();
    } else {
      onAdd();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Manage Candidates</Text>
        <View style={styles.headerSpacer} />
      </View>

      {candidates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No Candidates Registered Yet</Text>
          <Text style={styles.emptySubtext}>Get started by adding a new candidate</Text>
          <Pressable 
            onPress={() => setShowAddForm(true)}
            style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.addButtonText}>+ Add Candidate</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>
              {candidates.length} Candidate{candidates.length !== 1 ? 's' : ''}
            </Text>
            <Pressable 
              onPress={() => setShowAddForm(true)}
              style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.addButtonText}>+ Add Candidate</Text>
            </Pressable>
          </View>

          <FlatList
            data={candidates}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.candidateCard}>
                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName}>{item.name}</Text>
                  <Text style={styles.candidatePosition}>{item.position}</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => onEdit(item)}
                    style={({ pressed }) => [styles.editButton, pressed && styles.buttonPressed]}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onDelete(item.id, item.name)}
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.buttonPressed]}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Add/Edit Candidate Modal */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edit Candidate' : 'Add New Candidate'}
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter candidate's full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Position</Text>
              <Pressable
                style={styles.dropdownButton}
                onPress={() => setShowPositionDropdown(!showPositionDropdown)}
              >
                <Text style={[styles.dropdownButtonText, !position && { color: '#9ca3af' }]}>
                  {position || 'Select a position'}
                </Text>
              </Pressable>
              
              {showPositionDropdown && (
                <View style={styles.dropdown}>
                  <ScrollView style={styles.dropdownScrollView}>
                    {positionOptions.map((pos) => (
                      <Pressable
                        key={pos}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          pressed && styles.dropdownItemPressed
                        ]}
                        onPress={() => {
                          setPosition(pos);
                          setShowPositionDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{pos}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={resetForm}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.submitButton, (!name || !position) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!name || !position}
              >
                <Text style={styles.submitButtonText}>
                  {editingId ? 'Update' : 'Add'} Candidate
                </Text>
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
  
  // Empty State
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
  
  // Content
  contentContainer: { 
    flex: 1, 
    padding: 16 
  },
  listHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#1f2937" 
  },
  listContainer: { 
    paddingBottom: 24 
  },
  
  // Candidate Card
  candidateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  candidatePosition: {
    fontSize: 14,
    color: '#6b7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  // Buttons
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // Modal Styles
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
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
  dropdownButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    minHeight: 48,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScrollView: {
    maxHeight: 196, // Slightly less than parent to account for borders
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemPressed: {
    backgroundColor: '#f9fafb',
  },
  dropdownItemText: {
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
});
