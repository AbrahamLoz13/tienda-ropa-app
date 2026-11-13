import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState, type ComponentRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthPalette } from "@/constants/auth-palette";
import { useAuth } from "@/context/AuthContext";
import { login } from "@/services/auth";

const NOMBRE_TIENDA = "CLOSETLY";
const SERIF = Platform.select({ ios: "Georgia", default: "serif" });

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const c = AuthPalette[useColorScheme() === "dark" ? "dark" : "light"];

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [foco, setFoco] = useState<"user" | "pass" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const passRef = useRef<ComponentRef<typeof TextInput>>(null);

  const handleLogin = async () => {
    if (loading) return;
    if (!username.trim() || !password) {
      setError("Ingresa tu usuario y contraseña.");
      return;
    }
    try {
      setError("");
      setLoading(true);
      const token = await login(username.trim(), password);
      await signIn(token);
    } catch (e) {
      const credenciales = e instanceof Error && e.message === "CREDENCIALES";
      setError(
        credenciales
          ? "Usuario o contraseña incorrectos."
          : "No se pudo conectar con el servidor.",
      );
    } finally {
      setLoading(false);
    }
  };

  const borde = (campo: "user" | "pass") => ({
    borderColor: foco === campo ? c.borderFocus : c.border,
    backgroundColor: c.field,
  });

  return (
    <View style={styles.flex}>
      <Image
        source={require("../../../assets/images/login-bg.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: c.overlay }]} />

      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brand}>
              <Text
                style={[styles.wordmark, { color: c.text, fontFamily: SERIF }]}
              >
                {NOMBRE_TIENDA}
              </Text>
              <View style={[styles.rule, { backgroundColor: c.text }]} />
              <Text
                style={[styles.title, { color: c.text, fontFamily: SERIF }]}
              >
                Bienvenido
              </Text>
            </View>

            <View style={styles.form}>
              <TextInput
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
                onFocus={() => setFoco("user")}
                onBlur={() => setFoco(null)}
                placeholder="Usuario"
                placeholderTextColor={c.muted}
                style={[styles.input, borde("user"), { color: c.text }]}
              />

              <View style={[styles.passWrap, borde("pass")]}>
                <TextInput
                  ref={passRef}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!verPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  onFocus={() => setFoco("pass")}
                  onBlur={() => setFoco(null)}
                  placeholder="Contraseña"
                  placeholderTextColor={c.muted}
                  style={[styles.passInput, { color: c.text }]}
                />
                <Pressable
                  onPress={() => setVerPass((v) => !v)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={
                    verPass ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  <Ionicons
                    name={verPass ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={c.muted}
                  />
                </Pressable>
              </View>

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: c.errorBg }]}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color={c.error}
                  />
                  <Text style={[styles.errorText, { color: c.error }]}>
                    {error}
                  </Text>
                </View>
              ) : null}

              <Pressable
                onPress={handleLogin}
                disabled={loading}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: c.button },
                  (pressed || loading) && styles.dim,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={c.buttonText} />
                ) : (
                  <Text style={[styles.buttonText, { color: c.buttonText }]}>
                    INICIAR SESIÓN
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => router.push("/register")}
                accessibilityRole="button"
                style={styles.link}
              >
                <Text style={[styles.linkText, { color: c.text }]}>
                  Crear una cuenta
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 32,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },
  brand: { alignItems: "center", marginBottom: 36 },
  wordmark: { fontSize: 36, letterSpacing: 8, fontWeight: "400" },
  rule: { width: 36, height: 1.5, marginVertical: 14 },
  title: { fontSize: 22, fontWeight: "400", letterSpacing: 1 },
  form: { gap: 14 },
  input: {
    height: 54,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passWrap: {
    height: 54,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  passInput: { flex: 1, height: 54, fontSize: 16 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 4,
  },
  errorText: { flex: 1, fontSize: 13 },
  button: {
    height: 54,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonText: { fontSize: 13, fontWeight: "700", letterSpacing: 2.5 },
  dim: { opacity: 0.65 },
  link: { alignItems: "center", paddingVertical: 10 },
  linkText: { fontSize: 14, textDecorationLine: "underline" },
});
