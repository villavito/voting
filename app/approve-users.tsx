import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { approveUser, disapproveUser, getPendingUsers } from "./services/firebaseService";

export default function ApproveUsersScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const users = await getPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      console.error('Error loading pending users:', error);
      Alert.alert('Error', 'Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const onApprove = (email: string, name: string) => {
    Alert.alert("Approve User", `Are you sure you want to approve ${name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Approve", style: "default", onPress: () => {
        approveUser(email);
        refresh();
        Alert.alert("Success", `${name} has been approved successfully!`);
      }}
    ]);
  };

  const onDisapprove = (email: string, name: string) => {
    Alert.alert("Disapprove User", `Are you sure you want to disapprove ${name}? This action cannot be undone.`, [
      { 
        text: "Cancel", 
        style: "cancel" 
      },
      { 
        text: "Disapprove", 
        style: "destructive", 
        onPress: async () => {
          try {
            const success = await disapproveUser(email);
            if (success) {
              refresh();
              Alert.alert("Success", `${name} has been disapproved and removed.`);
            } else {
              Alert.alert("Error", `Failed to disapprove ${name}. Please try again.`);
            }
          } catch (error) {
            console.error("Error disapproving user:", error);
            Alert.alert("Error", `An error occurred while disapproving ${name}. Please try again.`);
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Approve User Registration</Text>
      </View>
      
      <View style={styles.mainContainer}>
        <Pressable 
          onPress={() => router.back()} 
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptySubtext}>Loading...</Text>
          </View>
        ) : pendingUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>All caught up!</Text>
            <Text style={styles.emptySubtext}>No pending user registrations to approve.</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} waiting for approval
              </Text>
            </View>
            
            <FlatList
              data={pendingUsers}
              keyExtractor={(item) => item.email}
              renderItem={({ item }) => (
                <View style={styles.userCard}>
                  <Image
                    source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.displayName || item.email)}&background=f59e0b&color=fff&size=80` }}
                    style={styles.avatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.displayName || "Unnamed User"}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    {item.course && <Text style={styles.userMeta}>Course: {item.course}</Text>}
                    {item.studentId && <Text style={styles.userMeta}>Student ID: {item.studentId}</Text>}
                  </View>
                  <View style={styles.actions}>
                    <Pressable 
                      onPress={() => onApprove(item.email, item.displayName || item.email)} 
                      style={({ pressed }) => [styles.approveButton, pressed && styles.buttonPressed]}
                    >
                      <Text style={styles.buttonText}>✓ Approve</Text>
                    </Pressable>
                    <Pressable 
                      onPress={() => onDisapprove(item.email, item.displayName || item.email)}
                      style={({ pressed }) => [styles.disapproveButton, pressed && styles.buttonPressed]}
                    >
                      <Text style={styles.buttonText}>✗ Deny</Text>
                    </Pressable>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8fafc" 
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0"
  },
  mainContainer: {
    flex: 1,
    padding: 16
  },
  backButton: {
    paddingVertical: 2,
    paddingHorizontal: 0,
    marginBottom: 8,
    alignSelf: 'flex-start'
  },
  backText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "500"
  },
  buttonPressed: {
    opacity: 0.7,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937"
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 32 
  },
  emptyIcon: { 
    fontSize: 64, 
    marginBottom: 16 
  },
  emptyText: { 
    fontSize: 24, 
    fontWeight: "800", 
    color: "#1f2937", 
    marginBottom: 8 
  },
  emptySubtext: { 
    fontSize: 16, 
    color: "#6b7280", 
    textAlign: "center" 
  },
  contentContainer: { 
    flex: 1 
  },
  statsContainer: { 
    backgroundColor: "#e0f2fe", 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 16,
    alignItems: "center" 
  },
  statsText: { 
    color: "#0369a1", 
    fontWeight: "600",
    fontSize: 14
  },
  listContainer: { paddingBottom: 24 },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
  },
  approveButton: {
    backgroundColor: "#10b981",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    minWidth: 100,
  },
  disapproveButton: {
    backgroundColor: "#f43f5e",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    minWidth: 100,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
