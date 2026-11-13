import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CatalogoProvider } from "@/context/CatalogoContext";

export default function AppLayout() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!token) return <Redirect href="/login" />;

  return (
    <CartProvider>
      <CatalogoProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </CatalogoProvider>
    </CartProvider>
  );
}
