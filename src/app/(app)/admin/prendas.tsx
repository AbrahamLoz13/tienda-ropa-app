import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { eliminarPrenda, getPrendas } from "@/services/prendas";
import type { Prenda } from "@/types/prenda";

const PAGE_SIZE = 20;

export default function PanelPrendas() {
  const router = useRouter();
  const theme = useTheme();
  const { isStaff } = useAuth();

  const [texto, setTexto] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const [seleccion, setSeleccion] = useState<Set<number>>(new Set());
  const [borrando, setBorrando] = useState(false);
  const modoSeleccion = seleccion.size > 0;

  useEffect(() => {
    const t = setTimeout(() => setBusqueda(texto.trim()), 400);
    return () => clearTimeout(t);
  }, [texto]);

  const cargar = useCallback(
    async (p: number, reemplazar: boolean) => {
      try {
        setError(false);
        const data = await getPrendas(p, PAGE_SIZE, {
          search: busqueda,
          ordering: "-creado",
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
    [busqueda],
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

  const alternar = (id: number) =>
    setSeleccion((prev) => {
      const nueva = new Set(prev);
      if (nueva.has(id)) nueva.delete(id);
      else nueva.add(id);
      return nueva;
    });

  const abrir = (p: Prenda) => {
    if (modoSeleccion) {
      alternar(p.id);
      return;
    }
    router.push({
      pathname: "/admin/prenda-form",
      params: { id: String(p.id) },
    });
  };

  const seleccionarTodas = () =>
    setSeleccion(new Set(prendas.map((p) => p.id)));

  const eliminarSeleccion = () => {
    const ids = Array.from(seleccion);
    Alert.alert(
      "Eliminar prendas",
      `¿Eliminar ${ids.length} ${ids.length === 1 ? "prenda" : "prendas"}? No se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setBorrando(true);
            const resultados = await Promise.allSettled(
              ids.map((id) => eliminarPrenda(id)),
            );
            const fallidas = ids.filter(
              (_, i) => resultados[i].status === "rejected",
            );
            setBorrando(false);
            setSeleccion(new Set(fallidas));
            await cargar(1, true);
            if (fallidas.length > 0) {
              Alert.alert(
                "Aviso",
                `No se pudieron eliminar ${fallidas.length} de ${ids.length}. Siguen seleccionadas para que reintentes.`,
              );
            }
          },
        },
      ],
    );
  };

  if (!isStaff) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ headerShown: true, title: "Administrar" }} />
        <ThemedText>Solo los administradores pueden ver esto.</ThemedText>
      </ThemedView>
    );
  }

  const headerRight = () =>
    modoSeleccion ? (
      <View style={styles.headerActions}>
        <Pressable
          onPress={seleccionarTodas}
          hitSlop={10}
          accessibilityLabel="Seleccionar todas"
        >
          <Ionicons
            name="checkmark-done-outline"
            size={24}
            color={theme.text}
          />
        </Pressable>
        <Pressable
          onPress={eliminarSeleccion}
          disabled={borrando}
          hitSlop={10}
          accessibilityLabel="Eliminar seleccionadas"
        >
          {borrando ? (
            <ActivityIndicator />
          ) : (
            <Ionicons name="trash-outline" size={24} color="#d9534f" />
          )}
        </Pressable>
      </View>
    ) : (
      <Pressable
        onPress={() => router.push("/admin/prenda-form")}
        hitSlop={10}
        accessibilityLabel="Agregar prenda"
      >
        <Ionicons name="add-circle-outline" size={28} color="#208AEF" />
      </Pressable>
    );

  const renderFila = ({ item }: { item: Prenda }) => {
    const marcada = seleccion.has(item.id);
    return (
      <Pressable
        onPress={() => abrir(item)}
        onLongPress={() => alternar(item.id)}
        delayLongPress={300}
        accessibilityRole="button"
      >
        <ThemedView
          type="backgroundElement"
          style={[styles.fila, marcada && styles.filaMarcada]}
        >
          {modoSeleccion && (
            <Ionicons
              name={marcada ? "checkbox" : "square-outline"}
              size={24}
              color={marcada ? "#208AEF" : theme.textSecondary}
            />
          )}
          {item.imagen ? (
            <Image
              source={{ uri: item.imagen }}
              style={styles.foto}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.foto, styles.sinFoto]}>
              <Ionicons
                name="image-outline"
                size={20}
                color={theme.textSecondary}
              />
            </View>
          )}
          <View style={styles.datos}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {item.nombre}
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              numberOfLines={1}
            >
              {item.categoria_nombre} · {item.talla} · ${item.precio}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {item.stock > 0 ? `Stock: ${item.stock}` : "Agotado"}
            </ThemedText>
          </View>
          {!modoSeleccion && (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textSecondary}
            />
          )}
        </ThemedView>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: modoSeleccion
            ? `${seleccion.size} seleccionada${seleccion.size === 1 ? "" : "s"}`
            : "Administrar prendas",
          headerRight,
          headerLeft: modoSeleccion
            ? () => (
                <Pressable
                  onPress={() => setSeleccion(new Set())}
                  hitSlop={10}
                  accessibilityLabel="Cancelar selección"
                >
                  <Ionicons name="close" size={26} color={theme.text} />
                </Pressable>
              )
            : undefined,
        }}
      />

      <View style={styles.barra}>
        <ThemedView type="backgroundElement" style={styles.search}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Buscar por nombre"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text }]}
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
      </View>

      {!modoSeleccion && prendas.length > 0 && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.tip}>
          Toca para editar. Mantén presionada una prenda para seleccionar
          varias.
        </ThemedText>
      )}

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
          renderItem={renderFila}
          extraData={seleccion}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <ThemedText themeColor="textSecondary" style={styles.empty}>
              {busqueda
                ? "No se encontraron prendas."
                : "Todavía no hay prendas."}
            </ThemedText>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={styles.footer} />
            ) : undefined
          }
        />
      )}
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
  headerActions: {
    flexDirection: "row",
    gap: Spacing.three,
    alignItems: "center",
  },
  barra: { padding: Spacing.three, paddingBottom: Spacing.one },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    height: 44,
    borderRadius: 12,
  },
  input: { flex: 1, height: 44 },
  tip: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
  list: { padding: Spacing.three, paddingTop: 0, gap: Spacing.two },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  filaMarcada: { borderColor: "#208AEF" },
  foto: { width: 56, height: 56, borderRadius: 8 },
  sinFoto: { alignItems: "center", justifyContent: "center" },
  datos: { flex: 1, gap: 2 },
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
