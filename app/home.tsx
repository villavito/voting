import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const params = useLocalSearchParams<{ username?: string }>();
  const username = params.username || "User";

  return (
    <View style={styles.container}>
      {/* User Profile */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: "https://ui-avatars.com/api/?name=User&background=1e90ff&color=fff&size=128" }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{String(username)}</Text>
          <Text style={styles.meta}>Role: User</Text>
        </View>
        <Pressable onPress={() => router.replace("/login")} style={({ pressed }) => [styles.logoutButton, pressed && styles.buttonPressed]}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {/* Dashboard */}
      <Text style={styles.sectionTitle}>Dashboard</Text>
      <View style={styles.dashboardBox}>
        <Text style={styles.dashboardText}>Welcome to your dashboard.</Text>
      </View>
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
  dashboardBox: { backgroundColor: "#ffffff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#eef2ff" },
  dashboardText: { color: "#333" },
  buttonPressed: { opacity: 0.75 },
  buttonText: { color: "#fff", fontWeight: "600" },
});


