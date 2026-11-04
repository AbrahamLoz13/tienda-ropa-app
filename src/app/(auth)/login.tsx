import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { login } from "@/services/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert("Error", "Ingresa tu usuario y contraseña.");
      return;
    }
    try {
      setLoading(true);
      const token = await login(username.trim(), password);
      await signIn(token);
    } catch (e) {
      const credenciales = e instanceof Error && e.message === "CREDENCIALES";
      Alert.alert(
        "Error",
        credenciales
          ? "Usuario o contraseña incorrectos."
          : "No se pudo conectar con el servidor.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Iniciar sesión
      </ThemedText>

      <TextField
        label="Usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
      <TextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <PrimaryButton title="Entrar" onPress={handleLogin} loading={loading} />

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          ¿No tienes cuenta?
        </ThemedText>
        <Pressable onPress={() => router.push("/register")}>
          <ThemedText type="link">Regístrate</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
