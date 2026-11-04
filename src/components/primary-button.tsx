import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "danger";
};

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}: Props) {
  const inactive = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        variant === "danger" && styles.danger,
        (inactive || pressed) && styles.dim,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <ThemedText style={styles.text}>{title}</ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#208AEF",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  danger: { backgroundColor: "#d9534f" },
  dim: { opacity: 0.6 },
  text: { color: "#fff", fontWeight: "700" },
});
