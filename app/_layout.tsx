import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Forgot Password" }} />
      <Stack.Screen name="home" options={{ title: "Home" }} />
      <Stack.Screen name="vote" options={{ title: "Cast Your Vote" }} />
      <Stack.Screen name="admin" options={{ title: "Admin" }} />
      <Stack.Screen name="candidates-home" options={{ title: "Candidates" }} />
      <Stack.Screen name="manage-candidates" options={{ title: "Manage Candidates" }} />
      <Stack.Screen name="approve-users" options={{ title: "Approve Users" }} />
    </Stack>
  );
}
