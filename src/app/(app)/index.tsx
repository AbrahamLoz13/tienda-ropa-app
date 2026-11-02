import { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/services/api";

export default function Home() {
  const { signOut } = useAuth();
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    apiFetch("/me/")
      .then((res) => res.json())
      .then((data) => setNombre(data.username ?? ""))
      .catch(() => setNombre(""));
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Hola, {nombre}</ThemedText>
      <Pressable onPress={signOut} style={styles.button}>
        <ThemedText style={styles.buttonText}>Cerrar sesión</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
  },
  button: {
    backgroundColor: "#d9534f",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
