import { buildMultipart } from "@/services/multipart";
import { File } from "expo-file-system";

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

export type PrendaInput = {
  nombre: string;
  descripcion: string;
  precio: string;
  talla: string;
  color: string;
  marca: string;
  stock: string;
  categoria: number;
  imagenUri?: string | null;
};

export type ApiValidationError = Error & { fields: Record<string, string> };

// Arma a mano el cuerpo multipart/form-data (con la foto como bytes),
// porque el FormData de React Native no es compatible con expo/fetch.
async function toMultipart(d: PrendaInput) {
  const boundary = `----TiendaRopa${Math.random().toString(36).slice(2)}`;
  const enc = new TextEncoder();
  const partes: Uint8Array[] = [];

  const campos: Record<string, string> = {
    nombre: d.nombre,
    descripcion: d.descripcion,
    precio: d.precio,
    talla: d.talla,
    color: d.color,
    marca: d.marca,
    stock: d.stock,
    categoria: String(d.categoria),
  };
  for (const [nombre, valor] of Object.entries(campos)) {
    partes.push(
      enc.encode(
        `--${boundary}\r\nContent-Disposition: form-data; name="${nombre}"\r\n\r\n${valor}\r\n`,
      ),
    );
  }

  if (d.imagenUri) {
    const bytes = await new File(d.imagenUri).bytes();
    const esPng = d.imagenUri.toLowerCase().endsWith(".png");
    const tipo = esPng ? "image/png" : "image/jpeg";
    const archivo = esPng ? "foto.png" : "foto.jpg";
    partes.push(
      enc.encode(
        `--${boundary}\r\nContent-Disposition: form-data; name="imagen"; filename="${archivo}"\r\nContent-Type: ${tipo}\r\n\r\n`,
      ),
      bytes,
      enc.encode("\r\n"),
    );
  }

  partes.push(enc.encode(`--${boundary}--\r\n`));

  const total = partes.reduce((n, p) => n + p.length, 0);
  const body = new Uint8Array(total);
  let pos = 0;
  for (const p of partes) {
    body.set(p, pos);
    pos += p.length;
  }

  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

async function validationError(res: Response): Promise<ApiValidationError> {
  const data = await res.json().catch(() => null);
  const fields: Record<string, string> = {};
  if (data && typeof data === "object") {
    for (const [campo, valor] of Object.entries(data)) {
      fields[campo] = Array.isArray(valor) ? valor.join(" ") : String(valor);
    }
  }
  return Object.assign(new Error("VALIDACION"), { fields });
}

export async function crearPrenda(d: PrendaInput): Promise<Prenda> {
  const { body, contentType } = await toMultipart(d);
  const res = await apiFetch("/api/prendas/", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: body as unknown as BodyInit,
  });
  if (res.status === 400) throw await validationError(res);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function actualizarPrenda(
  id: number,
  d: PrendaInput,
): Promise<Prenda> {
  const { body, contentType } = await toMultipart(d);
  const res = await apiFetch(`/api/prendas/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": contentType },
    body: body as unknown as BodyInit,
  });
  if (res.status === 400) throw await validationError(res);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function eliminarPrenda(id: number): Promise<void> {
  const res = await apiFetch(`/api/prendas/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("SERVIDOR");
}
export async function agregarImagen(
  prendaId: number,
  uri: string,
  descripcion = "",
): Promise<Prenda["imagenes"][number]> {
  const { body, contentType } = await buildMultipart(
    { descripcion },
    { campo: "imagen", uri },
  );
  const res = await apiFetch(`/api/prendas/${prendaId}/imagenes/`, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: body as unknown as BodyInit,
  });
  if (res.status === 400) {
    const data = await res.json().catch(() => null);
    const msg = data?.imagen?.[0] ?? "La imagen no es válida.";
    throw new Error(msg);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function eliminarImagen(
  prendaId: number,
  imagenId: number,
): Promise<void> {
  const res = await apiFetch(`/api/prendas/${prendaId}/imagenes/${imagenId}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
