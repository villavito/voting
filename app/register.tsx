import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { registerUser } from "./services/authService";
import { auth } from "../firebase";

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [studentId, setStudentId] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onRegister = async () => {
    if (!displayName || !username || !password || !confirm) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    const email = username.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    if (!course) {
      Alert.alert("Course Required", "Please select your course.");
      return;
    }

    if (studentId.length !== 10) {
      Alert.alert("Invalid Student ID", "Student ID must be 10 digits long.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Register the user with Firebase Auth
      const userCredential = await registerUser(email, password, {
        displayName,
        course,
        studentId,
        approved: false, // New users need admin approval
        isAdmin: false // Only set to true for admin users
      });

      Alert.alert(
        "Registration Successful",
        "Your account has been created and is pending admin approval. You will be notified once approved."
      );
      
      // Auto navigate to login page after 1 second
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1000);
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Failed to register. Please try again.";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please use a different email or login.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      }
      
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
      <Pressable 
        onPress={onRegister} 
        style={({ pressed }) => [
          styles.button, 
          pressed && styles.buttonPressed,
          isSubmitting && styles.buttonDisabled
        ]} 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
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
  placeholderText: { color: "#999" },
  dropdownArrow: { fontSize: 12, color: "#666" },
  dropdownList: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, backgroundColor: "#fff", marginTop: 2 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  dropdownItemText: { fontSize: 16 },
  button: { 
    backgroundColor: "#3b82f6", 
    padding: 15,
    borderRadius: 8, 
    alignItems: "center",
    marginTop: 10,
  },
  buttonPressed: { 
    opacity: 0.8 
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 16 
  },
});
