import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { anioEscolar, esReferencia, getListaUtiles } from "@/lib/utiles";
import EditorLista from "./EditorLista";

export const revalidate = 900;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ colegio: string; grado: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { colegio, grado } = await params;
  const l = await getListaUtiles(colegio, grado);
  if (!l) return { title: "Lista no encontrada" };
  const titulo = `Lista de útiles ${l.grado} – ${l.colegio}`;
  const descripcion = `Lista de útiles de ${l.grado} del ${l.colegio} con precio y stock. Sacá lo que ya tenés y reservá el resto en Distribuidora RPM.`;
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/utiles/${l.colegio_slug}/${l.grado_slug}` },
    openGraph: { title: titulo, description: descripcion, locale: "es_PY", type: "website" },
  };
}

export default async function Pagina({ params }: Props) {
  const { colegio, grado } = await params;
  const l = await getListaUtiles(decodeURIComponent(colegio), decodeURIComponent(grado));
  if (!l) notFound();
  const referencia = esReferencia(l.anio);
  return (
    <div className="contenedor py-6 md:py-10">
      <nav className="mb-3 text-sm text-suave">
        <Link href="/utiles" className="text-marca hover:underline">
          Listas de útiles
        </Link>{" "}
        / {l.colegio_corto ?? l.colegio}
      </nav>
      <header className="mb-5 max-w-3xl">
        <h1 className="text-2xl font-extrabold text-titulo md:text-3xl">
          {l.grado} · {l.colegio}
        </h1>
        <p className="mt-1 text-suave">
          {referencia ? "" : `Lista ${l.anio}. `}Ya está todo marcado: destildá lo que tenés en casa y ajustá cantidades. El total se actualiza al instante.
          {l.fuente_url && (
            <>
              {" "}
              <a href={l.fuente_url} target="_blank" rel="noopener nofollow" className="text-marca underline">
                Ver la lista original del colegio
              </a>
              .
            </>
          )}
        </p>
      </header>
      {referencia && (
        <div className="mb-5 max-w-3xl rounded-xl border border-acento/30 bg-acento/5 p-4 text-sm">
          <p className="font-bold text-titulo">
            Esta es la lista {l.anio}: el colegio todavía no publicó la de {anioEscolar()}.
          </p>
          <p className="mt-1 text-suave">
            Sirve para tener una idea del presupuesto; suele cambiar poco de un año a otro. Apenas salga la lista nueva la actualizamos. Si ya
            la tenés, mandala por WhatsApp y te pasamos el presupuesto exacto.
          </p>
        </div>
      )}
      <EditorLista lista={l} />
    </div>
  );
}
