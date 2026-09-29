import Link from "next/link";
import { getMenu, getLineas, listarProductos } from "@/lib/data";
import { SITE } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";
import ProductoTarjeta from "@/components/ProductoTarjeta";
import Banners from "@/components/Banners";

export const revalidate = 900;

// Líneas que se muestran como filas en el inicio (por slug). Editar a gusto.
const LINEAS_INICIO = ["resmas", "boligrafos", "detergentes", "film-plasticos"];

export default async function Inicio() {
  const [menu, lineas] = await Promise.all([getMenu(), getLineas()]);
  const filas = await Promise.all(
    LINEAS_INICIO.map(async (slug) => {
      const l = lineas.find((x) => x.slug === slug);
      if (!l) return null;
      const r = await listarProductos({ filtros: [{ op: "eq", col: "cod_linea", val: l.cod_linea }], soloStock: true, porPagina: 10 });
      return r.filas.length ? { linea: l, productos: r.filas } : null;
    }),
  );

  return (
    <>
      <Banners />

      <section className="contenedor mt-8">
        <h2 className="mb-4 text-xl font-bold md:text-2xl">Comprá por departamento</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {menu.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/d/${d.slug}`}
                className="flex h-full flex-col justify-between rounded-xl border border-borde bg-white p-4 transition hover:border-marca hover:shadow-md"
              >
                <span className="font-semibold text-marca">{d.nombre}</span>
                <span className="mt-2 line-clamp-2 text-xs text-suave">
                  {d.lineas
                    .slice(0, 4)
                    .map((l) => l.nombre)
                    .join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {filas.map(
        (f) =>
          f && (
            <section key={f.linea.slug} className="contenedor mt-10">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-xl font-bold md:text-2xl">{f.linea.nombre}</h2>
                <Link href={`/c/${f.linea.slug}`} className="text-sm font-semibold text-marca hover:underline">
                  Ver todos
                </Link>
              </div>
              <ul className="scroll-x -mx-4 flex gap-3 px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:px-0">
                {f.productos.map((p) => (
                  <li key={p.cod_articulo} className="flex w-44 shrink-0 lg:w-auto">
                    <ProductoTarjeta p={p} />
                  </li>
                ))}
              </ul>
            </section>
          ),
      )}

      <section className="contenedor mt-12">
        <div className="grid items-center gap-6 rounded-2xl bg-marca p-6 text-white md:grid-cols-[1fr_auto] md:p-10">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">¿Comprás para tu empresa?</h2>
            <p className="mt-2 max-w-xl text-white/80">
              Mandanos tu lista y te preparamos un presupuesto con precios por volumen, factura legal y entrega programada.
            </p>
          </div>
          <a
            href={linkWhatsApp(SITE.whatsapp, "Hola RPM, quiero pedir un presupuesto para mi empresa.")}
            target="_blank"
            rel="noopener"
            className="rounded-lg bg-acento px-6 py-4 text-center font-bold hover:bg-acento-oscuro"
          >
            Pedir presupuesto
          </a>
        </div>
      </section>
    </>
  );
}
