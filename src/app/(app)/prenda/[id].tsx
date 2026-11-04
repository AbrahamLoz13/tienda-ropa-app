import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { eliminarPrenda, getPrenda, toggleFavorito } from "@/services/prendas";
import type { Prenda } from "@/types/prenda";

export default function DetallePrenda() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { isStaff } = useAuth();
  const { width } = useWindowDimensions();

  const [prenda, setPrenda] = useState<Prenda | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [indice, setIndice] = useState(0);
  const [borrando, setBorrando] = useState(false);

  const cargar = useCallback(() => {
    setError(false);
    return getPrenda(id)
      .then(setPrenda)
      .catch(() => setError(true));
  }, [id]);

  // Recarga cada vez que la pantalla vuelve a verse (por ejemplo, tras editar)
  const primeraVez = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primeraVez.current) {
        primeraVez.current = false;
        setLoading(true);
        cargar().finally(() => setLoading(false));
      } else {
        cargar();
      }
    }, [cargar]),
  );

  const onFavorito = async () => {
    if (!prenda) return;
    const anterior = prenda.es_favorito;
    setPrenda({ ...prenda, es_favorito: !anterior });
    try {
      const real = await toggleFavorito(prenda.id);
      setPrenda((p) => (p ? { ...p, es_favorito: real } : p));
    } catch {
      setPrenda((p) => (p ? { ...p, es_favorito: anterior } : p));
    }
  };

  const editar = () => {
    if (!prenda) return;
    router.push({
      pathname: "/admin/prenda-form",
      params: { id: String(prenda.id) },
    });
  };

  const confirmarEliminar = () => {
    if (!prenda) return;
    Alert.alert(
      "Eliminar prenda",
      `¿Seguro que quieres eliminar "${prenda.nombre}"? No se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setBorrando(true);
              await eliminarPrenda(prenda.id);
              router.back();
            } catch {
              Alert.alert("Error", "No se pudo eliminar. Intenta de nuevo.");
            } finally {
              setBorrando(false);
            }
          },
        },
      ],
    );
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndice(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const fotos = prenda
    ? ([prenda.imagen, ...prenda.imagenes.map((i) => i.imagen)].filter(
        Boolean,
      ) as string[])
    : [];

  const corazon = prenda ? (
    <Pressable
      onPress={onFavorito}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Marcar como favorito"
    >
      <Ionicons
        name={prenda.es_favorito ? "heart" : "heart-outline"}
        size={26}
        color={prenda.es_favorito ? "#d9534f" : theme.text}
      />
    </Pressable>
  ) : null;

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ headerShown: true, title: "" }} />
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error && !prenda) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ headerShown: true, title: "" }} />
        <ThemedText>No se pudo cargar la prenda.</ThemedText>
        <View style={styles.retry}>
          <PrimaryButton
            title="Reintentar"
            onPress={() => {
              setLoading(true);
              cargar().finally(() => setLoading(false));
            }}
          />
        </View>
      </ThemedView>
    );
  }

  if (!prenda) return null;

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: prenda.nombre,
          headerRight: () => corazon,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {fotos.length > 0 ? (
          <View>
            <FlatList
              data={fotos}
              keyExtractor={(uri, i) => `${i}-${uri}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollEnd}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ width, height: width }}
                  contentFit="cover"
                  transition={150}
                />
              )}
            />
            {fotos.length > 1 && (
              <View style={styles.dots}>
                {fotos.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === indice && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.noPhoto, { width, height: width }]}>
            <Ionicons
              name="image-outline"
              size={48}
              color={theme.textSecondary}
            />
            <ThemedText themeColor="textSecondary">Sin fotos</ThemedText>
          </View>
        )}

        <View style={styles.info}>
          <ThemedText type="subtitle">{prenda.nombre}</ThemedText>
          <ThemedText type="smallBold">${prenda.precio}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {prenda.categoria_nombre}
            {prenda.marca ? ` · ${prenda.marca}` : ""}
          </ThemedText>

          <View style={styles.chips}>
            <ThemedView type="backgroundElement" style={styles.chip}>
              <ThemedText type="small">Talla {prenda.talla}</ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.chip}>
              <ThemedText type="small">{prenda.color}</ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.chip}>
              <ThemedText type="small">
                {prenda.stock > 0 ? `${prenda.stock} disponibles` : "Agotado"}
              </ThemedText>
            </ThemedView>
          </View>

          {prenda.descripcion ? (
            <View style={styles.desc}>
              <ThemedText type="smallBold">Descripción</ThemedText>
              <ThemedText themeColor="textSecondary">
                {prenda.descripcion}
              </ThemedText>
            </View>
          ) : null}

          {isStaff && (
            <View style={styles.admin}>
              <ThemedText type="smallBold">Administración</ThemedText>
              <PrimaryButton title="Editar prenda" onPress={editar} />
              <Pressable
                onPress={confirmarEliminar}
                disabled={borrando}
                accessibilityRole="button"
                style={[styles.delete, borrando && styles.deleteDisabled]}
              >
                {borrando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.deleteText}>
                    Eliminar prenda
                  </ThemedText>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
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
  retry: { width: 180 },
  content: { paddingBottom: Spacing.five },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    position: "absolute",
    bottom: Spacing.two,
    left: 0,
    right: 0,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ffffff80" },
  dotActive: { backgroundColor: "#208AEF" },
  noPhoto: { alignItems: "center", justifyContent: "center", gap: Spacing.two },
  info: { padding: Spacing.three, gap: Spacing.two },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 16,
  },
  desc: { gap: Spacing.one, marginTop: Spacing.two },
  admin: { gap: Spacing.two, marginTop: Spacing.four },
  delete: {
    backgroundColor: "#d9534f",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteDisabled: { opacity: 0.6 },
  deleteText: { color: "#fff", fontWeight: "700" },
});
