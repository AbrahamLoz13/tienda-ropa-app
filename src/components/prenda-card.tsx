import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import type { Prenda } from "@/types/prenda";

type Props = { prenda: Prenda; onPress?: () => void };

export function PrendaCard({ prenda, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <ThemedView type="backgroundElement" style={styles.card}>
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
  card: { borderRadius: 12, overflow: "hidden" },
  image: { width: "100%", aspectRatio: 1 },
  placeholder: { alignItems: "center", justifyContent: "center" },
  info: { padding: Spacing.two, gap: Spacing.half },
});
