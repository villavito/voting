import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { users } from "./login";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const generateVerificationCode = () => {
    // Generate a 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleResetRequest = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    const user = users[email.toLowerCase()];
    if (!user) {
      Alert.alert("Error", "No account found with this email address");
      return;
    }

    setIsSubmitting(true);
    
    // Generate and store verification code
    const code = generateVerificationCode();
    setGeneratedCode(code);
    
    // In a real app, you would send this code to the user's email
    console.log(`Verification code for ${email}: ${code}`);
    
    // Show the reset form
    setTimeout(() => {
      setShowResetForm(true);
      setIsSubmitting(false);
      Alert.alert("Verification Sent", `A verification code has been sent to ${email}`);
    }, 1000);
  };

  const handleResetPassword = () => {
    if (!verificationCode || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (verificationCode !== generatedCode) {
      Alert.alert("Error", "Invalid verification code");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    // Update the password in the in-memory store
    const user = users[email.toLowerCase()];
    if (user) {
      user.password = newPassword;
      Alert.alert("Success", "Your password has been reset successfully!");
      router.replace("/(auth)/login");
    } else {
      Alert.alert("Error", "User not found");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password</Text>
        
        {!showResetForm ? (
          <>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a verification code to reset your password.
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
              />
            </View>

            <Pressable
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleResetRequest}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Sending...' : 'Send Verification Code'}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Enter the verification code sent to {email} and your new password.
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter verification code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.buttonGroup}>
              <Pressable
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setShowResetForm(false)}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>
              
              <Pressable
                style={[styles.button, styles.primaryButton]}
                onPress={handleResetPassword}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Text>
              </Pressable>
            </View>
          </>
        )}

        <Pressable
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.linkText}>Back to Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#4b5563',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 16,
  },
  link: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
});
