"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cambiarCantidad, quitar, useCarrito, vaciar, type ItemCarrito } from "@/components/carrito";
import { gs } from "@/lib/format";
import { precioCliente, sb, textoRegla, type Cuenta, type PrecioCliente } from "@/lib/portal";

/** Precios del cliente para los ítems del carrito (cambian con la cantidad por las escalas). */
export function usePreciosCarrito(items: ItemCarrito[]) {
  const clave = items.map((x) => `${x.cod}:${x.cantidad}`).join(",");
  const [r, setR] = useState<{ clave: string; precios: Record<string, PrecioCliente | null> }>({ clave: "", precios: {} });
  useEffect(() => {
    let vivo = true;
    Promise.all(items.map((x) => precioCliente(x.cod, x.cantidad).then((p) => [x.cod, p] as const))).then(
      (pares) => vivo && setR({ clave, precios: Object.fromEntries(pares) }),
    );
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);
  const listo = r.clave === clave;
  const total = items.reduce((s, x) => s + (r.precios[x.cod]?.precio ?? 0) * x.cantidad, 0);
  const sinPrecio = listo && items.some((x) => !r.precios[x.cod]?.precio);
  return { precios: r.precios, listo, total, sinPrecio };
}

export default function CarritoPortal({ cuenta }: { cuenta: Cuenta }) {
  const items = useCarrito();
  const { precios, listo, total, sinPrecio } = usePreciosCarrito(items);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function guardar() {
    const nombre = prompt("Nombre para este carrito (ej.: Compra mensual oficina):");
    if (!nombre?.trim()) return;
    setGuardando(true);
    const { error } = await sb.rpc("guardar_carrito", {
      p_nombre: nombre.trim(),
      p_items: items.map((x) => ({ cod: x.cod, cantidad: x.cantidad })),
    });
    setGuardando(false);
    setAviso(error ? `No se pudo guardar: ${error.message}` : `Carrito "${nombre.trim()}" guardado. Lo encontrás en Mi cuenta.`);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-borde bg-white p-10 text-center">
        <p className="mb-4 text-suave">Tu carrito está vacío.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/" className="inline-block rounded-lg bg-acento px-5 py-3 font-semibold text-white">
            Ver productos
          </Link>
          <Link href="/empresas" className="inline-block rounded-lg border border-borde px-5 py-3 font-semibold">
            Mis pedidos y carritos guardados
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-borde overflow-hidden rounded-2xl border border-borde bg-white">
        {items.map((x) => {
          const p = precios[x.cod];
          return (
            <li key={x.cod} className="flex gap-3 p-3 md:p-4">
              <Link href={x.url} className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-borde bg-white">
                {x.foto && <Image src={x.foto} alt="" fill sizes="80px" className="object-contain p-1" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Link href={x.url} className="line-clamp-2 text-sm hover:text-marca">
                  {x.nombre}
                </Link>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center rounded-lg border border-borde">
                    <button className="h-9 w-9 text-lg text-marca" onClick={() => cambiarCantidad(x.cod, x.cantidad - 1)} aria-label="Restar uno">
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{x.cantidad}</span>
                    <button
                      className="h-9 w-9 text-lg text-marca disabled:opacity-30"
                      onClick={() => cambiarCantidad(x.cod, x.cantidad + 1)}
                      disabled={x.stock != null && x.cantidad >= x.stock}
                      aria-label="Sumar uno"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{p?.precio ? gs(p.precio * x.cantidad) : listo ? "Sin precio" : "…"}</div>
                    {p?.precio && (
                      <div className="text-xs text-suave">
                        {gs(p.precio)} c/u · {textoRegla(p)}
                      </div>
                    )}
                    <button onClick={() => quitar(x.cod)} className="text-xs text-suave underline hover:text-acento">
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit space-y-4 rounded-2xl border border-borde bg-white p-4 lg:sticky lg:top-32">
        <p className="text-sm">
          Comprando como <b>{cuenta.razon_social}</b>
        </p>
        <div className="flex items-baseline justify-between">
          <span className="text-suave">Total</span>
          <span className="text-2xl font-extrabold text-marca">{listo ? gs(total) : "…"}</span>
        </div>
        <p className="-mt-2 text-xs text-suave">Con tus precios y condiciones. IVA incluido.</p>
        {sinPrecio && <p className="rounded-lg bg-[#fff1d6] p-2 text-xs text-[#7a4b00]">Algún artículo no tiene precio para tu cuenta: quitalo o consultá a tu vendedor.</p>}
        <Link
          href="/empresas/pedido"
          aria-disabled={!listo || sinPrecio}
          className={`flex h-12 items-center justify-center rounded-lg bg-acento font-bold text-white hover:bg-acento-oscuro ${!listo || sinPrecio ? "pointer-events-none opacity-50" : ""}`}
        >
          Continuar con el pedido
        </Link>
        <button onClick={guardar} disabled={guardando} className="h-11 w-full rounded-lg border border-borde text-sm font-semibold hover:border-marca">
          {guardando ? "Guardando…" : "Guardar este carrito para repetirlo"}
        </button>
        {aviso && <p className="text-xs text-suave">{aviso}</p>}
        <button onClick={vaciar} className="text-xs text-suave underline">
          Vaciar carrito
        </button>
      </aside>
    </div>
  );
}
