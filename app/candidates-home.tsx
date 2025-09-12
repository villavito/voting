import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { addCandidate, listCandidates, removeCandidate, updateCandidate } from "./(auth)/login";

export default function CandidatesHomeScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const candidates = useMemo(() => listCandidates(), [refreshKey]);

  // Add form state
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [section, setSection] = useState("");
  const [course, setCourse] = useState("");
  const [slogan, setSlogan] = useState("");

  const refresh = () => setRefreshKey((k) => k + 1);

  const onAdd = () => {
    if (!name.trim() || !position.trim()) {
      Alert.alert("Missing fields", "Name and Position are required.");
      return;
    }
    addCandidate(name.trim(), position.trim(), { 
      party: section.trim() || undefined, 
      course: course.trim() || undefined,
      slogan: slogan.trim() || undefined 
    });
    setName("");
    setPosition("");
    setSection("");
    setCourse("");
    setSlogan("");
    setShowAddForm(false);
    refresh();
  };

  const onEdit = (candidate: any) => {
    setEditingId(candidate.id);
    setName(candidate.name);
    setPosition(candidate.position);
    setSection(candidate.party || "");
    setCourse(candidate.course || "");
    setSlogan(candidate.slogan || "");
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
      party: section.trim() || undefined,
      course: course.trim() || undefined,
      slogan: slogan.trim() || undefined
    });
    setName("");
    setPosition("");
    setSection("");
    setCourse("");
    setSlogan("");
    setEditingId(null);
    setShowAddForm(false);
    refresh();
  };

  const onRemove = (id: string) => {
    Alert.alert("Remove Candidate", "Are you sure you want to remove this candidate?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => {
        removeCandidate(id);
        refresh();
      }}
    ]);
  };

  const cancelEdit = () => {
    setName("");
    setPosition("");
    setSection("");
    setCourse("");
    setSlogan("");
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Candidates</Text>
        <View style={styles.headerButtons}>
          <Pressable onPress={() => setShowAddForm(!showAddForm)} style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}>
            <Text style={styles.addText}>{showAddForm ? "Hide Form" : "Add Candidate"}</Text>
          </Pressable>
          <Pressable onPress={refresh} style={({ pressed }) => [styles.refreshButton, pressed && styles.buttonPressed]}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>
      </View>

      {showAddForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{editingId ? "Edit Candidate" : "Add New Candidate"}</Text>
          <TextInput placeholder="Name *" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="Position *" value={position} onChangeText={setPosition} style={styles.input} />
          <TextInput placeholder="Section" value={section} onChangeText={setSection} style={styles.input} />
          <TextInput placeholder="Course" value={course} onChangeText={setCourse} style={styles.input} />
          <TextInput placeholder="Slogan" value={slogan} onChangeText={setSlogan} style={styles.input} multiline />
          <View style={styles.formButtons}>
            <Pressable onPress={editingId ? onUpdate : onAdd} style={({ pressed }) => [styles.saveButton, pressed && styles.buttonPressed]}>
              <Text style={styles.saveText}>{editingId ? "Update" : "Add"}</Text>
            </Pressable>
            <Pressable onPress={cancelEdit} style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {candidates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No candidates registered yet.</Text>
          <Text style={styles.emptySubtext}>Use "Add Candidate" to create new candidates.</Text>
        </View>
      ) : (
        <FlatList
          data={candidates}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.candidateCard}>
              <Image
                source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=1e90ff&color=fff&size=80` }}
                style={styles.avatar}
              />
              <View style={styles.candidateInfo}>
                <Text style={styles.candidateName}>{item.name}</Text>
                <Text style={styles.position}>Running for: {item.position}</Text>
                {item.party && <Text style={styles.detail}>Section: {item.party}</Text>}
                {item.course && <Text style={styles.detail}>Course: {item.course}</Text>}
                {item.slogan && <Text style={styles.slogan}>"{item.slogan}"</Text>}
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => onEdit(item)} style={({ pressed }) => [styles.actionButton, styles.editButton, pressed && styles.buttonPressed]}>
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => onRemove(item.id)} style={({ pressed }) => [styles.actionButton, styles.removeButton, pressed && styles.buttonPressed]}>
                  <Text style={styles.actionText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 16, 
    backgroundColor: "#fff", 
    borderBottomWidth: 1, 
    borderBottomColor: "#e2e8f0" 
  },
  backButton: { backgroundColor: "#6b7280", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  backText: { color: "#fff", fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "800", color: "#1f2937" },
  headerButtons: { flexDirection: "row", gap: 8 },
  addButton: { backgroundColor: "#16a34a", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  addText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  refreshButton: { backgroundColor: "#1e90ff", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  refreshText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  formContainer: { backgroundColor: "#fff", padding: 16, margin: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  formTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12, color: "#1f2937" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  formButtons: { flexDirection: "row", gap: 8 },
  saveButton: { flex: 1, backgroundColor: "#16a34a", paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  cancelButton: { flex: 1, backgroundColor: "#6b7280", paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  cancelText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#6b7280", marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: "#9ca3af", textAlign: "center" },
  listContainer: { padding: 16 },
  candidateCard: { 
    backgroundColor: "#fff", 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  candidateInfo: { flex: 1, marginBottom: 12 },
  candidateName: { fontSize: 18, fontWeight: "800", color: "#1f2937", marginBottom: 4 },
  position: { fontSize: 14, color: "#1e90ff", fontWeight: "600", marginBottom: 2 },
  detail: { fontSize: 12, color: "#6b7280", marginBottom: 2 },
  slogan: { fontSize: 12, color: "#16a34a", fontStyle: "italic", marginTop: 4 },
  actions: { flexDirection: "row", gap: 8 },
  actionButton: { flex: 1, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 4, alignItems: "center" },
  editButton: { backgroundColor: "#f59e0b" },
  removeButton: { backgroundColor: "#ef4444" },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  buttonPressed: { opacity: 0.75 },
});
