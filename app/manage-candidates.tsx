import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View, Modal, ScrollView } from "react-native";
import { addCandidate, listCandidates, updateCandidate, deleteCandidate } from './services/firebaseService';

export default function ManageCandidatesScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await listCandidates(true);
        setCandidates(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshKey]);

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

  // Course options
  const courseOptions = [
    "BSIT",
    "CSS"
  ];

  // Form state
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [party, setParty] = useState("");
  const [course, setCourse] = useState("");

  // Search and filters
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string | null>(null);
  const [publishedFilter, setPublishedFilter] = useState<null | boolean>(null);

  const refresh = () => setRefreshKey((k) => k + 1);

  const onAdd = () => {
    if (!name.trim() || !position.trim()) {
      Alert.alert("Missing fields", "Name and Position are required.");
      return;
    }
    addCandidate({
      name: name.trim(),
      position: position.trim(),
      party: party.trim() || undefined,
      course: course.trim() || undefined,
      published: true,
    });
    resetForm();
    refresh();
  };

  const onEdit = (candidate: any) => {
    if (!candidate.name.trim() || !candidate.position.trim()) {
      Alert.alert("Missing fields", "Name and Position are required.");
      return;
    }
    setEditingId(candidate.id);
    setName(candidate.name);
    setPosition(candidate.position);
    setParty(candidate.party || "");
    setCourse(candidate.course || "");
    setShowAddForm(true);
  };

  const onUpdate = () => {
    if (!editingId || !name.trim() || !position.trim()) {
      Alert.alert("Missing fields", "Name and Position are required.");
      return;
    }
    updateCandidate(editingId, {
      name: name.trim(),
      position: position.trim(),
      party: party.trim() || undefined,
      course: course.trim() || undefined,
    });
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
          deleteCandidate(id);
          refresh();
          resetForm();
        },
      },
    ]);
  };

  const resetForm = () => {
    setName("");
    setPosition("");
    setParty("");
    setCourse("");
    setEditingId(null);
    setShowAddForm(false);
    setShowPositionDropdown(false);
    setShowCourseDropdown(false);
  };

  const handleSubmit = () => {
    if (editingId) {
      onUpdate();
    } else {
      onAdd();
    }
  };

  const filteredCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.filter((c) => {
      const matchesQuery = !q || c.name?.toLowerCase().includes(q) || c.position?.toLowerCase().includes(q) || c.party?.toLowerCase?.().includes(q);
      const matchesPosition = !positionFilter || c.position === positionFilter;
      const matchesPublished = publishedFilter === null || !!c.published === publishedFilter;
      return matchesQuery && matchesPosition && matchesPublished;
    });
  }, [candidates, query, positionFilter, publishedFilter]);

  // Group candidates by position
  const groupedCandidates = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredCandidates.forEach((candidate) => {
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
  }, [filteredCandidates]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Manage Candidates</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptySubtext}>Loading...</Text>
        </View>
      ) : candidates.length === 0 ? (
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
          <View style={{ gap: 10, marginBottom: 10 }}>
            <TextInput
              placeholder="Search by name, position, party"
              value={query}
              onChangeText={setQuery}
              style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10 }}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Pressable onPress={() => setPublishedFilter(null)} style={[styles.chip, publishedFilter === null && styles.chipActive]}>
                <Text style={[styles.chipText, publishedFilter === null && styles.chipTextActive]}>All</Text>
              </Pressable>
              <Pressable onPress={() => setPublishedFilter(true)} style={[styles.chip, publishedFilter === true && styles.chipActive]}>
                <Text style={[styles.chipText, publishedFilter === true && styles.chipTextActive]}>Published</Text>
              </Pressable>
              <Pressable onPress={() => setPublishedFilter(false)} style={[styles.chip, publishedFilter === false && styles.chipActive]}>
                <Text style={[styles.chipText, publishedFilter === false && styles.chipTextActive]}>Draft</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <Pressable onPress={() => setPositionFilter(null)} style={[styles.chip, !positionFilter && styles.chipActive]}>
                <Text style={[styles.chipText, !positionFilter && styles.chipTextActive]}>All Positions</Text>
              </Pressable>
              {positionOptions.map((pos) => (
                <Pressable key={pos} onPress={() => setPositionFilter(pos)} style={[styles.chip, positionFilter === pos && styles.chipActive]}>
                  <Text style={[styles.chipText, positionFilter === pos && styles.chipTextActive]}>{pos}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
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
            data={groupedCandidates}
            keyExtractor={(item) => item.position}
            renderItem={({ item: positionGroup }) => (
              <View style={styles.positionSection}>
                <Text style={styles.positionTitle}>{positionGroup.position}</Text>
                <View style={styles.tableContainer}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.colName]}>Name</Text>
                    <Text style={[styles.tableHeaderText, styles.colDetails]}>Details</Text>
                    <Text style={[styles.tableHeaderText, styles.colStatus]}>Status</Text>
                    <Text style={[styles.tableHeaderText, styles.colActions]}>Actions</Text>
                  </View>
                  
                  {/* Table Body */}
                  {positionGroup.candidates.map((candidate) => (
                    <View key={candidate.id} style={styles.tableRow}>
                      <View style={styles.colName}>
                        <Text style={styles.candidateName}>{candidate.name}</Text>
                      </View>
                      <View style={styles.colDetails}>
                        {!!candidate.party && <Text style={styles.detailText}>Party: {candidate.party}</Text>}
                        {!!candidate.course && <Text style={styles.detailText}>Course: {candidate.course}</Text>}
                      </View>
                      <View style={styles.colStatus}>
                        <View style={[styles.statusBadge, candidate.published ? styles.publishedBadge : styles.unpublishedBadge]}>
                          <Text style={[styles.statusText, candidate.published ? styles.publishedText : styles.unpublishedText]}>
                            {candidate.published ? "Published" : "Draft"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.colActions}>
                        <Pressable
                          onPress={() => onEdit(candidate)}
                          style={({ pressed }) => [styles.editButton, pressed && styles.buttonPressed]}
                        >
                          <Text style={styles.editButtonText}>Edit</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => onDelete(candidate.id, candidate.name)}
                          style={({ pressed }) => [styles.deleteButton, pressed && styles.buttonPressed]}
                        >
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
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

            <View style={styles.formGroup}>
              <Text style={styles.label}>Party (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter party"
                value={party}
                onChangeText={setParty}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Course (optional)</Text>
              <Pressable
                style={styles.dropdownButton}
                onPress={() => setShowCourseDropdown(!showCourseDropdown)}
              >
                <Text style={[styles.dropdownButtonText, !course && { color: '#9ca3af' }]}>
                  {course || 'Select a course'}
                </Text>
              </Pressable>
              
              {showCourseDropdown && (
                <View style={styles.dropdown}>
                  <ScrollView style={styles.dropdownScrollView}>
                    {courseOptions.map((courseOption) => (
                      <Pressable
                        key={courseOption}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          pressed && styles.dropdownItemPressed
                        ]}
                        onPress={() => {
                          setCourse(courseOption);
                          setShowCourseDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{courseOption}</Text>
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
  
  // Candidate Card
  // Table styles
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishedBadge: {
    backgroundColor: '#dcfce7',
  },
  unpublishedBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  publishedText: {
    color: '#166534',
  },
  unpublishedText: {
    color: '#92400e',
  },
  publishButton: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  unpublishButton: {
    backgroundColor: '#f59e0b',
  },
  publishButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  unpublishButtonText: {
    color: '#fff',
  },
  
  // Buttons
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
  editButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 14,
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
  positionSection: {
    marginBottom: 24,
  },
  positionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
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
    fontSize: 13,
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
  colName: {
    flex: 2,
    paddingHorizontal: 4,
  },
  colDetails: {
    flex: 2,
    paddingHorizontal: 4,
  },
  colStatus: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  colActions: {
    flex: 2,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  candidateName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
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
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  chipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
});
