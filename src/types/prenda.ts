export type ImagenPrenda = {
  id: number;
  imagen: string;
  descripcion: string | null;
};

export type Prenda = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: string;
  talla: string;
  color: string;
  color_nombre: string;
  marca: string | null;
  stock: number;
  imagen: string | null;
  categoria: number;
  es_favorito: boolean;
  categoria_nombre: string;
  imagenes: ImagenPrenda[];
  creado: string;
};

export type Pagina<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
