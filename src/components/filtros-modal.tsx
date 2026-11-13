import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ColorChip } from "@/components/color-chip";
import { PrimaryButton } from "@/components/primary-button";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useCatalogo } from "@/context/CatalogoContext";
import { useTheme } from "@/hooks/use-theme";

export type FiltrosState = {
  tallas: string[];
  colores: string[];
  precioMin: string;
  precioMax: string;
  orden: string;
};

export const FILTROS_VACIOS: FiltrosState = {
  tallas: [],
  colores: [],
  precioMin: "",
  precioMax: "",
  orden: "-creado",
};

const TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];
const ORDENES = [
  { label: "Más recientes", value: "-creado" },
  { label: "Precio: menor a mayor", value: "precio" },
  { label: "Precio: mayor a menor", value: "-precio" },
  { label: "Nombre A-Z", value: "nombre" },
];

type Props = {
  visible: boolean;
  inicial: FiltrosState;
  onClose: () => void;
  onApply: (f: FiltrosState) => void;
};

function Chip({
  label,
  activo,
  onPress,
}: {
  label: string;
  activo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView
        type="backgroundElement"
        style={[styles.chip, activo && styles.chipActivo]}
      >
        <ThemedText
          type="small"
          style={activo ? styles.chipTextoActivo : undefined}
        >
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function FiltrosModal({ visible, inicial, onClose, onApply }: Props) {
  const theme = useTheme();
  const { colores } = useCatalogo();
  const [f, setF] = useState<FiltrosState>(inicial);

  const toggleTalla = (t: string) =>
    setF((p) => ({
      ...p,
      tallas: p.tallas.includes(t)
        ? p.tallas.filter((x) => x !== t)
        : [...p.tallas, t],
    }));

  const toggleColor = (c: string) =>
    setF((p) => ({
      ...p,
      colores: p.colores.includes(c)
        ? p.colores.filter((x) => x !== c)
        : [...p.colores, c],
    }));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onShow={() => setF(inicial)}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.flex} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <ThemedText type="subtitle">Filtros</ThemedText>
            <Pressable onPress={() => setF(FILTROS_VACIOS)}>
              <ThemedText type="link">Limpiar</ThemedText>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
          >
            <ThemedText type="smallBold">Talla</ThemedText>
            <View style={styles.row}>
              {TALLAS.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  activo={f.tallas.includes(t)}
                  onPress={() => toggleTalla(t)}
                />
              ))}
            </View>

            <ThemedText type="smallBold">Color</ThemedText>
            <View style={styles.row}>
              {colores.map((c) => (
                <ColorChip
                  key={c.valor}
                  color={c}
                  activo={f.colores.includes(c.valor)}
                  onPress={() => toggleColor(c.valor)}
                />
              ))}
            </View>

            <ThemedText type="smallBold">Precio</ThemedText>
            <View style={styles.row}>
              <View style={styles.flex}>
                <TextField
                  label="Mínimo"
                  value={f.precioMin}
                  onChangeText={(precioMin) =>
                    setF((p) => ({ ...p, precioMin }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View style={styles.flex}>
                <TextField
                  label="Máximo"
                  value={f.precioMax}
                  onChangeText={(precioMax) =>
                    setF((p) => ({ ...p, precioMax }))
                  }
                  keyboardType="numeric"
                  placeholder="1000"
                />
              </View>
            </View>

            <ThemedText type="smallBold">Ordenar por</ThemedText>
            <View style={styles.row}>
              {ORDENES.map((o) => (
                <Chip
                  key={o.value}
                  label={o.label}
                  activo={f.orden === o.value}
                  onPress={() => setF((p) => ({ ...p, orden: o.value }))}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton title="Aplicar filtros" onPress={() => onApply(f)} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: "#00000088" },
  sheet: {
    maxHeight: "85%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.three,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
  },
  body: { padding: Spacing.three, gap: Spacing.three },
  row: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 16,
  },
  chipActivo: { backgroundColor: "#208AEF" },
  chipTextoActivo: { color: "#fff" },
  footer: { padding: Spacing.three },
});
