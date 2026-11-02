import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrendaCard } from "@/components/prenda-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { getFavoritos } from "@/services/prendas";
import type { Prenda } from "@/types/prenda";

export default function Favoritos() {
  const router = useRouter();
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      setPrendas(await getFavoritos());
    } catch {
      setError(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar().finally(() => setLoading(false));
    }, [cargar]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  };

  const reintentar = () => {
    setLoading(true);
    cargar().finally(() => setLoading(false));
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
          <ThemedText>No se pudieron cargar tus favoritos.</ThemedText>
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
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            Aún no tienes favoritos. Toca el corazón en una prenda para
            guardarla aquí.
          </ThemedText>
        }
      />
    );
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Favoritos</ThemedText>
        </View>
        {renderBody()}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
  },
  list: { padding: Spacing.three, gap: Spacing.three },
  row: { gap: Spacing.three },
  empty: {
    textAlign: "center",
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  button: {
    backgroundColor: "#208AEF",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
