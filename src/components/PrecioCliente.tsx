"use client";

import { gs } from "@/lib/format";
import { textoRegla, usePortal, usePrecioCliente } from "@/lib/portal";

/** Precio público, o el precio del cliente si hay una empresa con sesión iniciada. */
export function PrecioTarjeta({ cod, precio }: { cod: string; precio: number | null }) {
  const { cuenta } = usePortal();
  const p = usePrecioCliente(cod, 1);
  if (!cuenta || !p?.precio) return <span className="font-titulo text-lg font-extrabold text-texto md:text-xl">{gs(precio)}</span>;
  const distinto = p.precio_base != null && p.precio < p.precio_base;
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className="font-titulo text-lg font-extrabold text-marca md:text-xl">{gs(p.precio)}</span>
      {distinto && <span className="text-xs text-suave line-through">{gs(p.precio_base)}</span>}
      <span className="w-full text-[11px] font-semibold text-marca">{textoRegla(p)}</span>
    </span>
  );
}

/** Bloque de precio de la página de producto: precio del cliente y escalas por cantidad. */
export function PrecioProducto({ cod, precio }: { cod: string; precio: number | null }) {
  const { cuenta } = usePortal();
  const p1 = usePrecioCliente(cod, 1);
  const p6 = usePrecioCliente(cod, 6);
  const p12 = usePrecioCliente(cod, 12);
  if (!cuenta || !p1?.precio)
    return (
      <>
        <div className="text-3xl font-extrabold text-marca">{gs(precio)}</div>
        <div className="text-xs text-suave">IVA incluido</div>
      </>
    );
  const escalas = [
    { desde: 6, p: p6 },
    { desde: 12, p: p12 },
  ].filter((e) => e.p?.precio && e.p.precio < (p1.precio ?? 0));
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-marca">Tu precio · {cuenta.razon_social}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-marca">{gs(p1.precio)}</span>
        {p1.precio_base != null && p1.precio < p1.precio_base && <span className="text-sm text-suave line-through">{gs(p1.precio_base)}</span>}
      </div>
      <div className="text-xs text-suave">{textoRegla(p1)} · IVA incluido</div>
      {escalas.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2 text-xs">
          {escalas.map((e) => (
            <li key={e.desde} className="rounded-full bg-marca-suave px-2.5 py-1 font-semibold text-marca">
              {e.desde} o más: {gs(e.p!.precio)} c/u
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** "Mi cuenta" en el encabezado: muestra la empresa cuando hay sesión. */
export function EnlaceCuenta({ className = "" }: { className?: string }) {
  const { cuenta } = usePortal();
  return <span className={className}>{cuenta ? cuenta.razon_social.split(" ").slice(0, 2).join(" ") : "Mi cuenta"}</span>;
}
