"use client";

import Link from "next/link";
import { useState } from "react";
import { agregar, useCarrito } from "./carrito";
import { IconoWhatsApp } from "./iconos";
import { gs, linkWhatsApp } from "@/lib/format";

interface Props {
  cod: string;
  nombre: string;
  precio: number | null;
  foto: string | null;
  url: string;
  whatsapp: string;
  hayStock: boolean;
}

export default function AgregarCarrito({ cod, nombre, precio, foto, url, whatsapp, hayStock }: Props) {
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const items = useCarrito();
  const enCarrito = items.find((x) => x.cod === cod)?.cantidad ?? 0;

  const mensaje = `Hola RPM, quiero pedir:\n${cantidad} x ${nombre} (cód. ${cod})${precio ? ` – ${gs(precio)} c/u` : ""}`;

  return (
    <div className="space-y-3">
      <div className="flex items-stretch gap-3">
        <div className="flex items-center rounded-lg border border-borde bg-white">
          <button
            type="button"
            className="h-12 w-11 text-xl text-marca disabled:opacity-30"
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            disabled={cantidad <= 1}
            aria-label="Restar uno"
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
            className="h-12 w-14 border-x border-borde text-center font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Cantidad"
          />
          <button type="button" className="h-12 w-11 text-xl text-marca" onClick={() => setCantidad((c) => c + 1)} aria-label="Sumar uno">
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            agregar({ cod, nombre, precio, foto, url }, cantidad);
            setAgregado(true);
            // Evento para Google Tag Manager / Ads
            const w = window as unknown as { dataLayer?: unknown[] };
            w.dataLayer?.push({
              event: "add_to_cart",
              ecommerce: { currency: "PYG", value: (precio ?? 0) * cantidad, items: [{ item_id: cod, item_name: nombre, price: precio, quantity: cantidad }] },
            });
          }}
          className="h-12 flex-1 rounded-lg bg-acento px-5 font-bold text-white shadow-sm hover:bg-acento-oscuro"
        >
          Agregar al carrito
        </button>
      </div>

      {agregado && (
        <p className="flex items-center justify-between rounded-lg bg-ok/10 px-3 py-2 text-sm text-ok" role="status">
          <span>Agregado. Tenés {enCarrito} en el carrito.</span>
          <Link href="/carrito" className="font-semibold underline">
            Ver carrito
          </Link>
        </p>
      )}

      <a
        href={linkWhatsApp(whatsapp, hayStock ? mensaje : `Hola RPM, quiero consultar disponibilidad de ${nombre} (cód. ${cod}).`)}
        target="_blank"
        rel="noopener"
        className="flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-[#25d366] font-semibold text-[#128c4a] hover:bg-[#25d366]/10"
      >
        <IconoWhatsApp className="size-5" />
        {hayStock ? "Pedir por WhatsApp" : "Consultar por WhatsApp"}
      </a>
    </div>
  );
}
