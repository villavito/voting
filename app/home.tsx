import { router, useLocalSearchParams } from "expo-router";
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from "react";
import { Alert, Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { auth } from "../firebase";
import { getUserData } from "./services/authService";
import { getActiveCycle } from "./services/firebaseService";

export default function HomeScreen() {
  const params = useLocalSearchParams<{ username?: string }>();
  const username = params.username || "User";
  const [isVotingLive, setIsVotingLive] = useState(false);
  const [cycleName, setCycleName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userData = await getUserData(user.uid);
          if (userData?.isAdmin) {
            setIsAdmin(true);
          }
        } catch (error) {
          console.error("Error checking user role:", error);
        }
      }
    };
    checkUserRole();
  }, []);

  // Check for active voting cycle on mount and set up polling (ONLY for regular users)
  useEffect(() => {
    // Don't run this for admins
    if (isAdmin) return;

    let intervalId: any;

    const checkForActiveCycle = async () => {
      try {
        const activeCycle = await getActiveCycle();
        
        if (activeCycle && !isVotingLive) {
          // Voting just became live
          setIsVotingLive(true);
          setCycleName(activeCycle.name);
          
          Alert.alert(
            "🎉 Voting is Now Open!",
            `The "${activeCycle.name}" voting cycle is now live. You can now cast your vote!`,
            [
              {
                text: "Vote Now",
                onPress: () => router.push("/vote"),
              },
              {
                text: "Later",
                style: "cancel",
              },
            ]
          );
        } else if (!activeCycle && isVotingLive) {
          // Voting ended
          setIsVotingLive(false);
          setCycleName("");
        } else if (activeCycle) {
          // Update cycle info
          setIsVotingLive(true);
          setCycleName(activeCycle.name);
        }
      } catch (error) {
        console.error("Error checking for active cycle:", error);
      }
    };

    // Check immediately on mount
    checkForActiveCycle();

    // Poll every 10 seconds for cycle status
    intervalId = setInterval(checkForActiveCycle, 10000);

    // Cleanup interval on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isVotingLive, isAdmin]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    } finally {
      router.replace("/login");
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/icon.png')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      resizeMode="contain"
    >
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
        <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutButton, pressed && styles.buttonPressed]}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <Pressable 
        onPress={() => router.push("/vote")} 
        style={({ pressed }) => [
          styles.actionButton, 
          pressed && styles.buttonPressed,
          isVotingLive && styles.actionButtonActive
        ]}
      >
        <Text style={styles.actionButtonIcon}>🗳️</Text>
        <View style={styles.actionButtonContent}>
          <Text style={styles.actionButtonTitle}>Cast Your Vote</Text>
          <Text style={styles.actionButtonSubtitle}>
            {isVotingLive 
              ? `${cycleName} - Voting is open!` 
              : "Waiting for admin to start voting..."}
          </Text>
        </View>
        {isVotingLive && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>LIVE</Text>
          </View>
        )}
      </Pressable>

      {/* Dashboard */}
      <Text style={styles.sectionTitle}>Dashboard</Text>
      <View style={styles.dashboardBox}>
        <Text style={styles.dashboardText}>Welcome to your dashboard.</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16, backgroundColor: '#f8fafc' },
  backgroundImage: {
    opacity: 0.06,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  profileCard: { flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: "rgba(245, 248, 255, 0.95)", padding: 16, borderRadius: 14 },
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
  actionButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#ffffff", 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: "#e0e7ff",
    gap: 12,
  },
  actionButtonActive: {
    borderColor: "#10b981",
    borderWidth: 2,
    backgroundColor: "#f0fdf4",
  },
  actionButtonIcon: { fontSize: 32 },
  actionButtonContent: { flex: 1 },
  actionButtonTitle: { fontSize: 16, fontWeight: "700", color: "#1f2937", marginBottom: 4 },
  actionButtonSubtitle: { fontSize: 14, color: "#6b7280" },
  actionButtonArrow: { fontSize: 24, color: "#3b82f6", fontWeight: "700" },
  badge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});


