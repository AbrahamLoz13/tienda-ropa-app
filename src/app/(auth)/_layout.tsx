import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function AuthLayout() {
  const { token, loading } = useAuth();

  if (!loading && token) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
