import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

// Simple in-memory auth store for demo purposes
type UserRecord = {
  password: string;
  displayName?: string;
  course?: string;
  studentId?: string;
  approved: boolean;
};

const defaultAdminEmail = "admin@gmail.com";
let users: Record<string, UserRecord> = {
  [defaultAdminEmail]: {
    password: "admin123",
    displayName: "Admin",
    approved: true,
  },
  ["admin"]: { password: "admin123", displayName: "Admin", approved: true },
};

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onLogin = async () => {
    if (!username || !password) {
      Alert.alert("Missing fields", "Please enter both username and password.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const key = username.trim().toLowerCase();
      const stored = users[key];
      if (stored && stored.password === password) {
        if (key === "admin" || key === defaultAdminEmail) {
          router.replace({ pathname: "/admin", params: { username } });
        } else {
          if (!stored.approved) {
            Alert.alert("Pending approval", "Your account is awaiting admin confirmation.");
          } else {
            router.replace({ pathname: "/home", params: { username: stored.displayName || key } });
          }
        }
      } else {
        Alert.alert("Login failed", "Invalid username or password.");
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <TextInput
        placeholder="Gmail"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
          <Text style={styles.eyeText}>{showPassword ? "🫣" : "🤔"}</Text>
        </Pressable>
      </View>

      <Pressable onPress={onLogin} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? "Signing in..." : "Login"}</Text>
      </Pressable>

      <View style={styles.linksRow}>
        <Link href="/register" style={styles.link}>Register</Link>
        <Link href="/forgot-password" style={styles.link}>Forgot Password</Link>
      </View>
    </View>
  );
}

export function registerUser(email: string, password: string, displayName?: string, course?: string, studentId?: string) {
  const key = email.trim().toLowerCase();
  users[key] = { password, displayName, course, studentId, approved: false };
}

export function resetPassword(usernameOrEmail: string) {
  const key = usernameOrEmail.trim().toLowerCase();
  if (users[key]) {
    users[key].password = "password123";
    return true;
  }
  return false;
}

export function getPendingUsers(): Array<{ email: string; displayName?: string; course?: string; studentId?: string }> {
  return Object.entries(users)
    .filter(([email, rec]) => email !== "admin" && email !== defaultAdminEmail && rec.approved === false)
    .map(([email, rec]) => ({ email, displayName: rec.displayName, course: rec.course, studentId: rec.studentId }));
}

export function approveUser(email: string): boolean {
  const key = email.trim().toLowerCase();
  if (users[key]) {
    users[key].approved = true;
    return true;
  }
  return false;
}

// Candidates store (in-memory)
export type CandidateRecord = {
  id: string;
  name: string;
  position: string;
  party?: string;
  course?: string;
  slogan?: string;
  createdAt: number;
};

let candidates: Record<string, CandidateRecord> = {};

export function addCandidate(name: string, position: string, opts?: { party?: string; course?: string; slogan?: string }) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  candidates[id] = {
    id,
    name: name.trim(),
    position: position.trim(),
    party: opts?.party?.trim() || undefined,
    course: opts?.course?.trim() || undefined,
    slogan: opts?.slogan?.trim() || undefined,
    createdAt: Date.now(),
  };
  return candidates[id];
}

export function updateCandidate(id: string, patch: Partial<Omit<CandidateRecord, "id" | "createdAt">>) {
  const rec = candidates[id];
  if (!rec) return null;
  candidates[id] = { ...rec, ...patch };
  return candidates[id];
}

export function removeCandidate(id: string) {
  if (!candidates[id]) return false;
  delete candidates[id];
  return true;
}

export function listCandidates(): CandidateRecord[] {
  return Object.values(candidates).sort((a, b) => b.createdAt - a.createdAt);
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
  passwordContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ccc", borderRadius: 8 },
  passwordInput: { flex: 1, padding: 12, borderWidth: 0 },
  eyeButton: { padding: 12 },
  eyeText: { fontSize: 16 },
  button: { backgroundColor: "#1e90ff", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: "center" },
  buttonPressed: { opacity: 0.75 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  linksRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  link: { color: "#1e90ff", fontWeight: "600" },
  helpBox: { marginTop: 18, padding: 12, backgroundColor: "#f5f8ff", borderRadius: 8 },
  helpTitle: { fontWeight: "700", marginBottom: 4 },
  helpText: { color: "#333" },
});


