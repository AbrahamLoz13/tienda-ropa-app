import { apiFetch } from "@/services/api";
import { buildMultipart } from "@/services/multipart";
import type { Categoria } from "@/types/categoria";
import type { Pagina } from "@/types/prenda";

export async function getCategorias(): Promise<Categoria[]> {
  const res = await apiFetch("/api/categorias/?page_size=50");
  if (!res.ok) throw new Error("SERVIDOR");
  const data: Pagina<Categoria> = await res.json();
  return data.results;
}

export type CategoriaInput = {
  nombre: string;
  descripcion: string;
  imagenUri?: string | null;
};

export type CategoriaError = Error & { fields: Record<string, string> };

async function erroresDe(res: Response): Promise<CategoriaError> {
  const data = await res.json().catch(() => null);
  const fields: Record<string, string> = {};
  if (data && typeof data === "object") {
    for (const [campo, valor] of Object.entries(data)) {
      fields[campo] = Array.isArray(valor) ? valor.join(" ") : String(valor);
    }
  }
  return Object.assign(new Error("VALIDACION"), { fields });
}

async function enviar(
  path: string,
  method: "POST" | "PATCH",
  d: CategoriaInput,
): Promise<Categoria> {
  const { body, contentType } = await buildMultipart(
    { nombre: d.nombre, descripcion: d.descripcion },
    d.imagenUri ? { campo: "imagen", uri: d.imagenUri } : null,
  );
  const res = await apiFetch(path, {
    method,
    headers: { "Content-Type": contentType },
    body: body as unknown as BodyInit,
  });
  if (res.status === 400) throw await erroresDe(res);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const crearCategoria = (d: CategoriaInput) =>
  enviar("/api/categorias/", "POST", d);

export const actualizarCategoria = (id: number, d: CategoriaInput) =>
  enviar(`/api/categorias/${id}/`, "PATCH", d);

export async function eliminarCategoria(id: number): Promise<void> {
  const res = await apiFetch(`/api/categorias/${id}/`, { method: "DELETE" });
  if (res.status === 409) {
    const data = await res.json().catch(() => null);
    throw new Error(
      data?.detail ?? "No puedes eliminar una categoría que tiene prendas.",
    );
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
