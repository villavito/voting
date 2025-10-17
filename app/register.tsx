import { Link, router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { registerUser } from "./services/authService";
import PasswordVisibilityToggle from "./components/PasswordVisibilityToggle";
import { logError, parseAuthError } from "./services/errorHandler";

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [studentId, setStudentId] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      logError(error, 'Registration', { email, displayName, course, studentId });
      const appError = parseAuthError(error);
      Alert.alert("Registration Failed", appError.userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable 
          onPress={() => router.back()} 
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Create Account</Text>
        <TextInput placeholder="Username" autoCapitalize="words" value={displayName} onChangeText={setDisplayName} style={styles.input} />
        <TextInput placeholder="email" autoCapitalize="none" keyboardType="email-address" value={username} onChangeText={setUsername} style={styles.input} />
      
        <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={[styles.input, styles.passwordInput]}
        />
        <View style={styles.eyeButton}>
          <PasswordVisibilityToggle
            isVisible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            color="#3b82f6"
          />
        </View>
      </View>
      
        <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Confirm Password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!showConfirmPassword}
          value={confirm}
          onChangeText={setConfirm}
          style={[styles.input, styles.passwordInput]}
        />
        <View style={styles.eyeButton}>
          <PasswordVisibilityToggle
            isVisible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            color="#3b82f6"
          />
        </View>
      </View>

        <Text style={styles.label}>Course</Text>
        <View style={styles.dropdownWrapper}>
        <Pressable onPress={() => setShowCourseDropdown(!showCourseDropdown)} style={styles.dropdownButton}>
          <Text style={[styles.dropdownText, !course && styles.placeholderText]}>
            {course || "Select Course"}
          </Text>
          <Text style={styles.dropdownArrow}>{showCourseDropdown ? "▲" : "▼"}</Text>
        </Pressable>
        
        {showCourseDropdown && (
          <ScrollView 
            style={styles.dropdownList} 
            contentContainerStyle={styles.dropdownScrollContent}
            nestedScrollEnabled={true} 
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled">
              <Pressable onPress={() => { setCourse("Agriculture"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>Agriculture</Text>
              </Pressable>
              <Pressable onPress={() => { setCourse("CRIM"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>CRIM</Text>
              </Pressable>
              <Pressable onPress={() => { setCourse("BHHM"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>BHHM</Text>
              </Pressable>
              <Pressable onPress={() => { setCourse("Pharmacy"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>Pharmacy</Text>
              </Pressable>
              <Pressable onPress={() => { setCourse("Midwifery"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>Midwifery</Text>
              </Pressable>
              <Pressable onPress={() => { setCourse("BTVTED"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>BTVTED</Text>
              </Pressable>
              <Pressable onPress={() => { setCourse("Social Work"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>Social Work</Text>
              </Pressable>
              <Pressable onPress={() => { setCourse("BSBA"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>BSBA</Text>
              </Pressable>
              <Pressable onPress={() => { setCourse("CSS"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>CSS</Text>
              </Pressable>
              <Pressable onPress={() => { setCourse("Engineering"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>Engineering</Text>
              </Pressable>
              <Pressable onPress={() => { setCourse("Nursing"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>Nursing</Text>
              </Pressable>
              <Pressable onPress={() => { setCourse("Education"); setShowCourseDropdown(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>Education</Text>
              </Pressable>
              <Pressable onPress={() => { setCourse("IT"); setShowCourseDropdown(false); }} style={[styles.dropdownItem, styles.lastDropdownItem]}>
                <Text style={styles.dropdownItemText}>IT</Text>
              </Pressable>
            </ScrollView>
        )}
      </View>

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { 
    flexGrow: 1, 
    padding: 24, 
    justifyContent: "center", 
    gap: 12 
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  label: { fontSize: 12, color: "#666", fontWeight: "600", marginTop: 6 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
  passwordContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  passwordInput: {
    paddingRight: 50,
    marginBottom: 0,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 1,
    marginBottom: 12,
  },
  dropdownButton: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
  dropdownText: { fontSize: 16 },
  placeholderText: { color: "#999" },
  dropdownArrow: { fontSize: 12, color: "#666" },
  dropdownListContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownList: { 
    maxHeight: 200,
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 8, 
    backgroundColor: "#fff",
    marginTop: 4,
    marginBottom: 8,
  },
  dropdownScrollContent: {
    flexGrow: 1,
  },
  dropdownItem: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: "#f0f0f0" 
  },
  lastDropdownItem: {
    padding: 12,
    borderBottomWidth: 0,
  },
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
