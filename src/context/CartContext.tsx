import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { getCarrito } from "@/services/carrito";

type CartContextType = {
  piezas: number;
  setPiezas: (n: number) => void;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [piezas, setPiezas] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const c = await getCarrito();
      setPiezas(c.cantidad_total);
    } catch {
      // si falla, se queda el número anterior
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CartContext.Provider value={{ piezas, setPiezas, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
