import type { Metadata } from "next";
import Link from "next/link";
import { getRubros } from "@/lib/data";
import Migas from "@/components/Migas";
import { IconoRubro } from "@/components/iconos";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Comprá por tipo de negocio",
  description: "Insumos para oficinas, colegios, restaurantes, clínicas, industrias y hoteles en Paraguay.",
  alternates: { canonical: "/rubro" },
};

export default async function Rubros() {
  const rubros = await getRubros();
  return (
    <div className="contenedor py-4 md:py-6">
      <Migas items={[{ nombre: "Tipo de negocio" }]} />
      <h1 className="mb-5 text-2xl font-bold md:text-3xl">Comprá por tipo de negocio</h1>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rubros.map((r) => (
          <li key={r.slug}>
            <Link href={`/rubro/${r.slug}`} className="flex h-full items-start gap-4 rounded-xl border border-borde bg-white p-4 hover:border-marca hover:shadow-md">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-marca-suave text-marca">
                <IconoRubro slug={r.slug} />
              </span>
              <span>
                <span className="block font-bold text-titulo">{r.nombre}</span>
                <span className="mt-1 block text-sm text-suave">{r.descripcion}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
