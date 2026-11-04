import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { agregarImagen, eliminarImagen } from "@/services/prendas";
import type { Prenda } from "@/types/prenda";

type Foto = Prenda["imagenes"][number];

type Props = { prendaId: number; inicial: Foto[] };

export function GaleriaEditor({ prendaId, inicial }: Props) {
  const theme = useTheme();
  const [fotos, setFotos] = useState<Foto[]>(inicial);
  const [subiendo, setSubiendo] = useState(false);

  const agregar = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
    });
    if (res.canceled) return;
    try {
      setSubiendo(true);
      const nueva = await agregarImagen(prendaId, res.assets[0].uri);
      setFotos((prev) => [...prev, nueva]);
    } catch (e) {
      Alert.alert(
        "No se pudo subir la foto",
        e instanceof Error ? e.message : "Intenta de nuevo.",
      );
    } finally {
      setSubiendo(false);
    }
  };

  const quitar = (foto: Foto) => {
    Alert.alert("Quitar foto", "¿Quitar esta foto de la galería?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Quitar",
        style: "destructive",
        onPress: async () => {
          try {
            await eliminarImagen(prendaId, foto.id);
            setFotos((prev) => prev.filter((f) => f.id !== foto.id));
          } catch {
            Alert.alert("Error", "No se pudo quitar la foto.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.block}>
      <ThemedText type="smallBold">Galería (fotos extra)</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.fila}
      >
        {fotos.map((f) => (
          <View key={f.id}>
            <Image
              source={{ uri: f.imagen }}
              style={styles.foto}
              contentFit="cover"
            />
            <Pressable
              onPress={() => quitar(f)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Quitar foto"
              style={styles.quitar}
            >
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={agregar}
          disabled={subiendo}
          accessibilityRole="button"
          accessibilityLabel="Agregar foto a la galería"
        >
          <ThemedView
            type="backgroundElement"
            style={[styles.foto, styles.agregar]}
          >
            {subiendo ? (
              <ActivityIndicator />
            ) : (
              <Ionicons name="add" size={32} color={theme.textSecondary} />
            )}
          </ThemedView>
        </Pressable>
      </ScrollView>
      {fotos.length === 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          Aún no hay fotos extra. Toca + para agregar otro ángulo.
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: Spacing.two },
  fila: { gap: Spacing.two, paddingVertical: Spacing.one },
  foto: { width: 88, height: 88, borderRadius: 10 },
  agregar: { alignItems: "center", justifyContent: "center" },
  quitar: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#d9534fe6",
    alignItems: "center",
    justifyContent: "center",
  },
});
