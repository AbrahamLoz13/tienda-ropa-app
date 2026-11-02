import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import type { Prenda } from "@/types/prenda";

type Props = { prenda: Prenda; onPress?: () => void };

export function PrendaCard({ prenda, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${prenda.nombre}`}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <ThemedView type="backgroundElement" style={styles.card}>
        <View>
          {prenda.imagen ? (
            <Image
              source={{ uri: prenda.imagen }}
              style={styles.image}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <ThemedText type="small" themeColor="textSecondary">
                Sin foto
              </ThemedText>
            </View>
          )}
          {prenda.es_favorito && (
            <View style={styles.heart}>
              <Ionicons name="heart" size={16} color="#d9534f" />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {prenda.nombre}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {prenda.categoria_nombre} · {prenda.talla}
          </ThemedText>
          <ThemedText type="smallBold">${prenda.precio}</ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { flex: 1, maxWidth: "50%" },
  pressed: { opacity: 0.7 },
  card: { borderRadius: 12, overflow: "hidden" },
  image: { width: "100%", aspectRatio: 1 },
  placeholder: { alignItems: "center", justifyContent: "center" },
  heart: {
    position: "absolute",
    top: Spacing.two,
    right: Spacing.two,
    backgroundColor: "#ffffffdd",
    borderRadius: 14,
    padding: 5,
  },
  info: { padding: Spacing.two, gap: Spacing.half },
});
