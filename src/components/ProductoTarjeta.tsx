import Image from "next/image";
import Link from "next/link";
import type { ProductoResumen } from "@/lib/data";
import { SITE } from "@/lib/config";
import { disponibles, gs, linkWhatsApp, urlProducto } from "@/lib/format";

export default function ProductoTarjeta({ p, prioridad = false }: { p: ProductoResumen; prioridad?: boolean }) {
  const hayStock = (p.cant_dispon ?? 0) > 0;
  const url = urlProducto(p);
  const msg = hayStock
    ? `Hola RPM, quiero pedir: ${p.nombre} (cód. ${p.cod_articulo})`
    : `Hola RPM, quiero consultar disponibilidad de ${p.nombre} (cód. ${p.cod_articulo})`;
  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-borde bg-white transition hover:border-marca/40 hover:shadow-md">
      <Link href={url} className="relative block aspect-square w-full bg-white" tabIndex={-1} aria-hidden>
        {p.foto_url ? (
          <Image
            src={p.foto_url}
            alt=""
            fill
            sizes="(min-width: 1280px) 240px, (min-width: 768px) 25vw, 50vw"
            className="object-contain p-4 transition group-hover:scale-[1.03]"
            priority={prioridad}
          />
        ) : (
          <span className="flex h-full items-center justify-center bg-[#f3f4f7] text-xs text-suave">Sin foto</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-borde/70 p-3">
        <Link href={url} className="line-clamp-2 min-h-[2.6em] text-sm font-semibold leading-[1.3] text-texto hover:text-marca">
          {p.nombre}
        </Link>
        <span className="text-xs text-suave">Cód. {p.cod_articulo}</span>
        <span
          className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${hayStock ? "bg-ok/10 text-ok" : "bg-fondo text-suave"}`}
        >
          {hayStock ? `● ${disponibles(p.cant_dispon)}` : "Sin stock"}
        </span>
        <span className="font-titulo text-lg font-extrabold text-texto md:text-xl">{gs(p.precio_venta)}</span>
        <a
          href={linkWhatsApp(SITE.whatsapp, msg)}
          target="_blank"
          rel="noopener"
          className="mt-auto flex h-10 items-center justify-center rounded-lg bg-[#177a3b] text-sm font-bold text-white hover:bg-[#12662f]"
        >
          Pedir por WhatsApp
        </a>
      </div>
    </article>
  );
}
