import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <SettingsProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
