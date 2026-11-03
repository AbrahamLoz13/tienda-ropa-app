import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { apiFetch } from "@/services/api";

type Me = { id: number; username: string; email: string; is_staff: boolean };

export default function Perfil() {
  const router = useRouter();
  const theme = useTheme();
  const { signOut } = useAuth();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    apiFetch("/me/")
      .then((res) => (res.ok ? res.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <View style={styles.container}>
          <ThemedText type="subtitle">Perfil</ThemedText>

          {me && (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">{me.username}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {me.email || "Sin correo registrado"}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {me.is_staff ? "Administrador" : "Cliente"}
              </ThemedText>
            </ThemedView>
          )}

          <Pressable
            onPress={() => router.push("/ajustes")}
            accessibilityRole="button"
          >
            <ThemedView type="backgroundElement" style={styles.menuRow}>
              <Ionicons name="settings-outline" size={22} color={theme.text} />
              <ThemedText type="smallBold" style={styles.menuText}>
                Ajustes
              </ThemedText>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.textSecondary}
              />
            </ThemedView>
          </Pressable>

          <PrimaryButton
            title="Cerrar sesión"
            variant="danger"
            onPress={signOut}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: Spacing.three, gap: Spacing.three },
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.one },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
  },
  menuText: { flex: 1 },
});
