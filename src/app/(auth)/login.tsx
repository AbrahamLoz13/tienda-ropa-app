import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    TextInput,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { login } from "@/services/auth";

export default function LoginScreen() {
  const theme = useTheme();
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

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Iniciar sesión
      </ThemedText>
      <TextInput
        placeholder="Usuario"
        placeholderTextColor={theme.textSecondary}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        style={inputStyle}
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor={theme.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
        style={inputStyle}
      />
      <Pressable
        onPress={handleLogin}
        disabled={loading}
        style={[styles.button, loading && styles.buttonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>Entrar</ThemedText>
        )}
      </Pressable>
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
  title: { textAlign: "center", marginBottom: Spacing.three },
  input: { height: 48, borderRadius: 8, paddingHorizontal: Spacing.three },
  button: {
    backgroundColor: "#208AEF",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  buttonDisabled: { opacity: 0.6 },
});
