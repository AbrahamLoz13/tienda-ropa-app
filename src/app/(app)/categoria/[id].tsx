import {
    Stack,
    useFocusEffect,
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    View,
} from "react-native";

import { PrendaCard } from "@/components/prenda-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useSettings } from "@/context/SettingsContext";
import { getPrendas } from "@/services/prendas";
import type { Prenda } from "@/types/prenda";

export default function PrendasPorCategoria() {
  const { id, nombre } = useLocalSearchParams<{
    id: string;
    nombre?: string;
  }>();
  const router = useRouter();
  const { pageSize } = useSettings();
  const categoriaId = id && id !== "todas" ? id : undefined;

  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const cargar = useCallback(
    async (p: number, reemplazar: boolean) => {
      try {
        setError(false);
        const data = await getPrendas(p, pageSize, { categoria: categoriaId });
        setPrendas((prev) =>
          reemplazar ? data.results : [...prev, ...data.results],
        );
        setPage(p);
        setHasMore(data.next !== null);
      } catch {
        setError(true);
      }
    },
    [categoriaId, pageSize],
  );

  const primeraVez = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (primeraVez.current) {
        primeraVez.current = false;
        cargar(1, true).finally(() => setLoading(false));
      } else {
        cargar(1, true);
      }
    }, [cargar]),
  );

  const reintentar = () => {
    setLoading(true);
    cargar(1, true).finally(() => setLoading(false));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar(1, true);
    setRefreshing(false);
  };

  const cargarMas = async () => {
    setLoadingMore(true);
    await cargar(page + 1, false);
    setLoadingMore(false);
  };

  const onEndReached = () => {
    if (loading || refreshing || loadingMore || !hasMore || error) return;
    cargarMas();
  };

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
    if (error && prendas.length === 0) {
      return (
        <View style={styles.center}>
          <ThemedText>No se pudieron cargar las prendas.</ThemedText>
          <Pressable onPress={reintentar} style={styles.button}>
            <ThemedText style={styles.buttonText}>Reintentar</ThemedText>
          </Pressable>
        </View>
      );
    }
    return (
      <FlatList
        data={prendas}
        keyExtractor={(p) => String(p.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PrendaCard
            prenda={item}
            onPress={() =>
              router.push({
                pathname: "/prenda/[id]",
                params: { id: String(item.id) },
              })
            }
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            {categoriaId
              ? "No hay prendas en esta categoría."
              : "Todavía no hay prendas."}
          </ThemedText>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footer} />
          ) : error ? (
            <Pressable onPress={cargarMas} style={styles.footer}>
              <ThemedText type="link">
                No se pudo cargar más. Reintentar
              </ThemedText>
            </Pressable>
          ) : undefined
        }
      />
    );
  };

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen
        options={{ headerShown: true, title: nombre ?? "Prendas" }}
      />
      {renderBody()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
  },
  list: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  row: { gap: Spacing.three },
  empty: { textAlign: "center", marginTop: Spacing.five },
  footer: { padding: Spacing.three, alignItems: "center" },
  button: {
    backgroundColor: "#208AEF",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
