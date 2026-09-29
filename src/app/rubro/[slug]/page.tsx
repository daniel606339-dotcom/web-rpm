import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRubro, listarProductos, parseOrden, parsePagina } from "@/lib/data";
import Migas from "@/components/Migas";
import Listado from "@/components/Listado";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pagina = parsePagina((await searchParams).pagina);
  const r = await getRubro(slug);
  if (!r) return { title: "Rubro no encontrado" };
  return {
    title: `Insumos para ${r.nombre.toLowerCase()}${pagina > 1 ? ` – página ${pagina}` : ""}`,
    description: `Todo lo que usan ${r.nombre.toLowerCase()} en Paraguay: ${r.descripcion?.toLowerCase() ?? ""}. Precios mayoristas y entrega.`,
    alternates: { canonical: pagina > 1 ? `/rubro/${slug}?pagina=${pagina}` : `/rubro/${slug}` },
  };
}

export default async function PaginaRubro({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const r = await getRubro(slug);
  if (!r) notFound();

  const orden = parseOrden(sp.orden);
  const lista = await listarProductos({
    filtros: [{ op: "in", col: "cod_linea", val: r.lineas.map((l) => l.cod_linea) }],
    pagina: parsePagina(sp.pagina),
    orden,
  });

  return (
    <div className="contenedor py-4 md:py-6">
      <Migas items={[{ nombre: "Tipo de negocio", href: "/rubro" }, { nombre: r.nombre }]} />
      <h1 className="mb-1 text-2xl font-bold md:text-3xl">{r.nombre}</h1>
      {r.descripcion && <p className="mb-4 text-suave">{r.descripcion}</p>}
      <ul className="scroll-x -mx-4 mb-6 flex gap-2 px-4 md:mx-0 md:flex-wrap md:px-0">
        {r.lineas.map((l) => (
          <li key={l.slug} className="shrink-0">
            <Link href={`/c/${l.slug}`} className="block rounded-full border border-borde bg-white px-4 py-2 text-sm hover:border-marca hover:text-marca">
              {l.nombre}
            </Link>
          </li>
        ))}
      </ul>
      <Listado {...lista} orden={orden} base={`/rubro/${slug}`} />
    </div>
  );
}
