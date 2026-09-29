import Link from "next/link";
import { Suspense } from "react";
import type { ProductoResumen, Orden } from "@/lib/data";
import ProductoTarjeta from "./ProductoTarjeta";
import OrdenSelector from "./OrdenSelector";

interface Props {
  filas: ProductoResumen[];
  total: number | null;
  pagina: number;
  paginas: number;
  orden: Orden;
  /** Ruta base sin query, p. ej. "/c/boligrafos" */
  base: string;
  /** Parámetros extra a conservar (p. ej. q en el buscador) */
  extra?: Record<string, string>;
}

function href(base: string, params: Record<string, string | number | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && !(k === "pagina" && v === 1) && !(k === "orden" && v === "relevancia")) {
      p.set(k, String(v));
    }
  }
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

export default function Listado({ filas, total, pagina, paginas, orden, base, extra = {} }: Props) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-suave">
          {total != null ? `${total.toLocaleString("es-PY")} producto${total === 1 ? "" : "s"}` : ""}
        </p>
        <Suspense fallback={null}>
          <OrdenSelector orden={orden} />
        </Suspense>
      </div>

      {filas.length === 0 ? (
        <p className="rounded-xl border border-borde bg-white p-8 text-center text-suave">No encontramos productos.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filas.map((p, i) => (
            <li key={p.cod_articulo} className="flex">
              <div className="flex w-full">
                <ProductoTarjeta p={p} prioridad={i < 4} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {paginas > 1 && (
        <nav aria-label="Páginas" className="mt-8 flex items-center justify-center gap-2">
          {pagina > 1 && (
            <Link rel="prev" href={href(base, { ...extra, orden, pagina: pagina - 1 })} className="rounded-lg border border-borde bg-white px-4 py-2 text-sm hover:border-marca">
              ← Anterior
            </Link>
          )}
          <span className="px-3 text-sm text-suave">
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas && (
            <Link rel="next" href={href(base, { ...extra, orden, pagina: pagina + 1 })} className="rounded-lg border border-borde bg-white px-4 py-2 text-sm hover:border-marca">
              Siguiente →
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
