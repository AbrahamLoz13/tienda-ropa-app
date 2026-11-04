import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import { getCategorias } from "@/services/categorias";
import {
    actualizarPrenda,
    crearPrenda,
    getPrenda,
    type ApiValidationError,
    type PrendaInput,
} from "@/services/prendas";
import type { Categoria } from "@/types/categoria";

const TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];

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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
    >
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

export default function PrendaForm() {
  const router = useRouter();
  const theme = useTheme();
  const { isStaff } = useAuth();
  const { id, categoria: categoriaParam } = useLocalSearchParams<{
    id?: string;
    categoria?: string;
  }>();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [marca, setMarca] = useState("");
  const [color, setColor] = useState("");
  const [stock, setStock] = useState("0");
  const [descripcion, setDescripcion] = useState("");
  const [talla, setTalla] = useState("M");
  const [categoria, setCategoria] = useState<number | null>(null);
  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [imagenActual, setImagenActual] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);

  const cargarTodo = useCallback(async () => {
    try {
      setLoadError(false);
      setLoading(true);
      setCategorias(await getCategorias());
      if (id) {
        const p = await getPrenda(id);
        setNombre(p.nombre);
        setPrecio(p.precio);
        setMarca(p.marca ?? "");
        setColor(p.color);
        setStock(String(p.stock));
        setDescripcion(p.descripcion ?? "");
        setTalla(p.talla);
        setCategoria(p.categoria);
        setImagenActual(p.imagen);
      } else if (categoriaParam) {
        setCategoria(Number(categoriaParam));
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [id, categoriaParam]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  const elegirImagen = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
    });
    if (!res.canceled) setImagenUri(res.assets[0].uri);
  };

  const validar = () => {
    const e: Record<string, string> = {};
    const p = Number(precio.replace(",", "."));
    if (nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres.";
    if (!precio.trim() || Number.isNaN(p) || p <= 0)
      e.precio = "Ingresa un precio mayor a 0.";
    if (!color.trim()) e.color = "Ingresa el color.";
    if (!/^\d+$/.test(stock.trim())) e.stock = "Ingresa un número entero.";
    if (categoria === null) e.categoria = "Elige una categoría.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async () => {
    if (!validar() || categoria === null) return;
    try {
      setSaving(true);
      const datos: PrendaInput = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: precio.trim().replace(",", "."),
        talla,
        color: color.trim(),
        marca: marca.trim(),
        stock: stock.trim(),
        categoria,
        imagenUri,
      };
      if (id) await actualizarPrenda(Number(id), datos);
      else await crearPrenda(datos);
      router.back();
    } catch (e) {
      console.log("ERROR GUARDAR:", e, imagenUri);
      if (e instanceof Error && e.message === "VALIDACION") {
        setErrors((e as ApiValidationError).fields);
      } else {
        Alert.alert(
          "Error",
          `No se pudo guardar.\n${e instanceof Error ? e.message : String(e)}`,
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const titulo = id ? "Editar prenda" : "Nueva prenda";

  if (!isStaff) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ headerShown: true, title: titulo }} />
        <ThemedText>Solo los administradores pueden hacer esto.</ThemedText>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ headerShown: true, title: titulo }} />
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (loadError) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ headerShown: true, title: titulo }} />
        <ThemedText>No se pudo cargar el formulario.</ThemedText>
        <View style={styles.retry}>
          <PrimaryButton title="Reintentar" onPress={cargarTodo} />
        </View>
      </ThemedView>
    );
  }

  const preview = imagenUri ?? imagenActual;

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: true, title: titulo }} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {errors.non_field_errors ? (
          <ThemedText style={styles.error}>
            {errors.non_field_errors}
          </ThemedText>
        ) : null}

        <View style={styles.block}>
          <ThemedText type="smallBold">Foto principal</ThemedText>
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
                    size={36}
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
          label="Precio"
          value={precio}
          onChangeText={setPrecio}
          keyboardType="decimal-pad"
          editable={!saving}
          error={errors.precio}
        />
        <TextField
          label="Marca (opcional)"
          value={marca}
          onChangeText={setMarca}
          editable={!saving}
          error={errors.marca}
        />
        <TextField
          label="Color"
          value={color}
          onChangeText={setColor}
          autoCapitalize="none"
          editable={!saving}
          error={errors.color}
        />
        <TextField
          label="Stock"
          value={stock}
          onChangeText={setStock}
          keyboardType="number-pad"
          editable={!saving}
          error={errors.stock}
        />

        <View style={styles.block}>
          <ThemedText type="smallBold">Talla</ThemedText>
          <View style={styles.chips}>
            {TALLAS.map((t) => (
              <Chip
                key={t}
                label={t}
                activo={talla === t}
                onPress={() => setTalla(t)}
              />
            ))}
          </View>
          {errors.talla ? (
            <ThemedText type="small" style={styles.error}>
              {errors.talla}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.block}>
          <ThemedText type="smallBold">Categoría</ThemedText>
          <View style={styles.chips}>
            {categorias.map((c) => (
              <Chip
                key={c.id}
                label={c.nombre}
                activo={categoria === c.id}
                onPress={() => setCategoria(c.id)}
              />
            ))}
          </View>
          {errors.categoria ? (
            <ThemedText type="small" style={styles.error}>
              {errors.categoria}
            </ThemedText>
          ) : null}
        </View>

        <TextField
          label="Descripción (opcional)"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          editable={!saving}
          style={styles.multiline}
          error={errors.descripcion}
        />

        <PrimaryButton
          title={id ? "Guardar cambios" : "Crear prenda"}
          onPress={guardar}
          loading={saving}
        />
      </ScrollView>
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
  container: {
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
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 16,
  },
  chipActivo: { backgroundColor: "#208AEF" },
  chipTextoActivo: { color: "#fff", fontWeight: "700" },
  multiline: { height: 96, paddingTop: 12, textAlignVertical: "top" },
  error: { color: "#d9534f" },
});
