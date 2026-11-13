import { Pressable, StyleSheet } from "react-native";

import { ColorDot } from "@/components/color-dot";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import type { ColorOpcion } from "@/types/color";

export function ColorChip({
  color,
  activo,
  onPress,
}: {
  color: ColorOpcion;
  activo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      accessibilityLabel={color.nombre}
    >
      <ThemedView
        type="backgroundElement"
        style={[styles.chip, activo && styles.activo]}
      >
        <ColorDot hex={color.hex} multicolor={color.valor === "multicolor"} />
        <ThemedText
          type="small"
          style={activo ? styles.textoActivo : undefined}
        >
          {color.nombre}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  activo: { borderColor: "#208AEF" },
  textoActivo: { fontWeight: "700" },
});
