import * as SecureStore from "expo-secure-store";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

const KEY = "page_size";
const DEFAULT_SIZE = 10;
export const PAGE_SIZES = [6, 10, 20, 30];

type SettingsContextType = {
  pageSize: number;
  setPageSize: (n: number) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [pageSize, setSize] = useState(DEFAULT_SIZE);

  useEffect(() => {
    SecureStore.getItemAsync(KEY).then((valor) => {
      const n = Number(valor);
      if (PAGE_SIZES.includes(n)) setSize(n);
    });
  }, []);

  const setPageSize = async (n: number) => {
    setSize(n);
    await SecureStore.setItemAsync(KEY, String(n));
  };

  return (
    <SettingsContext.Provider value={{ pageSize, setPageSize }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings debe usarse dentro de SettingsProvider");
  return ctx;
}
