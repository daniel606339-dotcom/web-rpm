import { cache } from "react";
import { POR_PAGINA } from "./config";
import { consultar, type Filtro } from "./db";
import { BANNERS, type Banner } from "./inicio";

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

/** Regla de publicación: solo artículos con stock disponible. */
export const CON_STOCK: Filtro = { op: "gt", col: "cant_dispon", val: 0 };

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

/** Líneas publicadas que tienen al menos un producto con stock (las vacías no se muestran). */
export const getLineas = cache(async () => {
  const [{ filas }, conStock] = await Promise.all([
    consultar<Linea>("lineas", {
      select: "cod_linea,nombre,slug,departamento,publicar,seo_title,seo_description,texto",
      filtros: [{ op: "eq", col: "publicar", val: true }],
      orden: [{ col: "nombre" }],
      revalidar: 3600,
    }),
    consultar<{ cod_linea: string }>("lineas_con_stock", { select: "cod_linea", revalidar: 900 }),
  ]);
  const ok = new Set(conStock.filas.map((x) => x.cod_linea));
  return filas.filter((l) => ok.has(l.cod_linea));
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
  const conLineas = deps.map((d) => {
    const set = new Map<string, Linea>();
    for (const l of lineas) if (l.departamento === d.slug) set.set(l.cod_linea, l);
    for (const e of extra) {
      const l = porCod.get(e.cod_linea);
      if (e.departamento === d.slug && l) set.set(l.cod_linea, l);
    }
    return { ...d, lineas: [...set.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")) };
  });
  return conLineas.filter((d) => d.lineas.length > 0);
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
  porPagina?: number;
}) {
  const porPagina = opts.porPagina ?? POR_PAGINA;
  const pagina = Math.max(1, opts.pagina ?? 1);
  const filtros = [...opts.filtros];
  // Solo se publican artículos con stock.
  filtros.push(CON_STOCK);
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

// ---------- Rubros de negocio ----------

export interface Rubro {
  slug: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  lineas: Linea[];
}

export const getRubros = cache(async (): Promise<Rubro[]> => {
  const [rubros, rel, lineas] = await Promise.all([
    consultar<Omit<Rubro, "lineas">>("rubros_negocio", {
      select: "slug,nombre,descripcion,orden",
      filtros: [{ op: "eq", col: "visible", val: true }],
      orden: [{ col: "orden" }],
      revalidar: 3600,
    }).then((r) => r.filas),
    consultar<{ rubro: string; cod_linea: string }>("rubro_negocio_linea", { revalidar: 3600 }).then((r) => r.filas),
    getLineas(),
  ]);
  const porCod = new Map(lineas.map((l) => [l.cod_linea, l]));
  return rubros.map((r) => ({
    ...r,
    lineas: rel
      .filter((x) => x.rubro === r.slug)
      .map((x) => porCod.get(x.cod_linea))
      .filter((l): l is Linea => !!l)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
  }));
});

export async function getRubro(slug: string) {
  return (await getRubros()).find((r) => r.slug === slug) ?? null;
}

// ---------- Inicio ----------

/** Productos por lista de códigos, respetando el orden de la lista. */
export async function getProductosPorCodigo(cods: string[]) {
  if (!cods.length) return [];
  const { filas } = await consultar<ProductoResumen>("productos", {
    select: COLS_RESUMEN,
    filtros: [{ op: "in", col: "cod_articulo", val: cods }, CON_STOCK],
  });
  const m = new Map(filas.map((p) => [p.cod_articulo, p]));
  return cods.map((c) => m.get(c)).filter((p): p is ProductoResumen => !!p);
}

/** Línea o colección con la foto de su producto con más stock. */
export async function getCategoriaConFoto(slug: string) {
  const linea = await getLinea(slug);
  const col = linea ? null : await getColeccion(slug);
  if (!linea && !col) return null;
  const filtro: Filtro = linea
    ? { op: "eq", col: "cod_linea", val: linea.cod_linea }
    : { op: "eq", col: "cod_familia", val: col!.cod_familia };
  const { filas } = await consultar<ProductoResumen>("productos", {
    select: "foto_url",
    filtros: [filtro, { op: "notnull", col: "foto_url" }, { op: "gt", col: "cant_dispon", val: 0 }],
    orden: [{ col: "cant_dispon", desc: true }],
    limite: 1,
    revalidar: 3600,
  });
  return { slug, nombre: (linea ?? col)!.nombre, foto: filas[0]?.foto_url ?? null };
}

// ---------- Beneficios (envío) ----------

/** Costo de envío más bajo de las zonas con delivery (para "Envío desde Gs. …"). */
export const getEnvioDesde = cache(async (): Promise<number | null> => {
  const { filas } = await consultar<{ costo_envio: number }>("localidades", {
    select: "costo_envio",
    filtros: [
      { op: "eq", col: "tipo", val: "envio" },
      { op: "gt", col: "costo_envio", val: 0 },
    ],
    orden: [{ col: "costo_envio" }],
    limite: 1,
    revalidar: 3600,
  });
  return filas[0]?.costo_envio ?? null;
});

// ---------- Banners (se cargan desde el panel) ----------

/** Banners vigentes del carrusel. Si no hay ninguno cargado, se muestran los espacios reservados. */
export const getBanners = cache(async (): Promise<Banner[]> => {
  const { filas } = await consultar<{ titulo: string; enlace: string; imagen_escritorio: string; imagen_celular: string | null }>("banners", {
    select: "titulo,enlace,imagen_escritorio,imagen_celular",
    orden: [{ col: "orden" }, { col: "id" }],
    revalidar: 300,
  }).catch(() => ({ filas: [] as { titulo: string; enlace: string; imagen_escritorio: string; imagen_celular: string | null }[] }));
  if (!filas.length) return BANNERS;
  return filas.map((b) => ({ titulo: b.titulo, href: b.enlace, imagen: b.imagen_escritorio, imagenCelular: b.imagen_celular ?? undefined }));
});
