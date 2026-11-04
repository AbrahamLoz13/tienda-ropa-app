import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { getCategorias } from "@/services/categorias";
import { getPrendas } from "@/services/prendas";
import type { Categoria } from "@/types/categoria";
import type { Prenda } from "@/types/prenda";

export default function Inicio() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();

  const [novedades, setNovedades] = useState<Prenda[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      const [prendas, cats] = await Promise.all([
        getPrendas(1, 8, { ordering: "-creado" }),
        getCategorias(),
      ]);
      setNovedades(prendas.results);
      setCategorias(cats);
    } catch {
      setError(true);
    }
  }, []);

  const primeraVez = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primeraVez.current) {
        primeraVez.current = false;
        cargar().finally(() => setLoading(false));
      } else {
        cargar();
      }
    }, [cargar]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  };

  const abrirPrenda = (id: number) =>
    router.push({ pathname: "/prenda/[id]", params: { id: String(id) } });

  const abrirCategoria = (id: string, nombre: string) =>
    router.push({ pathname: "/categoria/[id]", params: { id, nombre } });

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <ThemedText type="small" themeColor="textSecondary">
              Bienvenido{user ? "," : ""}
            </ThemedText>
            <ThemedText type="subtitle">
              {user ? user.username : "Tienda de ropa"}
            </ThemedText>
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

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" />
            </View>
          ) : error && novedades.length === 0 ? (
            <View style={styles.center}>
              <ThemedText>No se pudo cargar el inicio.</ThemedText>
              <Pressable
                onPress={() => {
                  setLoading(true);
                  cargar().finally(() => setLoading(false));
                }}
                style={styles.button}
              >
                <ThemedText style={styles.buttonText}>Reintentar</ThemedText>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.seccion}>
                <View style={styles.seccionHeader}>
                  <ThemedText type="subtitle" style={styles.titulo}>
                    Novedades
                  </ThemedText>
                  <Pressable
                    onPress={() => abrirCategoria("todas", "Todas las prendas")}
                    hitSlop={8}
                  >
                    <ThemedText type="link">Ver todas</ThemedText>
                  </Pressable>
                </View>

                {novedades.length === 0 ? (
                  <ThemedText themeColor="textSecondary" style={styles.vacio}>
                    Todavía no hay prendas.
                  </ThemedText>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carrusel}
                  >
                    {novedades.map((p) => (
                      <Pressable
                        key={p.id}
                        onPress={() => abrirPrenda(p.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Ver ${p.nombre}`}
                        style={({ pressed }) => pressed && styles.pressed}
                      >
                        <ThemedView
                          type="backgroundElement"
                          style={styles.tarjeta}
                        >
                          {p.imagen ? (
                            <Image
                              source={{ uri: p.imagen }}
                              style={styles.tarjetaFoto}
                              contentFit="cover"
                              transition={150}
                            />
                          ) : (
                            <View style={[styles.tarjetaFoto, styles.sinFoto]}>
                              <Ionicons
                                name="image-outline"
                                size={28}
                                color={theme.textSecondary}
                              />
                            </View>
                          )}
                          {p.es_favorito && (
                            <View style={styles.corazon}>
                              <Ionicons
                                name="heart"
                                size={14}
                                color="#d9534f"
                              />
                            </View>
                          )}
                          <View style={styles.tarjetaInfo}>
                            <ThemedText type="smallBold" numberOfLines={1}>
                              {p.nombre}
                            </ThemedText>
                            <ThemedText type="smallBold">
                              ${p.precio}
                            </ThemedText>
                          </View>
                        </ThemedView>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.seccion}>
                <ThemedText type="subtitle" style={styles.titulo}>
                  Categorías
                </ThemedText>
                {categorias.length === 0 ? (
                  <ThemedText themeColor="textSecondary" style={styles.vacio}>
                    Todavía no hay categorías.
                  </ThemedText>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carrusel}
                  >
                    {categorias.map((c) => (
                      <Pressable
                        key={c.id}
                        onPress={() => abrirCategoria(String(c.id), c.nombre)}
                        accessibilityRole="button"
                        accessibilityLabel={`Ver ${c.nombre}`}
                        style={({ pressed }) => [
                          styles.cat,
                          pressed && styles.pressed,
                        ]}
                      >
                        {c.imagen ? (
                          <Image
                            source={{ uri: c.imagen }}
                            style={styles.catFoto}
                            contentFit="cover"
                            transition={150}
                          />
                        ) : (
                          <ThemedView
                            type="backgroundElement"
                            style={[styles.catFoto, styles.sinFoto]}
                          >
                            <Ionicons
                              name="shirt-outline"
                              size={28}
                              color={theme.textSecondary}
                            />
                          </ThemedView>
                        )}
                        <ThemedText
                          type="small"
                          numberOfLines={1}
                          style={styles.catNombre}
                        >
                          {c.nombre}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: Spacing.five },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: 2,
  },
  searchWrap: { padding: Spacing.three },
  fakeSearch: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    height: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
  center: {
    paddingVertical: Spacing.five,
    alignItems: "center",
    gap: Spacing.three,
  },
  seccion: { gap: Spacing.two, marginBottom: Spacing.three },
  seccionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: Spacing.three,
  },
  titulo: { paddingHorizontal: Spacing.three },
  vacio: { paddingHorizontal: Spacing.three },
  carrusel: { paddingHorizontal: Spacing.three, gap: Spacing.three },
  pressed: { opacity: 0.7 },
  tarjeta: { width: 150, borderRadius: 12, overflow: "hidden" },
  tarjetaFoto: { width: 150, height: 150 },
  sinFoto: { alignItems: "center", justifyContent: "center" },
  corazon: {
    position: "absolute",
    top: Spacing.two,
    right: Spacing.two,
    backgroundColor: "#ffffffdd",
    borderRadius: 12,
    padding: 4,
  },
  tarjetaInfo: { padding: Spacing.two, gap: 2 },
  cat: { width: 84, alignItems: "center", gap: Spacing.one },
  catFoto: { width: 72, height: 72, borderRadius: 36 },
  catNombre: { textAlign: "center" },
  button: {
    backgroundColor: "#208AEF",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
