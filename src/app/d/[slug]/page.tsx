import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDepartamento, listarProductos, parseOrden, parsePagina } from "@/lib/data";
import Migas from "@/components/Migas";
import Listado from "@/components/Listado";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pagina = parsePagina((await searchParams).pagina);
  const d = await getDepartamento(slug);
  if (!d) return { title: "Departamento no encontrado" };
  return {
    title: `${d.nombre} para empresas${pagina > 1 ? ` – página ${pagina}` : ""}`,
    description: `Artículos de ${d.nombre.toLowerCase()} para empresas en Paraguay: ${d.lineas
      .slice(0, 6)
      .map((l) => l.nombre.toLowerCase())
      .join(", ")} y más.`,
    alternates: { canonical: pagina > 1 ? `/d/${slug}?pagina=${pagina}` : `/d/${slug}` },
  };
}

export default async function PaginaDepartamento({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const d = await getDepartamento(slug);
  if (!d) notFound();

  const orden = parseOrden(sp.orden);
  const lista = await listarProductos({
    filtros: [{ op: "in", col: "cod_linea", val: d.lineas.map((l) => l.cod_linea) }],
    pagina: parsePagina(sp.pagina),
    orden,
  });

  return (
    <div className="contenedor py-4 md:py-6">
      <Migas items={[{ nombre: d.nombre }]} />
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">{d.nombre}</h1>

      <ul className="scroll-x -mx-4 mb-6 flex gap-2 px-4 md:mx-0 md:flex-wrap md:px-0">
        {d.lineas.map((l) => (
          <li key={l.slug} className="shrink-0">
            <Link
              href={`/c/${l.slug}`}
              className="block rounded-full border border-borde bg-white px-4 py-2 text-sm hover:border-marca hover:text-marca"
            >
              {l.nombre}
            </Link>
          </li>
        ))}
      </ul>

      <Listado {...lista} orden={orden} base={`/d/${slug}`} />
    </div>
  );
}
