"use client";

import Image from "next/image";
import Link from "next/link";
import { cambiarCantidad, quitar, totalCarrito, useCarrito, vaciar } from "@/components/carrito";
import { IconoWhatsApp } from "@/components/iconos";
import { SITE } from "@/lib/config";
import { gs, linkWhatsApp } from "@/lib/format";

// Monto para envío gratis (Gs.). Vacío u 0 = no se muestra la barra.
const MINIMO_ENVIO = Number(process.env.NEXT_PUBLIC_MINIMO_ENVIO_GRATIS ?? 0);

export default function CarritoVista() {
  const items = useCarrito();
  const total = totalCarrito(items);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-borde bg-white p-10 text-center">
        <p className="mb-4 text-suave">Tu carrito está vacío.</p>
        <Link href="/" className="inline-block rounded-lg bg-acento px-5 py-3 font-semibold text-white">
          Ver productos
        </Link>
      </div>
    );
  }

  const mensaje =
    "Hola RPM, quiero hacer este pedido:\n" +
    items.map((x) => `• ${x.cantidad} x ${x.nombre} (cód. ${x.cod})${x.precio ? ` – ${gs(x.precio * x.cantidad)}` : ""}`).join("\n") +
    `\n\nTotal estimado: ${gs(total)}`;

  const falta = MINIMO_ENVIO > 0 ? Math.max(0, MINIMO_ENVIO - total) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-borde overflow-hidden rounded-2xl border border-borde bg-white">
        {items.map((x) => (
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
                  <button className="h-9 w-9 text-lg text-marca" onClick={() => cambiarCantidad(x.cod, x.cantidad + 1)} aria-label="Sumar uno">
                    +
                  </button>
                </div>
                <div className="text-right">
                  <div className="font-bold">{gs((x.precio ?? 0) * x.cantidad)}</div>
                  <button onClick={() => quitar(x.cod)} className="text-xs text-suave underline hover:text-acento">
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit space-y-4 rounded-2xl border border-borde bg-white p-4 lg:sticky lg:top-32">
        {MINIMO_ENVIO > 0 && (
          <div>
            <p className="mb-2 text-sm">
              {falta > 0 ? (
                <>
                  Te faltan <b>{gs(falta)}</b> para envío gratis
                </>
              ) : (
                <b className="text-ok">¡Tenés envío gratis!</b>
              )}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-fondo">
              <div className="h-full bg-ok transition-all" style={{ width: `${Math.min(100, (total / MINIMO_ENVIO) * 100)}%` }} />
            </div>
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <span className="text-suave">Total</span>
          <span className="text-2xl font-extrabold text-marca">{gs(total)}</span>
        </div>
        <a
          href={linkWhatsApp(SITE.whatsapp, mensaje)}
          target="_blank"
          rel="noopener"
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#25d366] font-bold text-white hover:brightness-95"
        >
          <IconoWhatsApp className="size-5" /> Enviar pedido por WhatsApp
        </a>
        <button disabled className="h-12 w-full cursor-not-allowed rounded-lg bg-acento/40 font-bold text-white" title="Próximamente">
          Pagar online (próximamente)
        </button>
        <p className="text-xs text-suave">Precios sujetos a confirmación de stock. Un vendedor te confirma el pedido y la entrega.</p>
        <button onClick={vaciar} className="text-xs text-suave underline">
          Vaciar carrito
        </button>
      </aside>
    </div>
  );
}
