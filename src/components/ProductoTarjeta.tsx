import Image from "next/image";
import Link from "next/link";
import type { ProductoResumen } from "@/lib/data";
import { gs, urlProducto } from "@/lib/format";

export default function ProductoTarjeta({ p, prioridad = false }: { p: ProductoResumen; prioridad?: boolean }) {
  const hayStock = (p.cant_dispon ?? 0) > 0;
  return (
    <Link
      href={urlProducto(p)}
      className="group flex flex-col overflow-hidden rounded-xl border border-borde bg-white transition hover:border-marca/40 hover:shadow-md"
    >
      <div className="relative aspect-square bg-white">
        {p.foto_url ? (
          <Image
            src={p.foto_url}
            alt={p.nombre}
            fill
            sizes="(min-width: 1280px) 220px, (min-width: 768px) 25vw, 50vw"
            className="object-contain p-3 transition group-hover:scale-[1.03]"
            priority={prioridad}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-suave">Sin foto</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-borde/60 p-3">
        {p.marca_nombre && <span className="text-xs font-semibold uppercase tracking-wide text-suave">{p.marca_nombre}</span>}
        <h3 className="line-clamp-2 text-sm leading-snug text-texto group-hover:text-marca">{p.nombre}</h3>
        <div className="mt-auto pt-2">
          <div className="text-lg font-bold text-marca">{gs(p.precio_venta)}</div>
          <div className={`text-xs font-medium ${hayStock ? "text-ok" : "text-suave"}`}>
            {hayStock ? "En stock" : "Consultar disponibilidad"}
          </div>
        </div>
      </div>
    </Link>
  );
}
