import { apiFetch } from "@/services/api";
import type { Pagina, Prenda } from "@/types/prenda";

type Filtros = Record<string, string | number | undefined>;

function toQuery(params: Filtros) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&");
}

export async function getPrendas(
  page = 1,
  pageSize = 10,
  filtros: Filtros = {},
): Promise<Pagina<Prenda>> {
  const query = toQuery({ page, page_size: pageSize, ...filtros });
  const res = await apiFetch(`/api/prendas/?${query}`);
  if (!res.ok) throw new Error("SERVIDOR");
  return res.json();
}

export async function getPrenda(id: string): Promise<Prenda> {
  const res = await apiFetch(`/api/prendas/${id}/`);
  if (!res.ok) throw new Error("SERVIDOR");
  return res.json();
}

export async function toggleFavorito(id: number): Promise<boolean> {
  const res = await apiFetch(`/api/prendas/${id}/favorito/`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("SERVIDOR");
  const data = await res.json();
  return data.es_favorito;
}
export async function getFavoritos(): Promise<Prenda[]> {
  const res = await apiFetch("/api/prendas/favoritos/");
  if (!res.ok) throw new Error("SERVIDOR");
  return res.json();
}
