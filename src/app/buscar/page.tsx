import type { Metadata } from "next";
import { filtroBusqueda, listarProductos, parseOrden, parsePagina } from "@/lib/data";
import { limpiarBusqueda } from "@/lib/db";
import Listado from "@/components/Listado";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function texto(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v ?? "").slice(0, 80).trim();
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = texto((await searchParams).q);
  return {
    title: q ? `Resultados para "${q}"` : "Catálogo",
    // Las páginas de resultados no se indexan (evita contenido duplicado).
    robots: { index: false, follow: true },
  };
}

export default async function Buscar({ searchParams }: Props) {
  const sp = await searchParams;
  const q = texto(sp.q);
  const orden = parseOrden(sp.orden);
  const valido = limpiarBusqueda(q).length > 0;

  const lista = await listarProductos({
    filtros: valido ? [filtroBusqueda(q)] : [],
    pagina: parsePagina(sp.pagina),
    orden,
  });

  return (
    <div className="contenedor py-4 md:py-6">
      <h1 className="mb-4 text-2xl font-bold">{q ? <>Resultados para “{q}”</> : "Catálogo completo"}</h1>
      <Listado {...lista} orden={orden} base="/buscar" extra={q ? { q } : {}} />
    </div>
  );
}
