import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { approveUser, getPendingUsers } from "./(auth)/login";

export default function AdminScreen() {
  const params = useLocalSearchParams<{ username?: string }>();
  const username = (params.username || "admin") as string;

  return (
    <View style={styles.container}>
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

      <CandidatesToggle />

      {/* Dashboard */}
      <Text style={styles.sectionTitle}>Dashboard</Text>
      <PendingApprovals />
    </View>
  );
}

function PendingApprovals() {
  const [refreshKey, setRefreshKey] = useState(0);
  const data = useMemo(() => getPendingUsers(), [refreshKey]);

  const approve = (email: string) => {
    const ok = approveUser(email);
    if (ok) setRefreshKey((k) => k + 1);
  };

  if (!data.length) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>No pending registrations.</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.listTitle}>Pending Registrations</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => (
          <View style={styles.pendingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pendingName}>{item.displayName || "Unnamed"}</Text>
              <Text style={styles.pendingMeta}>{item.email}</Text>
              {item.course ? <Text style={styles.pendingMeta}>Course: {item.course}</Text> : null}
              {item.studentId ? <Text style={styles.pendingMeta}>Student ID: {item.studentId}</Text> : null}
            </View>
            <Pressable onPress={() => approve(item.email)} style={({ pressed }) => [styles.approveButton, pressed && styles.buttonPressed]}>
              <Text style={styles.approveText}>Approve</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  profileCard: { flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: "#f5f8ff", padding: 16, borderRadius: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  name: { fontSize: 20, fontWeight: "800" },
  meta: { color: "#555" },
  logoutButton: { backgroundColor: "#ff4d4f", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  logoutText: { color: "#fff", fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  buttonPressed: { opacity: 0.75 },
  emptyBox: { padding: 16, borderRadius: 12, backgroundColor: "#fafafa", borderColor: "#eee", borderWidth: 1 },
  emptyText: { color: "#666" },
  listTitle: { fontSize: 16, fontWeight: "800" },
  pendingItem: { flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: "#fff", borderColor: "#eef2ff", borderWidth: 1, padding: 12, borderRadius: 12 },
  pendingName: { fontWeight: "800" },
  pendingMeta: { color: "#666" },
  approveButton: { backgroundColor: "#16a34a", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  approveText: { color: "#fff", fontWeight: "700" },
  homeButton: { backgroundColor: "#16a34a", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: "center", marginTop: 8, alignSelf: "flex-start" },
  homeText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

function CandidatesToggle() {
  return (
    <Pressable onPress={() => router.push({ pathname: "/candidates-home" })} style={({ pressed }) => [styles.homeButton, pressed && styles.buttonPressed]}>
      <Text style={styles.homeText}>Candidates</Text>
    </Pressable>
  );
}



