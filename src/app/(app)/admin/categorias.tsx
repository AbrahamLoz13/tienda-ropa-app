import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import {
    actualizarCategoria,
    crearCategoria,
    eliminarCategoria,
    getCategorias,
    type CategoriaError,
} from "@/services/categorias";
import type { Categoria } from "@/types/categoria";

export default function PanelCategorias() {
  const theme = useTheme();
  const { isStaff } = useAuth();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [imagenActual, setImagenActual] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      setCategorias(await getCategorias());
    } catch {
      setError(true);
    }
  }, []);

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

  const abrirNueva = () => {
    setEditando(null);
    setNombre("");
    setDescripcion("");
    setImagenUri(null);
    setImagenActual(null);
    setErrors({});
    setModal(true);
  };

  const abrirEditar = (c: Categoria) => {
    setEditando(c);
    setNombre(c.nombre);
    setDescripcion(c.descripcion ?? "");
    setImagenUri(null);
    setImagenActual(c.imagen ?? null);
    setErrors({});
    setModal(true);
  };

  const elegirImagen = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
    });
    if (!res.canceled) setImagenUri(res.assets[0].uri);
  };

  const guardar = async () => {
    if (nombre.trim().length < 2) {
      setErrors({ nombre: "Mínimo 2 caracteres." });
      return;
    }
    try {
      setSaving(true);
      setErrors({});
      const datos = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        imagenUri,
      };
      if (editando) await actualizarCategoria(editando.id, datos);
      else await crearCategoria(datos);
      setModal(false);
      await cargar();
    } catch (e) {
      if (e instanceof Error && e.message === "VALIDACION") {
        setErrors((e as CategoriaError).fields);
      } else {
        Alert.alert(
          "Error",
          `No se pudo guardar.\n${e instanceof Error ? e.message : ""}`,
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmarEliminar = () => {
    if (!editando) return;
    Alert.alert(
      "Eliminar categoría",
      `¿Eliminar "${editando.nombre}"? No se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarCategoria(editando.id);
              setModal(false);
              await cargar();
            } catch (e) {
              Alert.alert(
                "No se pudo eliminar",
                e instanceof Error ? e.message : "Intenta de nuevo.",
              );
            }
          },
        },
      ],
    );
  };

  if (!isStaff) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ headerShown: true, title: "Categorías" }} />
        <ThemedText>Solo los administradores pueden ver esto.</ThemedText>
      </ThemedView>
    );
  }

  const preview = imagenUri ?? imagenActual;

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Administrar categorías",
          headerRight: () => (
            <Pressable
              onPress={abrirNueva}
              hitSlop={10}
              accessibilityLabel="Nueva categoría"
            >
              <Ionicons name="add-circle-outline" size={28} color="#208AEF" />
            </Pressable>
          ),
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : error && categorias.length === 0 ? (
        <View style={styles.center}>
          <ThemedText>No se pudieron cargar las categorías.</ThemedText>
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
      ) : (
        <FlatList
          data={categorias}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => abrirEditar(item)}
              accessibilityRole="button"
            >
              <ThemedView type="backgroundElement" style={styles.fila}>
                {item.imagen ? (
                  <Image
                    source={{ uri: item.imagen }}
                    style={styles.miniatura}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.miniatura, styles.sinFoto]}>
                    <Ionicons
                      name="image-outline"
                      size={20}
                      color={theme.textSecondary}
                    />
                  </View>
                )}
                <View style={styles.datos}>
                  <ThemedText type="smallBold">{item.nombre}</ThemedText>
                  {item.descripcion ? (
                    <ThemedText
                      type="small"
                      themeColor="textSecondary"
                      numberOfLines={1}
                    >
                      {item.descripcion}
                    </ThemedText>
                  ) : null}
                </View>
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={theme.textSecondary}
                />
              </ThemedView>
            </Pressable>
          )}
          ListEmptyComponent={
            <ThemedText themeColor="textSecondary" style={styles.empty}>
              Todavía no hay categorías. Toca el + para crear una.
            </ThemedText>
          }
        />
      )}

      <Modal
        visible={modal}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(false)}
      >
        <View style={styles.backdrop}>
          <Pressable style={styles.flex} onPress={() => setModal(false)} />
          <View style={[styles.sheet, { backgroundColor: theme.background }]}>
            <ScrollView
              contentContainerStyle={styles.sheetContent}
              keyboardShouldPersistTaps="handled"
            >
              <ThemedText type="subtitle">
                {editando ? "Editar categoría" : "Nueva categoría"}
              </ThemedText>

              <View style={styles.block}>
                <ThemedText type="smallBold">Foto de la categoría</ThemedText>
                <Pressable
                  onPress={elegirImagen}
                  accessibilityRole="button"
                  accessibilityLabel="Elegir foto"
                >
                  <ThemedView type="backgroundElement" style={styles.photo}>
                    {preview ? (
                      <Image
                        source={{ uri: preview }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.photoEmpty}>
                        <Ionicons
                          name="camera-outline"
                          size={32}
                          color={theme.textSecondary}
                        />
                        <ThemedText type="small" themeColor="textSecondary">
                          Elegir de la galería
                        </ThemedText>
                      </View>
                    )}
                  </ThemedView>
                </Pressable>
                {preview ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    Toca la foto para cambiarla.
                  </ThemedText>
                ) : null}
                {errors.imagen ? (
                  <ThemedText type="small" style={styles.error}>
                    {errors.imagen}
                  </ThemedText>
                ) : null}
              </View>

              <TextField
                label="Nombre"
                value={nombre}
                onChangeText={setNombre}
                editable={!saving}
                error={errors.nombre}
              />
              <TextField
                label="Descripción (opcional)"
                value={descripcion}
                onChangeText={setDescripcion}
                editable={!saving}
                error={errors.descripcion}
              />
              {errors.non_field_errors ? (
                <ThemedText style={styles.error}>
                  {errors.non_field_errors}
                </ThemedText>
              ) : null}

              <PrimaryButton
                title={editando ? "Guardar cambios" : "Crear categoría"}
                onPress={guardar}
                loading={saving}
              />
              {editando && (
                <Pressable
                  onPress={confirmarEliminar}
                  disabled={saving}
                  style={styles.delete}
                  accessibilityRole="button"
                >
                  <ThemedText style={styles.deleteText}>
                    Eliminar categoría
                  </ThemedText>
                </Pressable>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
  },
  retry: { width: 180 },
  list: { padding: Spacing.three, gap: Spacing.two },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: 12,
  },
  miniatura: { width: 56, height: 56, borderRadius: 8 },
  sinFoto: { alignItems: "center", justifyContent: "center" },
  datos: { flex: 1, gap: 2 },
  empty: { textAlign: "center", marginTop: Spacing.five },
  backdrop: { flex: 1, backgroundColor: "#00000088" },
  sheet: {
    maxHeight: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  block: { gap: Spacing.two },
  photo: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  photoEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  error: { color: "#d9534f" },
  delete: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d9534f",
  },
  deleteText: { color: "#fff", fontWeight: "700" },
});
