import type { Metadata } from "next";
import Link from "next/link";
import { getMenu } from "@/lib/data";
import Migas from "@/components/Migas";
import { IconoDepartamento } from "@/components/iconos";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Todas las categorías",
  description: "Librería, papelería, higiene, limpieza, empaque, cafetería, informática y más para empresas en Paraguay.",
  alternates: { canonical: "/categorias" },
};

export default async function Categorias() {
  const menu = await getMenu();
  return (
    <div className="contenedor py-4 md:py-6">
      <Migas items={[{ nombre: "Categorías" }]} />
      <h1 className="mb-5 text-2xl font-bold md:text-3xl">Todas las categorías</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menu.map((d) => (
          <section key={d.slug} className="rounded-xl border border-borde bg-white p-4">
            <Link href={`/d/${d.slug}`} className="mb-2 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-marca-suave text-marca">
                <IconoDepartamento slug={d.slug} className="size-5" />
              </span>
              <h2 className="text-lg font-bold hover:text-marca">{d.nombre}</h2>
            </Link>
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {d.lineas.map((l) => (
                <li key={l.slug}>
                  <Link href={`/c/${l.slug}`} className="text-sm text-suave hover:text-marca hover:underline">
                    {l.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
