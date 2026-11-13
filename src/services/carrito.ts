import { apiFetch } from "@/services/api";
import type { Carrito, CarritoItem } from "@/types/carrito";

// Convierte la respuesta de error del backend en un mensaje legible.
async function mensajeDe(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  if (data?.cantidad?.[0]) return data.cantidad[0];
  if (data?.prenda?.[0]) return data.prenda[0];
  if (data?.detail) {
    const problemas: {
      nombre: string;
      pedidas: number;
      disponibles: number;
    }[] = data.problemas ?? [];
    const lineas = problemas.map(
      (p) => `• ${p.nombre}: pediste ${p.pedidas}, hay ${p.disponibles}`,
    );
    return [data.detail, ...lineas].join("\n");
  }
  return `HTTP ${res.status}`;
}

export async function getCarrito(): Promise<Carrito> {
  const res = await apiFetch("/api/carrito/");
  if (!res.ok) throw new Error("SERVIDOR");
  return res.json();
}

export async function agregarAlCarrito(
  prenda: number,
  cantidad: number,
): Promise<CarritoItem> {
  const res = await apiFetch("/api/carrito/", {
    method: "POST",
    body: JSON.stringify({ prenda, cantidad }),
  });
  if (!res.ok) throw new Error(await mensajeDe(res));
  return res.json();
}

export async function cambiarCantidad(
  id: number,
  cantidad: number,
): Promise<CarritoItem> {
  const res = await apiFetch(`/api/carrito/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ cantidad }),
  });
  if (!res.ok) throw new Error(await mensajeDe(res));
  return res.json();
}

export async function quitarDelCarrito(id: number): Promise<void> {
  const res = await apiFetch(`/api/carrito/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error(await mensajeDe(res));
}

export async function vaciarCarrito(): Promise<void> {
  const res = await apiFetch("/api/carrito/vaciar/", { method: "DELETE" });
  if (!res.ok) throw new Error(await mensajeDe(res));
}

export async function comprar(): Promise<{ id: number; total: string }> {
  const res = await apiFetch("/api/carrito/comprar/", { method: "POST" });
  if (!res.ok) throw new Error(await mensajeDe(res));
  return res.json();
}
