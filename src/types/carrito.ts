export type CarritoItem = {
  id: number;
  prenda: number;
  prenda_nombre: string;
  precio: string;
  talla: string;
  color: string;
  stock: number;
  imagen: string | null;
  cantidad: number;
  subtotal: string;
};

export type Carrito = {
  items: CarritoItem[];
  total: string;
  cantidad_total: number;
};
