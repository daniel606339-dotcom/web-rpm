import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getColeccion, getDepartamento, getLinea, listarProductos, parseOrden, parsePagina } from "@/lib/data";
import type { Filtro } from "@/lib/db";
import Migas from "@/components/Migas";
import Listado from "@/components/Listado";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** /c/{slug}: una línea del ERP o, si no existe, una colección (familia) heredada de Porta. */
async function resolver(slug: string) {
  const linea = await getLinea(slug);
  if (linea) {
    return {
      nombre: linea.nombre,
      departamento: linea.departamento,
      filtro: { op: "eq", col: "cod_linea", val: linea.cod_linea } as Filtro,
      seo_title: linea.seo_title,
      seo_description: linea.seo_description,
      texto: linea.texto,
    };
  }
  const col = await getColeccion(slug);
  if (col) {
    return {
      nombre: col.nombre,
      departamento: col.departamento,
      filtro: { op: "eq", col: "cod_familia", val: col.cod_familia } as Filtro,
      seo_title: col.seo_title,
      seo_description: col.seo_description,
      texto: col.texto,
    };
  }
  return null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const c = await resolver(slug);
  if (!c) return { title: "Categoría no encontrada" };
  const pagina = parsePagina(sp.pagina);
  return {
    title: c.seo_title ?? `${c.nombre} al por mayor${pagina > 1 ? ` – página ${pagina}` : ""}`,
    description:
      c.seo_description ??
      `Comprá ${c.nombre.toLowerCase()} para tu empresa en Paraguay. Precios mayoristas, stock actualizado y entrega. Pedí por WhatsApp o online.`,
    alternates: { canonical: pagina > 1 ? `/c/${slug}?pagina=${pagina}` : `/c/${slug}` },
  };
}

export default async function PaginaCategoria({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const c = await resolver(slug);
  if (!c) notFound();

  const orden = parseOrden(sp.orden);
  const [dep, lista] = await Promise.all([
    getDepartamento(c.departamento),
    listarProductos({ filtros: [c.filtro], pagina: parsePagina(sp.pagina), orden }),
  ]);

  return (
    <div className="contenedor py-4 md:py-6">
      <Migas items={[...(dep ? [{ nombre: dep.nombre, href: `/d/${dep.slug}` }] : []), { nombre: c.nombre }]} />
      <h1 className="mb-2 text-2xl font-bold md:text-3xl">{c.nombre}</h1>
      {c.texto && <p className="mb-4 max-w-3xl text-suave">{c.texto}</p>}
      <Listado {...lista} orden={orden} base={`/c/${slug}`} />
    </div>
  );
}
