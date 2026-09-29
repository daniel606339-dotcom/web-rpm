import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { consultar, type Filtro } from "@/lib/db";
import { CON_STOCK, getColecciones, getMenu, getRubros } from "@/lib/data";
import { urlProducto } from "@/lib/format";

export const revalidate = 3600;

async function todos<T>(tabla: string, select: string, filtros: Filtro[] = []) {
  const filas: T[] = [];
  // PostgREST devuelve como máximo 1000 filas por pedido: paginar.
  for (let desde = 0; desde < 50000; desde += 1000) {
    const r = await consultar<T>(tabla, { select, filtros, orden: [{ col: select.split(",")[0] }], limite: 1000, desde, revalidar: 3600 });
    filas.push(...r.filas);
    if (r.filas.length < 1000) break;
  }
  return filas;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [menu, colecciones, productos, marcas, rubros] = await Promise.all([
    getMenu(),
    getColecciones(),
    todos<{ cod_articulo: string; nombre: string; slug: string | null; cant_dispon: number | null }>(
      "productos",
      "cod_articulo,nombre,slug,cant_dispon",
      [CON_STOCK],
    ),
    todos<{ slug: string }>("marcas", "slug", [{ op: "eq", col: "publicar", val: true }]),
    getRubros(),
  ]);

  const u = (p: string) => `${SITE.url}${p}`;
  const lineas = new Set(menu.flatMap((d) => d.lineas.map((l) => l.slug)));

  return [
    { url: u("/"), changeFrequency: "daily", priority: 1 },
    { url: u("/categorias"), changeFrequency: "weekly", priority: 0.6 },
    { url: u("/rubro"), changeFrequency: "weekly", priority: 0.6 },
    ...["formas-de-entrega", "politicas-de-devolucion", "nosotros"].map((s) => ({ url: u(`/info/${s}`), changeFrequency: "monthly" as const, priority: 0.3 })),
    ...rubros.map((r) => ({ url: u(`/rubro/${r.slug}`), changeFrequency: "daily" as const, priority: 0.7 })),
    ...menu.map((d) => ({ url: u(`/d/${d.slug}`), changeFrequency: "daily" as const, priority: 0.8 })),
    ...[...lineas].map((s) => ({ url: u(`/c/${s}`), changeFrequency: "daily" as const, priority: 0.8 })),
    ...colecciones.map((c) => ({ url: u(`/c/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...marcas.map((m) => ({ url: u(`/m/${m.slug}`), changeFrequency: "weekly" as const, priority: 0.5 })),
    ...productos.map((p) => ({
      url: u(urlProducto(p)),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
