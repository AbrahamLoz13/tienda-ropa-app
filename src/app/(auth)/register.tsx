import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { register, type ValidationError } from "@/services/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validar = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = "Ingresa un nombre de usuario.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      e.email = "Ingresa un correo válido.";
    if (password.length < 8) e.password = "Mínimo 8 caracteres.";
    if (confirm !== password) e.confirm = "Las contraseñas no coinciden.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validar()) return;
    try {
      setLoading(true);
      const token = await register(username.trim(), email.trim(), password);
      await signIn(token);
    } catch (err) {
      if (err instanceof Error && err.message === "VALIDACION") {
        setErrors((err as ValidationError).fields);
      } else {
        Alert.alert("Error", "No se pudo conectar con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="subtitle" style={styles.title}>
          Crear cuenta
        </ThemedText>

        <TextField
          label="Usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          error={errors.username}
        />
        <TextField
          label="Correo"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          editable={!loading}
          error={errors.email}
        />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
          error={errors.password}
        />
        <TextField
          label="Confirmar contraseña"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          editable={!loading}
          error={errors.confirm}
        />

        <PrimaryButton
          title="Registrarme"
          onPress={handleRegister}
          loading={loading}
        />

        <View style={styles.footer}>
          <ThemedText type="small" themeColor="textSecondary">
            ¿Ya tienes cuenta?
          </ThemedText>
          <Pressable onPress={() => router.replace("/login")}>
            <ThemedText type="link">Inicia sesión</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: { textAlign: "center", marginBottom: Spacing.two },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
  },
});
