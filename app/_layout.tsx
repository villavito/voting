import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false, title: "Login" }} />
      <Stack.Screen name="register" options={{ headerShown: false, title: "Register" }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false, title: "Forgot Password" }} />
      <Stack.Screen name="home" options={{ headerShown: false, title: "Home" }} />
      <Stack.Screen name="vote" options={{ headerShown: false, title: "Cast Your Vote" }} />
      <Stack.Screen name="admin" options={{ headerShown: false, title: "Admin" }} />
      <Stack.Screen name="candidates-home" options={{ headerShown: false, title: "Candidates" }} />
      <Stack.Screen name="manage-candidates" options={{ headerShown: false, title: "Manage Candidates" }} />
      <Stack.Screen name="approve-users" options={{ headerShown: false, title: "Approve Users" }} />
      <Stack.Screen name="results" options={{ headerShown: false, title: "Results" }} />
      <Stack.Screen name="manage-voting-cycles" options={{ headerShown: false, title: "Manage Voting Cycles" }} />
    </Stack>
  );
}
