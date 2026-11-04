import { Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { PAGE_SIZES, useSettings } from "@/context/SettingsContext";

export default function Ajustes() {
  const { pageSize, setPageSize } = useSettings();

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: true, title: "Ajustes" }} />
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="smallBold">Prendas por página</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Cuántas prendas se cargan cada vez en el catálogo y en los resultados
          de búsqueda. Un número menor carga más rápido; uno mayor necesita
          menos desplazamiento.
        </ThemedText>

        <View style={styles.row}>
          {PAGE_SIZES.map((n) => {
            const activo = n === pageSize;
            return (
              <Pressable
                key={n}
                onPress={() => setPageSize(n)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
              >
                <ThemedView
                  type="backgroundElement"
                  style={[styles.chip, activo && styles.chipActivo]}
                >
                  <ThemedText
                    style={activo ? styles.chipTextoActivo : undefined}
                  >
                    {n}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: Spacing.three, gap: Spacing.three },
  row: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 16,
  },
  chipActivo: { backgroundColor: "#208AEF" },
  chipTextoActivo: { color: "#fff", fontWeight: "700" },
});
