import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, style, ...props }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        {...props}
        style={[
          styles.input,
          { backgroundColor: theme.backgroundElement, color: theme.text },
          error ? styles.inputError : null,
          style,
        ]}
      />
      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.one },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: { borderColor: "#d9534f" },
  error: { color: "#d9534f" },
});
