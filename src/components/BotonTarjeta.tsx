"use client";

import Link from "next/link";
import { agregar, useCarrito } from "./carrito";
import { IconoWhatsApp } from "./iconos";
import { linkWhatsApp } from "@/lib/format";

interface Props {
  cod: string;
  nombre: string;
  precio: number | null;
  foto: string | null;
  url: string;
  stock: number;
  whatsapp: string;
}

/**
 * Botones de la tarjeta de producto: "Agregar al carrito" como acción principal (la web
 * empuja a comprar online) y un ícono de WhatsApp para consultas. Sin stock: consulta.
 */
export default function BotonTarjeta({ cod, nombre, precio, foto, url, stock, whatsapp }: Props) {
  const items = useCarrito();
  const enCarrito = items.find((x) => x.cod === cod)?.cantidad ?? 0;
  const hayStock = stock > 0 && (precio ?? 0) > 0;
  const lleno = enCarrito >= stock;

  const consulta = linkWhatsApp(
    whatsapp,
    hayStock ? `Hola RPM, tengo una consulta sobre ${nombre} (cód. ${cod}).` : `Hola RPM, quiero consultar disponibilidad de ${nombre} (cód. ${cod}).`,
  );

  if (!hayStock) {
    return (
      <a
        href={consulta}
        target="_blank"
        rel="noopener"
        className="mt-auto flex h-10 items-center justify-center gap-2 rounded-lg border-2 border-[#25d366] text-sm font-bold text-[#128c4a] hover:bg-[#25d366]/10"
      >
        <IconoWhatsApp className="size-4" /> Consultar disponibilidad
      </a>
    );
  }

  return (
    <div className="mt-auto flex gap-2">
      {enCarrito > 0 ? (
        <div className="flex h-10 flex-1 overflow-hidden rounded-lg border-2 border-acento text-sm font-bold">
          <button
            type="button"
            disabled={lleno}
            onClick={() => agregar({ cod, nombre, precio, foto, url, stock }, 1)}
            className="flex-1 text-acento hover:bg-acento/10 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Sumar uno de ${nombre}`}
          >
            + 1
          </button>
          <Link href="/carrito" className="flex flex-[2] items-center justify-center bg-acento text-white hover:bg-acento-oscuro">
            Ver carrito ({enCarrito})
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            agregar({ cod, nombre, precio, foto, url, stock }, 1);
            const w = window as unknown as { dataLayer?: unknown[] };
            w.dataLayer?.push({
              event: "add_to_cart",
              ecommerce: { currency: "PYG", value: precio ?? 0, items: [{ item_id: cod, item_name: nombre, price: precio, quantity: 1 }] },
            });
          }}
          className="h-10 flex-1 rounded-lg bg-acento text-sm font-bold text-white hover:bg-acento-oscuro"
        >
          Agregar al carrito
        </button>
      )}
      <a
        href={consulta}
        target="_blank"
        rel="noopener"
        aria-label={`Consultar por WhatsApp sobre ${nombre}`}
        title="Consultar por WhatsApp"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-borde text-[#128c4a] hover:border-[#25d366] hover:bg-[#25d366]/10"
      >
        <IconoWhatsApp className="size-5" />
      </a>
    </div>
  );
}
