import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoriaCard } from "@/components/categoria-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getCategorias } from "@/services/categorias";
import type { Categoria } from "@/types/categoria";

export default function Catalogo() {
  const router = useRouter();
  const theme = useTheme();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      setCategorias(await getCategorias());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    cargar().finally(() => setLoading(false));
  }, [cargar]);

  const reintentar = () => {
    setLoading(true);
    cargar().finally(() => setLoading(false));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  };

  const abrir = (id: string, nombre: string) =>
    router.push({ pathname: "/categoria/[id]", params: { id, nombre } });

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
    if (error && categorias.length === 0) {
      return (
        <View style={styles.center}>
          <ThemedText>No se pudieron cargar las categorías.</ThemedText>
          <Pressable onPress={reintentar} style={styles.button}>
            <ThemedText style={styles.buttonText}>Reintentar</ThemedText>
          </Pressable>
        </View>
      );
    }
    return (
      <FlatList
        data={categorias}
        keyExtractor={(c) => String(c.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CategoriaCard
            categoria={item}
            onPress={() => abrir(String(item.id), item.nombre)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Pressable
            onPress={() => abrir("todas", "Todas las prendas")}
            accessibilityRole="button"
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView type="backgroundElement" style={styles.allButton}>
              <Ionicons name="grid-outline" size={22} color={theme.text} />
              <ThemedText type="smallBold" style={styles.allText}>
                Ver todas las prendas
              </ThemedText>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.textSecondary}
              />
            </ThemedView>
          </Pressable>
        }
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            Todavía no hay categorías.
          </ThemedText>
        }
      />
    );
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Catálogo</ThemedText>
        </View>
        <Pressable
          onPress={() => router.push("/buscar")}
          accessibilityRole="search"
          style={styles.searchWrap}
        >
          <ThemedView type="backgroundElement" style={styles.fakeSearch}>
            <Ionicons name="search" size={18} color={theme.textSecondary} />
            <ThemedText themeColor="textSecondary">
              Buscar y filtrar prendas
            </ThemedText>
          </ThemedView>
        </Pressable>
        {renderBody()}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  searchWrap: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
  fakeSearch: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    height: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
  },
  list: { padding: Spacing.three, gap: Spacing.three },
  row: { gap: Spacing.three },
  pressed: { opacity: 0.7 },
  allButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.one,
  },
  allText: { flex: 1 },
  empty: { textAlign: "center", marginTop: Spacing.five },
  button: {
    backgroundColor: "#208AEF",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
