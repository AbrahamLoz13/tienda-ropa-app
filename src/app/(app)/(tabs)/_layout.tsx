import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { useColorScheme, type ColorValue } from "react-native";

import { Colors } from "@/constants/theme";
import { useCart } from "@/context/CartContext";

type IconName = ComponentProps<typeof Ionicons>["name"];

function icon(activo: IconName, inactivo: IconName) {
  return ({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) => (
    <Ionicons
      name={focused ? activo : inactivo}
      size={size}
      color={color as string}
    />
  );
}

export default function TabsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { piezas } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#208AEF",
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Inicio", tabBarIcon: icon("home", "home-outline") }}
      />
      <Tabs.Screen
        name="catalogo"
        options={{
          title: "Catálogo",
          tabBarIcon: icon("shirt", "shirt-outline"),
        }}
      />
      <Tabs.Screen
        name="carrito"
        options={{
          title: "Carrito",
          tabBarIcon: icon("cart", "cart-outline"),
          tabBarBadge: piezas > 0 ? piezas : undefined,
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: "Favoritos",
          tabBarIcon: icon("heart", "heart-outline"),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: icon("person", "person-outline"),
        }}
      />
    </Tabs>
  );
}
