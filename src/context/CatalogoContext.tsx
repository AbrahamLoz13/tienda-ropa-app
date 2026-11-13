import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { getColores, getMarcas } from "@/services/prendas";
import type { ColorOpcion } from "@/types/color";

type CatalogoCtx = {
  marcas: string[];
  colores: ColorOpcion[];
  loading: boolean;
  colorPorValor: (valor: string) => ColorOpcion | undefined;
  recargar: () => Promise<void>;
};

const Ctx = createContext<CatalogoCtx | null>(null);

export function CatalogoProvider({ children }: { children: ReactNode }) {
  const [marcas, setMarcas] = useState<string[]>([]);
  const [colores, setColores] = useState<ColorOpcion[]>([]);
  const [loading, setLoading] = useState(true);

  const recargar = useCallback(async () => {
    try {
      const [m, c] = await Promise.all([getMarcas(), getColores()]);
      setMarcas(m);
      setColores(c);
    } catch {
      // si falla, las listas quedan vacías y se puede reintentar con recargar()
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const colorPorValor = useCallback(
    (valor: string) => colores.find((c) => c.valor === valor),
    [colores],
  );

  const value = useMemo(
    () => ({ marcas, colores, loading, colorPorValor, recargar }),
    [marcas, colores, loading, colorPorValor, recargar],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalogo() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useCatalogo debe usarse dentro de CatalogoProvider");
  return ctx;
}
