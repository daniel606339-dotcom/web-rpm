import { cache } from "react";
import { POR_PAGINA } from "./config";
import { consultar, type Filtro } from "./db";

export interface Departamento {
  slug: string;
  nombre: string;
  orden: number;
  visible: boolean;
}

export interface Linea {
  cod_linea: string;
  nombre: string;
  slug: string;
  departamento: string;
  publicar: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  texto?: string | null;
}

export interface Coleccion {
  slug: string;
  nombre: string;
  cod_familia: string;
  departamento: string;
  publicar: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  texto?: string | null;
}

export interface Marca {
  cod_marca: string;
  nombre: string;
  slug: string;
  publicar: boolean;
  logo_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  texto?: string | null;
}

export interface ProductoResumen {
  cod_articulo: string;
  nombre: string;
  foto_url: string | null;
  precio_venta: number | null;
  cant_dispon: number | null;
  slug: string | null;
  marca_nombre: string | null;
  linea_nombre: string | null;
}

export interface Producto extends ProductoResumen {
  cod_barra_art: string | null;
  descripcion_erp: string | null;
  stock_actualizado_at: string | null;
  cod_linea: string | null;
  linea_slug: string | null;
  departamento: string | null;
  seo_title: string | null;
  seo_description: string | null;
  texto: string | null;
  cod_marca: string | null;
  marca_slug: string | null;
  cod_familia: string | null;
}

const COLS_RESUMEN =
  "cod_articulo,nombre,foto_url,precio_venta,cant_dispon,slug,marca_nombre,linea_nombre";

// ---------- Árbol de categorías ----------

export const getDepartamentos = cache(async () => {
  const { filas } = await consultar<Departamento>("departamentos", {
    filtros: [{ op: "eq", col: "visible", val: true }],
    orden: [{ col: "orden" }],
    revalidar: 3600,
  });
  return filas;
});

export const getLineas = cache(async () => {
  const { filas } = await consultar<Linea>("lineas", {
    select: "cod_linea,nombre,slug,departamento,publicar,seo_title,seo_description,texto",
    filtros: [{ op: "eq", col: "publicar", val: true }],
    orden: [{ col: "nombre" }],
    revalidar: 3600,
  });
  return filas;
});

export const getColecciones = cache(async () => {
  const { filas } = await consultar<Coleccion>("colecciones", {
    filtros: [{ op: "eq", col: "publicar", val: true }],
    orden: [{ col: "nombre" }],
    revalidar: 3600,
  });
  return filas;
});

export interface MenuDepartamento extends Departamento {
  lineas: Linea[];
}

/** Departamentos con sus líneas (la línea aparece en su departamento principal y en los extra de linea_menu). */
export const getMenu = cache(async (): Promise<MenuDepartamento[]> => {
  const [deps, lineas, extra] = await Promise.all([
    getDepartamentos(),
    getLineas(),
    consultar<{ cod_linea: string; departamento: string }>("linea_menu", { revalidar: 3600 }).then((r) => r.filas),
  ]);
  const porCod = new Map(lineas.map((l) => [l.cod_linea, l]));
  return deps.map((d) => {
    const set = new Map<string, Linea>();
    for (const l of lineas) if (l.departamento === d.slug) set.set(l.cod_linea, l);
    for (const e of extra) {
      const l = porCod.get(e.cod_linea);
      if (e.departamento === d.slug && l) set.set(l.cod_linea, l);
    }
    return { ...d, lineas: [...set.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")) };
  });
});

export async function getLinea(slug: string) {
  return (await getLineas()).find((l) => l.slug === slug) ?? null;
}

export async function getColeccion(slug: string) {
  return (await getColecciones()).find((c) => c.slug === slug) ?? null;
}

export async function getDepartamento(slug: string) {
  return (await getMenu()).find((d) => d.slug === slug) ?? null;
}

export const getMarca = cache(async (slug: string) => {
  const { filas } = await consultar<Marca>("marcas", {
    select: "cod_marca,nombre,slug,publicar,logo_url,seo_title,seo_description,texto",
    filtros: [
      { op: "eq", col: "slug", val: slug },
      { op: "eq", col: "publicar", val: true },
    ],
    limite: 1,
    revalidar: 3600,
  });
  return filas[0] ?? null;
});

// ---------- Productos ----------

export type Orden = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

function ordenar(o: Orden) {
  switch (o) {
    case "precio-asc":
      return [{ col: "precio_venta", nullsLast: true }];
    case "precio-desc":
      return [{ col: "precio_venta", desc: true, nullsLast: true }];
    case "nombre":
      return [{ col: "nombre" }];
    default:
      // Primero lo que hay en stock (más disponible arriba), después el resto.
      return [{ col: "cant_dispon", desc: true, nullsLast: true }, { col: "nombre" }];
  }
}

export async function listarProductos(opts: {
  filtros: Filtro[];
  pagina?: number;
  orden?: Orden;
  soloStock?: boolean;
  porPagina?: number;
}) {
  const porPagina = opts.porPagina ?? POR_PAGINA;
  const pagina = Math.max(1, opts.pagina ?? 1);
  const filtros = [...opts.filtros];
  if (opts.soloStock) filtros.push({ op: "gt", col: "cant_dispon", val: 0 });
  const r = await consultar<ProductoResumen>("productos", {
    select: COLS_RESUMEN,
    filtros,
    orden: ordenar(opts.orden ?? "relevancia"),
    limite: porPagina,
    desde: (pagina - 1) * porPagina,
    contar: true,
  });
  return { ...r, pagina, porPagina, paginas: Math.max(1, Math.ceil((r.total ?? 0) / porPagina)) };
}

export const getProducto = cache(async (cod: string) => {
  const { filas } = await consultar<Producto>("productos", {
    filtros: [{ op: "eq", col: "cod_articulo", val: cod }],
    limite: 1,
  });
  return filas[0] ?? null;
});

export async function getRelacionados(p: Producto, n = 8) {
  if (!p.cod_linea) return [];
  const { filas } = await consultar<ProductoResumen>("productos", {
    select: COLS_RESUMEN,
    filtros: [
      { op: "eq", col: "cod_linea", val: p.cod_linea },
      { op: "gt", col: "cant_dispon", val: 0 },
    ],
    orden: [{ col: "cant_dispon", desc: true }],
    limite: n + 1,
  });
  return filas.filter((x) => x.cod_articulo !== p.cod_articulo).slice(0, n);
}

export function filtroBusqueda(texto: string): Filtro {
  return { op: "buscar", cols: ["nombre", "cod_articulo", "cod_barra_art", "marca_nombre"], texto };
}

export function parseOrden(v: string | string[] | undefined): Orden {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "precio-asc" || s === "precio-desc" || s === "nombre" ? s : "relevancia";
}

export function parsePagina(v: string | string[] | undefined): number {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n > 0 && n < 1000 ? n : 1;
}
