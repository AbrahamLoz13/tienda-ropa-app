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
