import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarca, listarProductos, parseOrden, parsePagina } from "@/lib/data";
import Migas from "@/components/Migas";
import Listado from "@/components/Listado";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pagina = parsePagina((await searchParams).pagina);
  const m = await getMarca(slug);
  if (!m) return { title: "Marca no encontrada" };
  return {
    title: m.seo_title ?? `Productos ${m.nombre}${pagina > 1 ? ` – página ${pagina}` : ""}`,
    description: m.seo_description ?? `Productos ${m.nombre} para empresas en Paraguay, con precio y stock actualizados.`,
    alternates: { canonical: pagina > 1 ? `/m/${slug}?pagina=${pagina}` : `/m/${slug}` },
  };
}

export default async function PaginaMarca({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const m = await getMarca(slug);
  if (!m) notFound();

  const orden = parseOrden(sp.orden);
  const lista = await listarProductos({
    filtros: [{ op: "eq", col: "cod_marca", val: m.cod_marca }],
    pagina: parsePagina(sp.pagina),
    orden,
  });

  return (
    <div className="contenedor py-4 md:py-6">
      <Migas items={[{ nombre: "Marcas" }, { nombre: m.nombre }]} />
      <h1 className="mb-2 text-2xl font-bold md:text-3xl">{m.nombre}</h1>
      {m.texto && <p className="mb-4 max-w-3xl text-suave">{m.texto}</p>}
      <Listado {...lista} orden={orden} base={`/m/${slug}`} />
    </div>
  );
}
