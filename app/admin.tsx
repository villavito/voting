import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View, ScrollView } from "react-native";
import { addCandidate, approveUser, getPendingUsers, listCandidates, removeCandidate } from "./(auth)/login";

export default function AdminScreen() {
  const params = useLocalSearchParams<{ username?: string }>();
  const username = (params.username || "admin") as string;

  // Candidates state
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
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

  // Add form state
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");

  const refreshCandidates = () => setRefreshKey((k) => k + 1);

  const onAddCandidate = () => {
    if (!name.trim() || !position.trim()) {
      Alert.alert("Missing fields", "Name and Position are required.");
      return;
    }
    addCandidate(name.trim(), position.trim());
    setName("");
    setPosition("");
    setShowAddForm(false);
    setShowPositionDropdown(false);
    refreshCandidates();
  };

  const cancelAdd = () => {
    setName("");
    setPosition("");
    setShowPositionDropdown(false);
    setShowAddForm(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Admin Profile */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: "https://ui-avatars.com/api/?name=Admin&background=1e90ff&color=fff&size=128" }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Admin</Text>
            <Text style={styles.meta}>Username: {username}</Text>
            <Text style={styles.meta}>Role: System Administrator</Text>
          </View>
          <Pressable onPress={() => router.replace("/login")} style={({ pressed }) => [styles.logoutButton, pressed && styles.buttonPressed]}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

        {/* Approve User Registration Button */}
        <Pressable onPress={() => router.push({ pathname: "/approve-users" })} style={({ pressed }) => [styles.approveUsersButton, pressed && styles.buttonPressed]}>
          <Text style={styles.approveUsersText}>👥 Approve User Registration</Text>
        </Pressable>

        {/* Manage Candidates Button */}
        <Pressable onPress={() => router.push({ pathname: "/manage-candidates" })} style={({ pressed }) => [styles.manageCandidatesButton, pressed && styles.buttonPressed]}>
          <Text style={styles.manageCandidatesText}>📋 Manage Candidates</Text>
        </Pressable>

        {/* View Results Button */}
        <Pressable onPress={() => router.push({ pathname: "/view-results" })} style={({ pressed }) => [styles.viewResultsButton, pressed && styles.buttonPressed]}>
          <Text style={styles.viewResultsText}>📊 View Election Results</Text>
        </Pressable>

        {/* User Monitoring Button */}
        <Pressable onPress={() => router.push({ pathname: "/user-monitoring-landing" })} style={({ pressed }) => [styles.userMonitoringButton, pressed && styles.buttonPressed]}>
          <Text style={styles.userMonitoringText}>👥 User Monitoring</Text>
        </Pressable>

        {/* Dashboard */}
        <View style={styles.dashboardHeader}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
        </View>

        {/* Add your dashboard content here */}
        <View style={styles.dashboardContent}>
          <Text style={styles.welcomeText}>Welcome to the Admin Dashboard</Text>
          <Text style={styles.instructions}>
            Use the buttons above to manage the election, view results, or approve user registrations.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40, // Extra padding at the bottom for better scrolling
    gap: 16,
  },
  profileCard: { 
    flexDirection: "row", 
    gap: 12, 
    alignItems: "center", 
    backgroundColor: "#f5f8ff", 
    padding: 16, 
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: { 
    width: 64, 
    height: 64, 
    borderRadius: 32 
  },
  name: { 
    fontSize: 18, 
    fontWeight: "700",
    color: '#1e293b',
  },
  meta: { 
    fontSize: 12, 
    color: "#64748b" 
  },
  logoutButton: { 
    backgroundColor: "#ef4444", 
    paddingVertical: 8, 
    paddingHorizontal: 14, 
    borderRadius: 8 
  },
  logoutText: { 
    color: "#fff", 
    fontWeight: "600" 
  },
  buttonPressed: { 
    opacity: 0.8 
  },
  manageCandidatesButton: { 
    backgroundColor: "#1e90ff", 
    padding: 16, 
    borderRadius: 10, 
    alignItems: "center", 
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  manageCandidatesText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 18 
  },
  approveUsersButton: { 
    backgroundColor: "#16a34a", 
    padding: 16, 
    borderRadius: 10, 
    marginTop: 8, 
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  approveUsersText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 18 
  },
  viewResultsButton: { 
    backgroundColor: "#8e44ad", 
    padding: 16, 
    borderRadius: 10, 
    alignItems: "center",
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  viewResultsText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 18 
  },
  userMonitoringButton: { 
    backgroundColor: "#f59e0b", 
    padding: 16, 
    borderRadius: 10, 
    marginTop: 8, 
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userMonitoringText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 18 
  },
  dashboardHeader: { 
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  dashboardContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
