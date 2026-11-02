import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function Favoritos() {
  return (
    <ThemedView style={styles.center}>
      <ThemedText type="subtitle">Favoritos</ThemedText>
      <ThemedText themeColor="textSecondary">Próximamente</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
