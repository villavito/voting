import { Redirect } from "expo-router";

export default function Index() {
  // For now, always show the login screen first.
  return <Redirect href="/login" />;
}


