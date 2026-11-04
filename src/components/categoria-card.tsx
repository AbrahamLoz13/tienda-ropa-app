import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Categoria } from "@/types/categoria";

type Props = { categoria: Categoria; onPress: () => void };

export function CategoriaCard({ categoria, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${categoria.nombre}`}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <ThemedView type="backgroundElement" style={styles.card}>
        {categoria.imagen ? (
          <Image
            source={{ uri: categoria.imagen }}
            style={styles.image}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons
              name="shirt-outline"
              size={40}
              color={theme.textSecondary}
            />
          </View>
        )}
        <View style={styles.info}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
            {categoria.nombre}
          </ThemedText>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.textSecondary}
          />
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
  info: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.two,
  },
  name: { flex: 1 },
});
