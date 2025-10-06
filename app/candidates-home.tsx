import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { listCandidates } from "./services/firebaseService";

export default function CandidatesHomeScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Candidates</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading candidates...</Text>
        </View>
      ) : candidates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No candidates registered yet.</Text>
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
  headerSpacer: { width: 80 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#6b7280", marginBottom: 8 },
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
  buttonPressed: { opacity: 0.75 },
});
