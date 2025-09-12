import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { registerUser } from "./(auth)/login";

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [studentId, setStudentId] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onRegister = () => {
    if (!displayName || !username || !password || !confirm) {
      Alert.alert("Missing fields", "Fill all fields.");
      return;
    }
    const email = username.trim().toLowerCase();
    if (!/^[^\s@]+@gmail\.com$/.test(email)) {
      Alert.alert("Invalid Gmail", "Username must be a valid Gmail address (e.g. user@gmail.com).");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }
    if (!course) {
      Alert.alert("Course required", "Please select a course.");
      return;
    }
    if (studentId.length !== 10) {
      Alert.alert("Invalid Student ID", "Student ID must be a 10-digit number.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      registerUser(email, password, displayName, course, studentId);
      Alert.alert("Success", "Account created. You can now login.");
      router.replace("/login");
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput placeholder="Username" autoCapitalize="words" value={displayName} onChangeText={setDisplayName} style={styles.input} />
      <TextInput placeholder="email" autoCapitalize="none" keyboardType="email-address" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TextInput placeholder="Confirm Password" secureTextEntry value={confirm} onChangeText={setConfirm} style={styles.input} />

      <Text style={styles.label}>Course</Text>
      <Pressable onPress={() => setShowCourseDropdown(!showCourseDropdown)} style={styles.dropdownButton}>
        <Text style={[styles.dropdownText, !course && styles.placeholderText]}>
          {course || "Select Course"}
        </Text>
        <Text style={styles.dropdownArrow}>{showCourseDropdown ? "▲" : "▼"}</Text>
      </Pressable>
      
      {showCourseDropdown && (
        <View style={styles.dropdownList}>
          <Pressable onPress={() => { setCourse("BSIT"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
            <Text style={styles.dropdownItemText}>BSIT</Text>
          </Pressable>
          <Pressable onPress={() => { setCourse("CSS"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
            <Text style={styles.dropdownItemText}>CSS</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.label}>Student ID (10 digits)</Text>
      <TextInput
        placeholder="e.g. 2024123456"
        keyboardType="number-pad"
        value={studentId}
        onChangeText={(t) => {
          const digitsOnly = t.replace(/[^0-9]/g, "").slice(0, 10);
          setStudentId(digitsOnly);
        }}
        style={styles.input}
        maxLength={10}
      />
      <Pressable onPress={onRegister} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? "Creating..." : "Register"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  label: { fontSize: 12, color: "#666", fontWeight: "600", marginTop: 6 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
  dropdownButton: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
  dropdownText: { fontSize: 16 },
  placeholderText: { color: "#999" },
  dropdownArrow: { fontSize: 12, color: "#666" },
  dropdownList: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, backgroundColor: "#fff", marginTop: 2 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  dropdownItemText: { fontSize: 16 },
  button: { backgroundColor: "#1e90ff", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonPressed: { opacity: 0.75 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});


