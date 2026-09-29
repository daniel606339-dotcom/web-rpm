import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";
import Migas from "@/components/Migas";

/**
 * Páginas informativas. Texto pendiente: completar "texto" de cada una.
 * Mientras esté vacío, la página no se indexa y muestra un aviso.
 */
const PAGINAS: Record<string, { titulo: string; texto?: string }> = {
  "formas-de-entrega": { titulo: "Formas de entrega" },
  "medios-de-pago": { titulo: "Medios de pago" },
  "politicas-de-devolucion": { titulo: "Políticas de devolución" },
  nosotros: { titulo: "Nosotros" },
  "trabaja-con-nosotros": { titulo: "Trabajá con nosotros" },
};

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(PAGINAS).map((slug) => ({ slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = PAGINAS[(await params).slug];
  return { title: p?.titulo, robots: p?.texto ? undefined : { index: false, follow: true } };
}

export default async function Info({ params }: Props) {
  const p = PAGINAS[(await params).slug];
  if (!p) notFound();
  return (
    <div className="contenedor py-4 md:py-6">
      <Migas items={[{ nombre: p.titulo }]} />
      <article className="max-w-3xl rounded-2xl border border-borde bg-white p-6 md:p-8">
        <h1 className="mb-4 text-2xl font-bold md:text-3xl">{p.titulo}</h1>
        {p.texto ? (
          <div className="whitespace-pre-line leading-relaxed">{p.texto}</div>
        ) : (
          <p className="text-suave">
            Estamos preparando esta sección. Consultanos por{" "}
            <a href={linkWhatsApp(SITE.whatsapp, `Hola RPM, quiero consultar sobre ${p.titulo.toLowerCase()}.`)} className="font-semibold text-marca underline">
              WhatsApp
            </a>
            .
          </p>
        )}
      </article>
    </div>
  );
}
