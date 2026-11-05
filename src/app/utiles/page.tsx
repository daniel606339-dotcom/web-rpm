import type { Metadata } from "next";
import { SITE } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";
import { getColegiosUtiles } from "@/lib/utiles";
import { IconoWhatsApp } from "@/components/iconos";
import BuscadorColegios from "./BuscadorColegios";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Listas de útiles escolares",
  description:
    "Buscá la lista de útiles de tu colegio y grado, sacá lo que ya tenés y reservá el resto en Distribuidora RPM. Precio al instante, retiro en el local o delivery en Asunción.",
  alternates: { canonical: "/utiles" },
};

export default async function Pagina() {
  const colegios = await getColegiosUtiles();
  return (
    <div className="contenedor space-y-6 py-6 md:py-10">
      <header className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-extrabold text-titulo md:text-4xl">Listas de útiles escolares</h1>
        <p className="text-lg text-suave">
          Elegí el colegio y el grado: te mostramos la lista con precio y stock. Destildás lo que ya tenés en casa y reservás el resto.
        </p>
      </header>

      <BuscadorColegios colegios={colegios} />

      <section className="flex flex-col gap-3 rounded-2xl border border-borde bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-bold">¿Tu colegio no está?</p>
          <p className="text-suave">Mandanos la foto o el PDF de la lista por WhatsApp y te pasamos el presupuesto.</p>
        </div>
        <a
          href={linkWhatsApp(SITE.whatsapp, "Hola RPM, quiero presupuesto de una lista de útiles. Les mando la foto de la lista.")}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#177a3b] px-5 font-bold text-white"
        >
          <IconoWhatsApp className="size-5" /> Enviar mi lista
        </a>
      </section>
    </div>
  );
}
