import { StyleSheet, View } from "react-native";

const MULTI = ["#d32f2f", "#fbc02d", "#2e7d32", "#1e6fd9"];

export function ColorDot({
  hex,
  multicolor = false,
  size = 18,
}: {
  hex: string;
  multicolor?: boolean;
  size?: number;
}) {
  const base = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (multicolor) {
    return (
      <View style={[styles.multi, base]}>
        {MULTI.map((c) => (
          <View
            key={c}
            style={{ width: "50%", height: "50%", backgroundColor: c }}
          />
        ))}
      </View>
    );
  }

  return <View style={[styles.dot, base, { backgroundColor: hex }]} />;
}

const styles = StyleSheet.create({
  dot: { borderWidth: 1, borderColor: "#00000033" },
  multi: {
    flexDirection: "row",
    flexWrap: "wrap",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#00000033",
  },
});
