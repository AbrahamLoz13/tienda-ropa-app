import { apiFetch } from "@/services/api";
import type { Categoria } from "@/types/categoria";
import type { Pagina } from "@/types/prenda";

export async function getCategorias(): Promise<Categoria[]> {
  const res = await apiFetch("/api/categorias/?page_size=50");
  if (!res.ok) throw new Error("SERVIDOR");
  const data: Pagina<Categoria> = await res.json();
  return data.results;
}
