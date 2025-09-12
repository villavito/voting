import React, { useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { resetPassword } from "./(auth)/login";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onReset = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid email", "Enter a valid email address (e.g. user@gmail.com).");
      return;
    }
    setIsSubmitting(true);
    setTimeout(async () => {
      const key = email.trim().toLowerCase();
      const ok = resetPassword(key);
      if (!ok) {
        Alert.alert("User not found", "No account with that email.");
        setIsSubmitting(false);
        return;
      }

      const subject = encodeURIComponent("Password Reset Instructions");
      const body = encodeURIComponent(
        `Hello,\n\nWe received a request to reset your password for ${key}.\n\nTemporary password: password123\n\nPlease open the app and login with this temporary password, then change it immediately.\n\nIf you didn't request this, you can ignore this email.`
      );
      const url = `mailto:${email}?subject=${subject}&body=${body}`;
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Email not supported", "Couldn't open the email client on this device.");
        }
      } catch (e) {
        Alert.alert("Error", "Failed to open email client.");
      } finally {
        setIsSubmitting(false);
      }
    }, 300);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
      <Pressable onPress={onReset} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? "Processing..." : "Reset Password"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
  button: { backgroundColor: "#1e90ff", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonPressed: { opacity: 0.75 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});


