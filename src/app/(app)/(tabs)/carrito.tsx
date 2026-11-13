import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/hooks/use-theme";
import {
    cambiarCantidad,
    comprar,
    getCarrito,
    quitarDelCarrito,
    vaciarCarrito,
} from "@/services/carrito";
import type { Carrito } from "@/types/carrito";

export default function CarritoScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { setPiezas } = useCart();

  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [comprando, setComprando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      const c = await getCarrito();
      setCarrito(c);
      setPiezas(c.cantidad_total);
    } catch {
      setError(true);
    }
  }, [setPiezas]);

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

  const cambiar = async (id: number, cantidad: number) => {
    try {
      setOcupado(id);
      await cambiarCantidad(id, cantidad);
    } catch (e) {
      Alert.alert(
        "Aviso",
        e instanceof Error ? e.message : "Intenta de nuevo.",
      );
    } finally {
      await cargar();
      setOcupado(null);
    }
  };

  const quitar = async (id: number) => {
    try {
      setOcupado(id);
      await quitarDelCarrito(id);
    } catch {
      Alert.alert("Error", "No se pudo quitar la prenda.");
    } finally {
      await cargar();
      setOcupado(null);
    }
  };

  const confirmarVaciar = () => {
    Alert.alert("Vaciar carrito", "¿Quitar todas las prendas del carrito?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Vaciar",
        style: "destructive",
        onPress: async () => {
          try {
            await vaciarCarrito();
          } catch {
            Alert.alert("Error", "No se pudo vaciar el carrito.");
          }
          await cargar();
        },
      },
    ]);
  };

  const confirmarCompra = () => {
    if (!carrito) return;
    Alert.alert(
      "Confirmar compra",
      `${carrito.cantidad_total} ${carrito.cantidad_total === 1 ? "pieza" : "piezas"} por $${carrito.total}.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Comprar",
          onPress: async () => {
            try {
              setComprando(true);
              const pedido = await comprar();
              Alert.alert(
                "¡Compra realizada!",
                `Tu pedido #${pedido.id} por $${pedido.total} quedó confirmado.`,
              );
            } catch (e) {
              Alert.alert(
                "No se pudo completar la compra",
                e instanceof Error ? e.message : "Intenta de nuevo.",
              );
            } finally {
              await cargar();
              setComprando(false);
            }
          },
        },
      ],
    );
  };

  const items = carrito?.items ?? [];

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Carrito</ThemedText>
          {items.length > 0 && (
            <Pressable onPress={confirmarVaciar} hitSlop={8}>
              <ThemedText type="link">Vaciar</ThemedText>
            </Pressable>
          )}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        ) : error && !carrito ? (
          <View style={styles.center}>
            <ThemedText>No se pudo cargar el carrito.</ThemedText>
            <View style={styles.retry}>
              <PrimaryButton
                title="Reintentar"
                onPress={() => {
                  setLoading(true);
                  cargar().finally(() => setLoading(false));
                }}
              />
            </View>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.center}>
            <Ionicons
              name="cart-outline"
              size={56}
              color={theme.textSecondary}
            />
            <ThemedText themeColor="textSecondary">
              Tu carrito está vacío.
            </ThemedText>
            <View style={styles.retry}>
              <PrimaryButton
                title="Ir al catálogo"
                onPress={() => router.push("/catalogo")}
              />
            </View>
          </View>
        ) : (
          <>
            <FlatList
              data={items}
              keyExtractor={(i) => String(i.id)}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                const bloqueado = ocupado === item.id || comprando;
                return (
                  <ThemedView type="backgroundElement" style={styles.fila}>
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
                          size={22}
                          color={theme.textSecondary}
                        />
                      </View>
                    )}

                    <View style={styles.datos}>
                      <ThemedText type="smallBold" numberOfLines={1}>
                        {item.prenda_nombre}
                      </ThemedText>
                      <ThemedText
                        type="small"
                        themeColor="textSecondary"
                        numberOfLines={1}
                      >
                        Talla {item.talla} · {item.color}
                      </ThemedText>
                      <ThemedText type="smallBold">${item.subtotal}</ThemedText>

                      <View style={styles.stepper}>
                        <Pressable
                          onPress={() => cambiar(item.id, item.cantidad - 1)}
                          disabled={bloqueado || item.cantidad <= 1}
                          hitSlop={6}
                          accessibilityLabel="Quitar una pieza"
                          style={[
                            styles.boton,
                            (bloqueado || item.cantidad <= 1) &&
                              styles.botonOff,
                          ]}
                        >
                          <Ionicons
                            name="remove"
                            size={18}
                            color={theme.text}
                          />
                        </Pressable>
                        <ThemedText type="smallBold" style={styles.cantidad}>
                          {item.cantidad}
                        </ThemedText>
                        <Pressable
                          onPress={() => cambiar(item.id, item.cantidad + 1)}
                          disabled={bloqueado || item.cantidad >= item.stock}
                          hitSlop={6}
                          accessibilityLabel="Agregar una pieza"
                          style={[
                            styles.boton,
                            (bloqueado || item.cantidad >= item.stock) &&
                              styles.botonOff,
                          ]}
                        >
                          <Ionicons name="add" size={18} color={theme.text} />
                        </Pressable>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => quitar(item.id)}
                      disabled={bloqueado}
                      hitSlop={10}
                      accessibilityLabel="Quitar del carrito"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#d9534f"
                      />
                    </Pressable>
                  </ThemedView>
                );
              }}
            />

            <ThemedView type="backgroundElement" style={styles.resumen}>
              <View style={styles.totalFila}>
                <ThemedText themeColor="textSecondary">
                  Total ({carrito?.cantidad_total}{" "}
                  {carrito?.cantidad_total === 1 ? "pieza" : "piezas"})
                </ThemedText>
                <ThemedText type="subtitle">${carrito?.total}</ThemedText>
              </View>
              <PrimaryButton
                title="Comprar"
                onPress={confirmarCompra}
                loading={comprando}
              />
            </ThemedView>
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
  },
  retry: { width: 200 },
  list: { padding: Spacing.three, gap: Spacing.two },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: 12,
  },
  foto: { width: 84, height: 84, borderRadius: 10 },
  sinFoto: { alignItems: "center", justifyContent: "center" },
  datos: { flex: 1, gap: 2 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  boton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#8884",
    alignItems: "center",
    justifyContent: "center",
  },
  botonOff: { opacity: 0.35 },
  cantidad: { minWidth: 20, textAlign: "center" },
  resumen: {
    padding: Spacing.three,
    gap: Spacing.three,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  totalFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
