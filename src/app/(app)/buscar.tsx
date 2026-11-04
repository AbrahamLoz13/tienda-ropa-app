import { Ionicons } from "@expo/vector-icons";
import {
    Stack,
    useFocusEffect,
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import {
    FILTROS_VACIOS,
    FiltrosModal,
    type FiltrosState,
} from "@/components/filtros-modal";
import { PrendaCard } from "@/components/prenda-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/hooks/use-theme";
import { getPrendas } from "@/services/prendas";
import type { Prenda } from "@/types/prenda";

export default function Buscar() {
  const router = useRouter();
  const theme = useTheme();
  const { pageSize } = useSettings();
  const { q } = useLocalSearchParams<{ q?: string }>();

  const [texto, setTexto] = useState(q ?? "");
  const [busqueda, setBusqueda] = useState(q ?? "");
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_VACIOS);
  const [modal, setModal] = useState(false);

  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  // espera 400 ms después de dejar de escribir antes de buscar
  useEffect(() => {
    const t = setTimeout(() => setBusqueda(texto.trim()), 400);
    return () => clearTimeout(t);
  }, [texto]);

  const cargar = useCallback(
    async (p: number, reemplazar: boolean) => {
      try {
        setError(false);
        const data = await getPrendas(p, pageSize, {
          search: busqueda,
          talla: filtros.tallas.join(","),
          color: filtros.color.trim(),
          precio_min: filtros.precioMin,
          precio_max: filtros.precioMax,
          ordering: filtros.orden,
        });
        setPrendas((prev) =>
          reemplazar ? data.results : [...prev, ...data.results],
        );
        setPage(p);
        setHasMore(data.next !== null);
      } catch {
        setError(true);
      }
    },
    [busqueda, filtros, pageSize],
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

  const activos =
    filtros.tallas.length +
    (filtros.color ? 1 : 0) +
    (filtros.precioMin ? 1 : 0) +
    (filtros.precioMax ? 1 : 0) +
    (filtros.orden !== FILTROS_VACIOS.orden ? 1 : 0);

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: true, title: "Buscar" }} />

      <View style={styles.bar}>
        <ThemedView type="backgroundElement" style={styles.search}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Buscar prendas, marcas, colores"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text }]}
            returnKeyType="search"
            autoFocus={!q}
          />
          {texto.length > 0 && (
            <Pressable onPress={() => setTexto("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={18}
                color={theme.textSecondary}
              />
            </Pressable>
          )}
        </ThemedView>

        <Pressable onPress={() => setModal(true)} accessibilityLabel="Filtros">
          <ThemedView type="backgroundElement" style={styles.filterBtn}>
            <Ionicons name="options-outline" size={22} color={theme.text} />
            {activos > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{activos}</ThemedText>
              </View>
            )}
          </ThemedView>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : error && prendas.length === 0 ? (
        <View style={styles.center}>
          <ThemedText>No se pudieron cargar las prendas.</ThemedText>
          <Pressable
            onPress={() => {
              setLoading(true);
              cargar(1, true).finally(() => setLoading(false));
            }}
            style={styles.button}
          >
            <ThemedText style={styles.buttonText}>Reintentar</ThemedText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={prendas}
          keyExtractor={(p) => String(p.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
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
              No se encontraron prendas con esos criterios.
            </ThemedText>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={styles.footer} />
            ) : undefined
          }
        />
      )}

      <FiltrosModal
        visible={modal}
        inicial={filtros}
        onClose={() => setModal(false)}
        onApply={(f) => {
          setFiltros(f);
          setModal(false);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: {
    flexDirection: "row",
    gap: Spacing.two,
    padding: Spacing.three,
    alignItems: "center",
  },
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    height: 44,
    borderRadius: 12,
  },
  input: { flex: 1, height: 44 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#208AEF",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
  },
  list: { padding: Spacing.three, paddingTop: 0, gap: Spacing.three },
  row: { gap: Spacing.three },
  empty: { textAlign: "center", marginTop: Spacing.five },
  footer: { padding: Spacing.three },
  button: {
    backgroundColor: "#208AEF",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
