import { Link, router } from "expo-router";
import React, { useState, useEffect } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { loginUser, getUserData } from "../services/authService";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userData = await getUserData(user.uid);
          if (userData) {
            if (userData.isAdmin) {
              router.replace("/admin");
            } else if (userData.approved) {
              router.replace("/vote");
            } else {
              // User is not approved yet
              Alert.alert("Pending Approval", "Your account is awaiting admin approval.");
              await signOut(auth);
            }
          }
        } catch (error) {
          console.error("Error checking user data:", error);
          Alert.alert("Error", "Failed to check user status. Please try again.");
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const validateEmail = (email: string) => {
    // Simple email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginUser(email, password);
      // The onAuthStateChanged will handle the redirection
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Failed to login. Please try again.";
      
      if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled. Please contact support.";
      }
      
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
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
          style={[styles.input, styles.passwordInput]}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
          <Text style={styles.eyeText}>{showPassword ? "🫣" : "🤔"}</Text>
        </Pressable>
      </View>

      <Pressable 
        onPress={handleLogin} 
        style={({ pressed }) => [
          styles.button, 
          (isSubmitting || !email || !password) && styles.buttonDisabled,
          pressed && styles.buttonPressed
        ]} 
        disabled={isSubmitting || !email || !password}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>

      <View style={styles.linksRow}>
        <Link href="/register" style={styles.link}>Register</Link>
        <Link href="/forgot-password" style={styles.link}>Forgot Password</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1f2937',
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  eyeText: {
    fontSize: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  link: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
